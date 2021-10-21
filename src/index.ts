#! /usr/bin/env node
import * as fs from 'fs';
import { dirname, join, resolve, extname } from 'path';
import { parseSync, stringifySync, Format } from 'subtitle';

const argv = require('minimist')(process.argv.slice(2));
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');
const version = pkg.version;

interface IArguments {
    // User Input
    input: string;
    output: string;
    overwrite: boolean;
    clean: boolean;
    debug: boolean;
    version: boolean;
    help: boolean;
    nocheck: boolean;
    silent: boolean;

    // Set by code, do not change
    ext: string;
    directory: string;
}

class Subclean {
    public args = {
        input: '',
        output: '',
        overwrite: false,
        clean: false,
        debug: false,
        version: version,
        help: false,
        nocheck: false,
        silent: false,
        directory: '',
        ext: 'srt'
    };

    private fd: string;
    private blacklist: string[];
    private supported: string[] = ['srt', 'vtt'];
    private loaded: string[];

    constructor() {
        this.blacklist = [];
        this.loaded = [];
        this.fd = join(__dirname, '../filters');
    }

    init() {
        this.prepare();
        this.validate();
        this.clean();
    }

    log(msg: any) {
        if (!this.args.silent) {
            console.log(msg);
        }
    }

    /**
     * Kill the script after printing an error
     * @param e Error Message
     */
    kill(e: string, err = true) {
        this.log((err ? '[Error] ' : '') + `${e}`);
        process.exit(0);
    }

    help() {
        // TODO: Format this better
        this.kill(
            [
                '|---------------------------------------------------------------------------|',
                '|---------------------------  subclean arguments ---------------------------|',
                '|---------------------------------------------------------------------------|',
                '| --input       | ( -i ) | The file you want to clean                       |',
                '| --output      | ( -o ) | Where the cleaned subtitle file will be written  |',
                '| --overwrite   | ( -w ) | Overwrite the output file if it already exists   |',
                '| --clean       | ( -c ) | Delete the input file before writing the output  |',
                '| --debug       |        | Display extra debugging information              |',
                '| --version     | ( -v ) | Print the current package version                |',
                "| --help        |        | Show the text you're reading now                 |",
                "| --no-check    | ( -n ) | Don't check for a new package version            |",
                '| --silent      | ( -s ) | Silent mode. Nothing logged to console           |',
                '|---------------------------------------------------------------------------|',
                '|         Example: subclean subtitle.srt -o cleaned.en.srt                  |',
                '|---------------------------------------------------------------------------|'
            ].join('\n'),
            false
        );
    }

    /**
     * Prepare the arguments and defaults
     */
    prepare() {
        if (argv.help) this.help();
        // Parse the required arguments from short or long parameters
        // TODO: Map arg types instead of !!
        this.args = {
            input: argv._.shift() || argv.i || argv['input'] || '',
            output: argv.o || argv['output'] || '',
            overwrite: !!argv.w || !!argv.overwrite,
            clean: !!argv.c || !!argv.clean,
            debug: !!argv.debug,
            help: !!argv.help,
            nocheck: !!argv.n || !!argv['no-check'],
            silent: !!argv.silent || !!argv.s,
            version: !!argv.version || !!argv.v
        } as IArguments;

        // Debugging
        if (this.args.debug) {
            this.log(JSON.stringify(this.args));
            this.log(JSON.stringify(argv));
        }

        if (!this.args.nocheck) {
            const notifier = updateNotifier({ pkg, updateCheckInterval: 1000 * 60 * 60 });
            if (notifier.update) {
                this.log(`[Info] Update available: ${pkg.version} -> ${notifier.update.latest}`);
                this.log('[Info] https://github.com/DrKain/subclean/releases');
            }
        }

        if (this.args.version) {
            return this.kill('You are using subclean@' + pkg.version, false);
        }

        // Make sure the user actually passed an input file
        if (this.args.input === '') {
            return this.kill('Missing arguments. Use --help for details', true);
        }
    }

    /**
     * Attempt to validate files and arguments
     */
    validate() {
        // Resolve input
        this.args.input = resolve(this.args.input);

        // Detect the directory and file extension
        this.args.directory = dirname(this.args.input);
        this.args.ext = extname(this.args.input).substr(1);

        if (!this.supported.includes(this.args.ext)) {
            this.kill(`Subtitle format ${this.args.ext} not supported.`, true);
        }

        // If an output file is not set, generate a default path
        if (this.args.output === '') {
            // You will still need to enable --overwrite to overwrite the file
            this.args.output = this.args.input;
        }

        // Make sure the input file exists
        if (!fs.existsSync(this.args.input)) {
            this.kill('Input file does not exist');
        }

        // Make sure it's not a directory
        if (fs.statSync(this.args.input).isDirectory()) {
            this.kill('Input file was detected to be a directory');
        }

        // Prevent accidentally overwriting a file
        if (fs.existsSync(this.args.output) && this.args.overwrite === false) {
            this.kill(`Ouput file already exists. Pass -w to overwrite`);
        }

        if (this.args.debug) this.log('Arguments validated');
    }

    /**
     * Load all the items in a blacklist filter into the current blacklist
     * TODO: Unload? Maybe.
     * @param filter Name of the blacklist filter
     */
    loadBlacklist(filter: string) {
        if (this.loaded.includes(filter)) return;
        try {
            const items = JSON.parse(fs.readFileSync(join(this.fd, `${filter}.json`), 'utf-8'));

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
     * Add your own items to the blacklist. Currently not used.
     * Needs to be passed a file name to read
     * @param items Array of stings
     */
    public addBlacklistItems(items: string[]) {
        this.blacklist = [...this.blacklist, ...items];
        this.log(`[Filter] Added ${items.length} custom blacklist items`);
    }

    /**
     * Clean the subtitle file, then write the output
     */
    clean() {
        // Load the blacklist
        this.loadBlacklist('main');
        this.loadBlacklist('users');

        // Parse the subtitle file
        let fileData = fs.readFileSync(this.args.input, 'utf-8');

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
                        if (this.args.debug) {
                            this.log(`[Match] [Debug] ${node.data.text}`);
                        } else {
                            this.log(`[Match] Advertising found in node ${index} (${mark})`);
                            hits++;
                        }
                        node.data.text = '';
                    }
                } else {
                    if (node.data.text.toLowerCase().includes(mark)) {
                        if (this.args.debug) {
                            this.log(`[Match] [Debug] ${node.data.text}`);
                        } else {
                            this.log(`[Match] Advertising found in node ${index} (${mark})`);
                            hits++;
                        }
                        node.data.text = '';
                    }
                }
            });
        });

        // Remove input file
        if (this.args.clean) fs.unlinkSync(this.args.input);

        // Stringify cleaned subtitles
        const cleaned = stringifySync(nodes, {
            format: this.args.ext as Format
        });

        // Write the file
        if (hits > 0) {
            fs.writeFileSync(this.args.output, cleaned);
            this.log(`[Done] Removed ${hits} node(s) and wrote to ${this.args.output}`);
        } else {
            this.log('[Done] No advertising found');
        }
    }
}

new Subclean().init();
