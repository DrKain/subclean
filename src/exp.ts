#! /usr/bin/env node
import { statSync, existsSync, readdirSync } from 'fs';
import { dirname, join, resolve, extname } from 'path';
import { parseSync, stringifySync, Format } from 'subtitle';
import { IArguments } from './interface';

const argv = require('minimist')(process.argv.slice(2));
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');
const version = pkg.version;

class SubClean {
    public args: IArguments;
    public fd: string;
    public blacklist: string[];
    public supported: string[];
    public loaded: string[];
    public queue: string[];

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
            sweep: argv.sweep || null
        } as IArguments;

        this.fd = join(__dirname, '../filters');
        this.blacklist = [];
        this.supported = ['srt', 'vtt'];
        this.loaded = [];
        this.queue = [];
    }

    public getFiles(dir: string): Promise<string[]> {
        return new Promise(async (done) => {
            const subdirs = readdirSync(dir);
            const files: string[] = [];

            subdirs.map(async (subdir) => {
                const res = resolve(dir, subdir);
                let data = statSync(res).isDirectory() ? await this.getFiles(res) : [res];
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

    public help() {
        this.kill('Not yet');
    }

    public async prepare() {
        // Display help message
        if (this.args.help) this.help();

        // Notify if there's a new update
        if (!this.args.nocheck) {
            const notifier = updateNotifier({ pkg, updateCheckInterval: 1000 * 60 * 60 });
            if (notifier.update) {
                this.log(`[Info] Update available: ${pkg.version} -> ${notifier.update.latest}`);
                this.log('[Info] https://github.com/DrKain/subclean/releases');
            }
        }

        // Log the current version. Duh
        if (this.args.version) {
            return this.kill('You are using subclean@' + pkg.version, false);
        }

        // Fetch files for multi-cleaning
        if (this.args.sweep) {
            this.args.overwrite = true;
            this.args.sweep = resolve(this.args.sweep);
            if (!existsSync(this.args.sweep)) this.kill(`${this.args.sweep} is not a valid path`);
            this.log(`Scanning for subtitle files. This may take a few minutes with large collections`);
            this.queue = await this.getFiles(this.args.sweep);
            this.log(`Found ${this.queue.length} subtitle files`);
        } else {
            // Display an error if the user did not specify an input file
            if (this.args.input === '') {
                return this.kill('Missing arguments. Use --help for details', true);
            }
        }

        // Debugging
        if (this.args.debug) {
            this.log(this.args);
            this.log(argv);
            this.log(this.queue);
        }
    }

    public async init() {
        await this.prepare();
    }
}

new SubClean().init();
