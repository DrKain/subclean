#! /usr/bin/env node
import { statSync, existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'fs';
import { dirname, join, resolve, extname, basename } from 'path';
import { parseSync, stringifySync, Format, NodeList } from 'subtitle';
import { IArguments, IFE, INode } from './interface';
import { help_text } from './help';
import { get } from 'https';

const getEncoding = require('detect-file-encoding-and-language');
const argv = require('minimist')(process.argv.slice(2));
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');

class SubClean {
    public args: IArguments;
    public fd: string;
    public blacklist: string[];
    public supported: string[];
    public loaded: string[];
    public queue: IArguments[];

    // For debugging
    private actions_count: number = 0;
    private nodes_count: number = 0;
    private filter_count: number = 0;
    private log_data: string = '';

    constructor() {
        this.args = {
            input: argv._.shift() || argv.i || argv['input'] || '',
            output: argv.o || argv['output'] || '',
            overwrite: argv.w || argv.overwrite || false,
            clean: argv.c || argv.clean || false,
            debug: argv.debug || false,
            help: argv.help || false,
            nocheck: argv.n || argv['no-check'] || false,
            silent: argv.silent || argv.s || false,
            version: argv.version || argv.v || false,
            update: argv.update || false,
            sweep: argv.sweep || '',
            depth: argv.depth ?? 10,
            ne: argv['ne'] || true,
            lang: argv['lang'] || '',

            nochains: argv.nochains || false,
            testing: argv.testing || false,
            uf: argv.uf || 'default'
        } as IArguments;

        if (typeof this.args.sweep !== 'string') {
            this.args.sweep = '.';
        }

        if (this.args.testing === true) {
            this.log('[Info] Testing is enabled! File will not be saved');
        }

        this.fd = join(__dirname, '../filters');
        this.blacklist = [];
        this.supported = ['srt', 'vtt'];
        this.loaded = [];
        this.queue = [];
    }

    /**
     *
     * @param dir Top level directory to get files in
     * @param depth How many sub-directories to look through
     * @returns
     */
    public getFiles(dir: string, depth = 5): Promise<string[]> {
        return new Promise(async (done) => {
            const subdirs = readdirSync(dir);
            const files: string[] = [];

            subdirs.map(async (subdir) => {
                const res = resolve(dir, subdir);
                let data = [];

                // let sdata = statSync(res).isDirectory() ? await this.getFiles(res) : [res];
                if (statSync(res).isDirectory()) {
                    data = depth > 0 ? await this.getFiles(res, depth - 1) : [];
                } else {
                    data = [res];
                }

                // Filter out files that are not supported subtitles
                for (let item of data) {
                    if (this.supported.includes(extname(item).substr(1))) {
                        files.push(item);
                    }
                }
            });

            return done(files);
        });
    }

    /**
     * Log a message to the console, only if subclean is not in silent mode
     * @param msg Message
     */
    public log(msg: any) {
        if (!this.args.silent) console.log(msg);
        this.log_data += `${msg}\n`;
    }

    /**
     * Kill the script after printing an error
     * @param e Error Message
     */
    public kill(e: string, err = true) {
        this.log((err ? '[Error] ' : '') + `${e}`);
        process.exit(0);
    }

    // TODO: Auto-generate help text
    public help() {
        this.kill(help_text, false);
    }

    /**
     * Add a file (with config) to the queue.
     * A check will be made to ensure it is not already in the queue
     * @param config
     * @returns
     */
    public addToQueue(config: IArguments) {
        let exists = this.queue.find((item) => item.input === config.input);
        if (exists) return this.log(`[Error] Duplicate in queue '${config.input}'`);
        else {
            config.directory = dirname(config.input);
            config.ext = extname(config.input).substr(1);
            this.queue.push(config);
        }
    }

    /**
     * This is where files will be fetched and arguments validated
     * Extra information that might be needed for cleaning will also be filled
     * @returns
     */
    public async prepare() {
        try {
            // Display help message
            if (this.args.help) this.help();

            // Download filters
            if (this.args.update) {
                await this.updateFilters();
                this.kill('[Info] Updated all filters', false);
            }

            // Notify if there's a new update
            if (!this.args.nocheck) {
                const notifier = updateNotifier({ pkg, updateCheckInterval: 1000 * 60 * 60 });

                if (notifier.update) {
                    this.log(`[Info] Update available: ${pkg.version} -> ${notifier.update.latest}`);
                    this.log('[Info] https://github.com/DrKain/subclean/releases');
                }
            }

            // Log the current version
            if (this.args.version) {
                return this.kill('You are using subclean@' + pkg.version, false);
            }

            // Just in case
            if (typeof this.args.depth !== 'number') this.args.depth = 10;
            if (this.args.depth > 25) this.args.depth = 25;
            if (this.args.depth < 0) this.args.depth = 1;

            // Not really wildcard support, more of a shortcut
            // TODO: Custom regex match for getFiles() to properly support wildcards
            if (this.args.input === '*') {
                this.args.depth = 1;
                this.args.sweep = '.';
            }

            // Extract language codes
            if (this.args.input !== '') {
                const filename = basename(this.args.input);
                const match = filename.match(/\.(\w+)\.srt$/);
                if (match) {
                    this.log(`[Info] Language codes matched: ${match}`);
                    this.args.lang = match[1];
                }
            }

            // Fetch files for multi-cleaning
            if (this.args.sweep) {
                // Validate the sweep directory exists
                this.args.sweep = resolve(this.args.sweep);

                if (this.args.debug) {
                    this.log('[Info] Sweep target: ' + this.args.sweep);
                    this.log('[Info] Depth: ' + this.args.depth);
                }

                if (!existsSync(this.args.sweep)) this.kill(`${this.args.sweep} is not a valid path`, true);

                // Fetch files and add them to the queue
                this.log(`[Info] Scanning for subtitle files. This may take a few minutes with large collections`);
                let files = await this.getFiles(this.args.sweep, this.args.depth);
                for (let file of files) {
                    this.addToQueue({ ...this.args, overwrite: true, input: file, output: file });
                }

                // Log how many items were added
                this.log(`[Info] Added ${this.queue.length} files to the queue`);
            } else {
                // Display an error if the user did not specify an input file
                if (this.args.input === '') {
                    return this.kill('Missing arguments. Use --help for details', true);
                }

                // If an output file is not set, generate a default path
                if (this.args.output === '') {
                    // You will still need to enable --overwrite to overwrite the file
                    this.args.output = this.args.input;
                }

                // Make sure the input file exists
                if (!existsSync(this.args.input)) {
                    this.kill('Input file does not exist', true);
                }

                // Make sure it's not a directory
                if (statSync(this.args.input).isDirectory()) {
                    this.kill(
                        'Input file was detected to be a directory. Please use --sweep "path/to/media" to clean whole directories.',
                        true
                    );
                }

                // Prevent accidentally overwriting a file
                if (existsSync(this.args.output) && this.args.overwrite === false) {
                    this.kill(`Ouput file already exists. Pass -w to overwrite`, true);
                }

                this.addToQueue(this.args);
            }
        } catch (error) {
            this.kill(`${error}`, true);
        }
    }

    private writeLogs() {
        try {
            const target = join(this.getPath(), 'logs', 'latest.txt');
            this.saveFile(this.log_data, target);
        } catch (error) {
            console.log(`[error] ${error}`);
        }
    }

    /**
     * Load all the items in a blacklist filter into the current blacklist
     * @param file Target blacklist file
     */
    public loadBlacklist(file: string) {
        let target = join(this.fd, `${file}.json`);

        if (this.loaded.includes(file)) return;
        try {
            // We want to use appdata for this if possible
            let internal = false;
            target = join(this.getPath(), 'filters', file);
            if (!target.endsWith('.json')) target += '.json';

            // Let people know where subclean is looking for
            if (this.args.debug && this.args.uf === 'appdata') {
                this.log('[Debug] Checking: ' + target);
            }

            // If the appdata file doesn't exist, use the internal filters
            if (!existsSync(target) || this.args.uf === 'internal') {
                target = join(this.fd, `${file}.json`);
                internal = true;
            }

            // If it still doesn't exist, return
            if (!existsSync(target)) {
                if (file !== 'custom') this.log('[Info] Unable to locate filter: ' + file);
                return;
            }

            const items = JSON.parse(readFileSync(target, 'utf-8'));

            this.blacklist = [...this.blacklist, ...items];
            this.loaded.push(file);

            if (this.args.debug) {
                this.filter_count += items.length;
                this.log(`[Filter] [${internal ? 'int' : 'app'}] Added ${items.length} items from filter '${file}'`);
            }
        } catch (e) {
            this.log('[Error] Failed to load a filter: ' + file);
        }
    }

    private getFileEncoding(input: string): Promise<IFE> {
        return new Promise((resolve) => {
            try {
                getEncoding(input).then((data: IFE) => resolve(data));
            } catch (error) {
                this.log(`[Error] ${error}`);
                resolve({
                    encoding: 'unknown',
                    language: 'unknown',
                    confidence: { encoding: 0, language: 0 }
                });
            }
        });
    }

    private fixEncoding(path: string): Promise<boolean> {
        return new Promise((resolve) => {
            try {
                let data = readFileSync(path);
                writeFileSync(path, data, { encoding: 'ascii' });
                resolve(true);
            } catch (error) {
                resolve(false);
            }
        });
    }

    /**
     * Clean a subtitle file using the desired config
     * @param item Queue item
     * @returns IArguments
     */
    public cleanFile(item: IArguments): Promise<IArguments> {
        return new Promise(async (done, reject) => {
            try {
                // Check encoding and language of the file
                const { encoding, language }: IFE = await this.getFileEncoding(item.input);
                this.log(`[Info] Encoding: ${encoding}, Language: ${language}`);

                // re-encode if it's an unsupported format
                if (encoding !== 'ascii') {
                    this.log(`[Info] Fixing encoding. ${encoding} to ascii`);
                    await this.fixEncoding(item.input);
                }

                // Parse the subtitle file
                let fileData = readFileSync(item.input, { encoding: 'ascii' });

                const nodes: INode[] = parseSync(fileData) as INode[];
                let hits = 0;

                // For debugging
                this.nodes_count += nodes.length;

                // To avoid duplicates
                const codes: string[] = [];
                for (const c of item.lang.split(',')) {
                    if (!codes.includes(c) && c.length === 2) codes.push(c);
                }

                // Loop through each language and try to load the filters
                if (codes.length > 0) {
                    if (this.args.debug) this.log('[Info] Attempting to load language filters: ' + codes.join(','));
                    for (const code of codes) {
                        const filter = `${code}-main.json`;
                        this.loadBlacklist(filter);
                    }
                }

                // Remove ads
                nodes.forEach((node: INode, index: number) => {
                    this.blacklist.forEach((mark: any) => {
                        let regex = null;
                        this.actions_count++;
                        const text = node.data.text;

                        /**
                         * Clean chained nodes based on current match
                         * https://github.com/DrKain/subclean/pull/20
                         */
                        const handle_chain = (): { nodes: string[]; range: string } => {
                            const removed = [];
                            let range = `${index + 1}-${index + 1}`;

                            if (index > 0 && item.nochains) {
                                const prev = nodes[index - 1];

                                if (text.includes(prev.data.text)) {
                                    for (let i = index - 1; i > 0; i--) {
                                        const check = nodes[i].data.text;
                                        if (check.length === 0) continue; // Ignore empty string nodes
                                        if (!text.includes(check)) break; // Chain stopped

                                        hits++;
                                        removed.push(nodes[i].data.text);

                                        range = `${index + 1 - removed.length}-${index + 1}`;
                                        nodes[i].data.text = '';
                                    }
                                }
                            }

                            return { nodes: removed, range };
                        };

                        // Clean the current node
                        const clean = () => {
                            // Requires --nochains param
                            const chain = handle_chain();

                            if (chain.nodes.length > 1) {
                                this.log(`[Match] Chain found at ${chain.range} (${mark})`);
                                hits += chain.nodes.length;
                            } else {
                                this.log(`[Match] Advertising found in node ${index + 1} (${mark})`);
                                hits++;
                                node.data.text = '';
                            }

                            // Log the line for debugging
                            if (this.args.debug) this.log('[Line] ' + text);
                        };

                        if (mark.startsWith('/') && mark.endsWith('/')) {
                            // remove first and last characters
                            regex = new RegExp(mark.substring(1, mark.length - 1), 'i');
                            if (regex.exec(text)) clean();
                        } else {
                            // Plain text matches
                            if (node.data.text.toLowerCase().includes(mark)) clean();
                        }
                    });
                });

                // Remove empty nodes when requested
                if (this.args.ne) {
                    const deleted_nodes: number[] = [];
                    nodes.forEach((node: any, index) => {
                        if (node.data.text === '') {
                            deleted_nodes.push(index + 1);
                            delete nodes[index];
                        }
                    });
                    // Only log if we actually deleted nodes
                    if (deleted_nodes.length > 0) {
                        this.log(`[Info] Removed empty nodes: ${deleted_nodes.join(', ')}`);
                    }
                }

                // Remove input file
                if (item.clean && this.args.testing == false) {
                    unlinkSync(item.input);
                }

                // Stringify cleaned subtitles
                const cleaned = stringifySync(nodes as NodeList, { format: item.ext as Format });

                // Write cleaned file
                if (this.args.testing === false) {
                    this.saveFile(cleaned, item.output, true);
                }

                if (hits > 0) this.log(`[Done] Removed ${hits} node(s) and wrote to ${item.output}`);
                else this.log('[Done] No advertising found\n');

                if (this.args.debug) {
                    this.log('[Debug] ' + this.actions_count.toLocaleString() + ' checks');
                    this.log('[Debug] ' + this.filter_count.toLocaleString() + ' filters applied');
                    this.log('[Debug] ' + this.nodes_count.toLocaleString() + ' text nodes');
                    this.writeLogs();
                }

                // Resolve the promise
                done(item);
            } catch (error) {
                if (`${error}`.includes('expected timestamp at')) {
                    this.log(`[Error] Unable to parse "${item.input}"`);
                    this.log(`[Error] Please create an issue on GitHub with a copy of this file.\n`);
                }
                reject(error);
            }
        });
    }

    public getPath() {
        let target = '';

        // NOTE: This was suggested by github co-pilot and is untested.
        switch (process.platform) {
            case 'win32':
                target = join(process.env.APPDATA ?? process.env.LOCALAPPDATA ?? '', 'subclean');
                break;
            case 'darwin':
                target = join(process.env.HOME ?? '', 'Library', 'Application Support', 'subclean');
                break;
            default:
                target = join(process.env.HOME ?? '', 'subclean');
                break;
        }

        return target;
    }

    public saveFile(data: string, location: string, to_utf8: boolean = false): Promise<any> {
        return new Promise(async (resolve) => {
            try {
                this.log('[Info] Save file: ' + location);
                writeFileSync(location, data);
                resolve(true);
            } catch (error) {
                this.log('[error] Failed to save: ' + error);
                resolve(false);
            }
        });
    }

    public downloadFilter(name: string) {
        return new Promise((resolve) => {
            let url = `https://raw.githubusercontent.com/DrKain/subclean/main/filters/${name}.json`;
            let save_to = join(this.getPath(), 'filters', `${name}.json`);
            let current = 0;

            if (existsSync(save_to)) current = statSync(save_to).size;

            get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', async () => {
                    // If the filter does not exist, delete the file
                    if (data.includes('404: Not Found')) {
                        this.log('[Info] 404 from filter, deleting ' + name);
                        unlinkSync(save_to);
                        resolve(false);
                    } else {
                        await this.saveFile(data, save_to);

                        if (statSync(save_to).size !== current) {
                            this.log(`[Info] Downloaded new filters for: ${name}`);
                        }

                        resolve(name);
                    }
                });
            }).on('error', (err) => {
                this.log(`[Error] ${err}`);
                resolve(false);
            });
        });
    }

    private ensureDirs() {
        let $app = this.getPath();
        let $filters = join($app, 'filters');
        let $logs = join($app, 'logs');
        // Ensure user directories exist
        if (!existsSync($app)) mkdirSync($app);
        if (!existsSync($filters)) mkdirSync($filters);
        if (!existsSync($logs)) mkdirSync($logs);
    }

    public async updateFilters() {
        return new Promise(async (resolve) => {
            let $app = this.getPath();
            let $filters = join($app, 'filters');

            // Filters to download
            let queue = ['main', 'users'];

            // To de-dupe filter queue
            const dedupe = (arr: any[]) => {
                return arr.filter((value: any, index: any, a: string | any[]) => a.indexOf(value) === index);
            };

            try {
                // Make sure the appdata dir exists
                this.ensureDirs();

                // Check for existing filters and add them to the queue
                const files = readdirSync($filters);
                for (const file of files) queue.push(file.replace('.json', ''));

                // Add custom language filters
                // To download, pass --lang=de with the --update param
                const codes: string[] = [];
                for (const c of this.args.lang.split(',')) {
                    if (!codes.includes(c) && c.length === 2) codes.push(c);
                }
                for (const c of codes) queue.push(`${c}-main`);
                if (codes.length > 0) this.log('[Info] Received language codes: ' + codes.join(','));

                // De-dupe the queue
                queue = dedupe(queue);
                this.log('[Info] Filter download queue: ' + queue.join(','));

                // Loop through the queue and download the filters
                for (const file of queue) {
                    if (file !== 'custom') {
                        const result = await this.downloadFilter(file.replace('.json', ''));
                        if (!result) this.log('[Info] Filter download failed: ' + file);
                        else this.log('[Info] Updated filter: ' + file);
                    }
                }

                resolve(1);
            } catch (error) {
                this.log(`[Error] ${error}`);
                resolve(0);
            }
        });
    }

    public async init() {
        this.ensureDirs();
        // Load the blacklist
        this.loadBlacklist('main');
        this.loadBlacklist('users');
        this.loadBlacklist('custom');
        // Prepare files
        await this.prepare();

        if (this.queue.length > 1) this.log('[Info] Starting queue...\n');

        for (let index in this.queue) {
            let item = this.queue[index];

            // If in debug mode, log the full path
            let name = basename(item.input);
            if (this.args.debug) name = item.input;

            // If we are only cleaning one file, don't log the queue details
            if (this.queue.length > 1) {
                this.log(`[Clean] [${+index + 1}/${this.queue.length}] Cleaning "${name}"`);
            }

            try {
                await this.cleanFile(item);
            } catch (error) {
                this.log(`[Error] ${error}`);
            }
        }
    }
}

new SubClean().init();
