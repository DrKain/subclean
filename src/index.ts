#! /usr/bin/env node
import { statSync, existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'fs';
import { dirname, join, resolve, extname, basename } from 'path';
import { parseSync, stringifySync, Format } from 'subtitle';
import { help_text } from './help';
import { get } from 'https';
import { IArguments } from './interface';

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
            depth: argv.depth ?? 10
        } as IArguments;

        if (typeof this.args.sweep !== 'string') {
            this.args.sweep = '.';
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
                    this.kill('Input file was detected to be a directory', true);
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

    /**
     * Load all the items in a blacklist filter into the current blacklist
     * TODO: Move filters to appdata
     * TODO: Support for custom filters, also in appdata
     * @param filter Name of the blacklist filter
     */
    public loadBlacklist(filter: string) {
        if (this.loaded.includes(filter)) return;
        try {
            // We want to use appdata for this if possible
            let target = join(this.getPath(), 'filters', `${filter}.json`);

            // If the appdata file doesn't exist, use the internal filters
            if (!existsSync(target)) target = join(this.fd, `${filter}.json`);

            // If it still doesn't exist, return
            if (!existsSync(target)) {
                if (filter !== 'custom') {
                    this.log('[Info] Unable to locate filter: ' + filter);
                }
                return;
            }

            const items = JSON.parse(readFileSync(target, 'utf-8'));

            this.blacklist = [...this.blacklist, ...items];
            this.loaded.push(filter);

            if (this.args.debug) {
                this.log(`[Filter] Added ${items.length} items from filter ${filter}`);
            }
        } catch (e) {
            this.log('[Error] Failed to load a filter: ' + filter);
        }
    }

    /**
     * Clean a subtitle file using the desired config
     * @param item Queue item
     * @returns IArguments
     */
    public cleanFile(item: IArguments): Promise<IArguments> {
        return new Promise((done, reject) => {
            try {
                // Parse the subtitle file
                let fileData = readFileSync(item.input, 'utf-8');

                // Remove all cases of \r (parser can not handle these)
                fileData = fileData.replace(/\r/g, ' ');

                const nodes = parseSync(fileData);
                let hits = 0;

                // Remove ads
                nodes.forEach((node: any, index) => {
                    this.blacklist.forEach((mark: any) => {
                        let regex = null;

                        if (mark.startsWith('^')) {
                            regex = new RegExp(mark, 'i');
                            if (regex.exec(node.data.text)) {
                                this.log(`[Match] Advertising found in node ${index} (${mark})`);
                                hits++;
                                node.data.text = '';
                            }
                        } else {
                            if (node.data.text.toLowerCase().includes(mark)) {
                                this.log(`[Match] Advertising found in node ${index} (${mark})`);
                                hits++;
                                node.data.text = '';
                            }
                        }
                    });
                });

                // Remove input file
                if (item.clean) unlinkSync(item.input);

                // Stringify cleaned subtitles
                const cleaned = stringifySync(nodes, { format: item.ext as Format });

                // Write cleaned file
                writeFileSync(item.output, cleaned);

                if (hits > 0) this.log(`[Done] Removed ${hits} node(s) and wrote to ${item.output}\n`);
                else this.log('[Done] No advertising found\n');

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

    public downloadFilter(name: string) {
        return new Promise((resolve) => {
            let url = `https://raw.githubusercontent.com/DrKain/subclean/main/filters/${name}.json`;
            let save_to = join(this.getPath(), 'filters', `${name}.json`);
            let current = 0;

            if (existsSync(save_to)) current = statSync(save_to).size;

            get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => {
                    writeFileSync(save_to, data);

                    if (statSync(save_to).size !== current) {
                        this.log(`[Info] Downloaded new filters for: ${name}`);
                    }

                    resolve(name);
                });
            }).on('error', (err) => {
                this.log(`[Error] ${err}`);
                resolve(false);
            });
        });
    }

    public async updateFilters() {
        let $app = this.getPath();
        let $filters = join($app, 'filters');

        try {
            // Ensure user directories exist
            if (!existsSync($app)) mkdirSync($app);
            if (!existsSync($filters)) mkdirSync($filters);

            // Download both filters
            await this.downloadFilter('main');
            await this.downloadFilter('users');
        } catch (error) {
            this.log(`[Error] ${error}`);
        }
    }

    public async init() {
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

            this.log(`[${+index + 1}/${this.queue.length}] Cleaning "${name}"`);
            try {
                await this.cleanFile(item);
            } catch (error) {
                this.log(`[Error] ${error}`);
            }
        }
    }
}

new SubClean().init();
