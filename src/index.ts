#! /usr/bin/env node
import * as fs from 'fs';
import { dirname, join, resolve, extname } from 'path';
import { parseSync, stringifySync } from 'subtitle';

const argv = require('minimist')(process.argv.slice(2));

class Subclean {
    public args: any;
    private fd: string;
    private blacklist: string[];
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

    /**
     * Kill the script after printing an error
     * @param e Error Message
     */
    kill(e: string, err = true) {
        if (err) console.error(`[Error] ${e}`);
        else console.log(e);
        process.exit(0);
    }

    help() {
        this.kill([
            '|---------------------------------------------------------------------------|',
            '|---------------------------  subclean arguments ---------------------------|',
            '|---------------------------------------------------------------------------|',
            '| --input-file  | ( -i ) | The file you want to clean                       |',
            '| --output-file | ( -o ) | Where the cleaned subtitle file will be written  |',
            '| --continue    | ( -c ) | Overwrite the output file if it already exists   |',
            '| --ci          |        | Delete the input file before writing the output  |',
            '| --debug       |        | Display extra debugging information              |',
            '| --help        |        | Show the text you\'re reading now                |',
            '|---------------------------------------------------------------------------|',
            '|         Example: subclean subtitle.srt -o cleaned.en.srt                  |',
            '|---------------------------------------------------------------------------|'
        ].join('\n'), false)
    }

    /**
     * Prepare the arguments and defaults
     */
    prepare() {
        if (!argv._.length && !argv.i) {
            if (argv.help) this.help();
            else this.kill('Missing arguments');
        }

        // Parse the required arguments from short or long parameters
        this.args = {
            input: argv._.shift() || argv.i || argv['input-file'] || '',
            output: argv.o || argv['output-file'] || '',
            continue: argv.c || argv.continue || false,
            directory: argv.d || '',
            ext: '.srt',
            filter: argv.filter || argv.f || 'main',
            ci: argv.ci || false,
            debug: argv.debug || false,
        };

        if (this.args.debug) console.log('prepared arguments');
    }

    /**
     * Attempt to validate files and arguments
     */
    validate() {
        // Resolve input
        this.args.input = resolve(this.args.input);

        // Detect the directory and file extension
        this.args.directory = dirname(this.args.input);
        this.args.ext = extname(this.args.input);

        // If an output file is not set, generate a default path
        if (this.args.output === '') {
            this.args.output = join(
                this.args.directory,
                `output${this.args.ext}`
            );
        }

        // Use -debug
        if (this.args.debug) {
            console.log(argv);
            console.log(this.args);
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
        if (fs.existsSync(this.args.output) && this.args.continue === false) {
            this.kill(`Ouput file already exists. Use -c to overwrite`);
        }

        // Make sure the filter file exists
        if (!fs.existsSync(join(this.fd, `${this.args.filter}.json`))) {
            this.kill(`Unable to find the filter: ${this.args.filter}`);
        }

        if (this.args.debug) console.log('arguments validated');
    }

    /**
     * Load all the items in a blacklist filter into the current blacklist
     * TODO: Unload? Maybe.
     * @param filter Name of the blacklist filter
     */
    loadBlacklist(filter: string) {
        if (this.loaded.includes(filter)) return;
        try {

            const items = JSON.parse(
                fs.readFileSync(join(this.fd, `${filter}.json`), 'utf-8')
            )
            this.blacklist = [...this.blacklist, ...items];
            this.loaded.push(filter);

            if (this.args.debug) {
                console.log(`[Filter] Added ${items.length} items from filter ${filter}`);
            }
        } catch (e) {
            console.log('[Error] Failed to load a filter: ' + filter);
        }
    }

    /**
     * Add your own items to the blacklist. Currently not used. 
     * Needs to be passed a file name to read
     * @param items Array of stings
     */
    public addBlacklistItems(items: string[]) {
        this.blacklist = [...this.blacklist, ...items];
        console.log(`[Filter] Added ${items.length} custom blacklist items`);
    }

    /**
     * Clean the subtitle file, then write the output
     */
    clean() {
        // Load the blacklist
        this.loadBlacklist('main');
        this.loadBlacklist('users');
        this.loadBlacklist(this.args.filter);

        // Parse the subtitle file
        const nodes = parseSync(fs.readFileSync(this.args.input, 'utf-8'));

        // Remove ads
        nodes.forEach((node: any, index) => {
            this.blacklist.forEach((mark: any) => {
                let regex = null;

                if (mark.startsWith('^')) {
                    regex = new RegExp(mark, 'i');
                    if (regex.exec(node.data.text)) {
                        if (this.args.debug) {
                            console.log(`[Match] [Debug] ${node.data.text}`);
                        } else {
                            console.log(`[Match] Advertising found in node ${index} (${mark})`);
                        }
                        node.data.text = '';
                    }
                } else {
                    if (node.data.text.toLowerCase().includes(mark)) {
                        if (this.args.debug) {
                            console.log(`[Match] [Debug] ${node.data.text}`);
                        } else {
                            console.log(`[Match] Advertising found in node ${index} (${mark})`);
                        }
                        node.data.text = '';
                    }
                }
            });
        });

        // Remove input file
        if (this.args.ci) fs.unlinkSync(this.args.input);

        // Stringify cleaned subtitles
        const cleaned = stringifySync(nodes, {
            format: this.args.ext.replace(/./g, ''),
        });

        // Write the file
        fs.writeFileSync(this.args.output, cleaned);
        console.log(`[Done] Wrote to ${this.args.output}`);
    }
}

new Subclean().init();
