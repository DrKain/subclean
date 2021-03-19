#! /usr/bin/env node
"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path_1 = require("path");
var subtitle_1 = require("subtitle");
var argv = require('minimist')(process.argv.slice(2));
var updateNotifier = require('update-notifier');
var pkg = require('../package.json');
var version = pkg.version;
var notifier = updateNotifier({
    pkg: pkg,
    updateCheckInterval: 1000 * 60 * 60
});
var Subclean = /** @class */ (function () {
    function Subclean() {
        this.args = {
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
            ext: 'srt',
        };
        this.supported = ['srt', 'vtt'];
        this.blacklist = [];
        this.loaded = [];
        this.fd = path_1.join(__dirname, '../filters');
    }
    Subclean.prototype.init = function () {
        this.prepare();
        this.validate();
        this.clean();
    };
    Subclean.prototype.log = function (msg) {
        if (!this.args.silent) {
            console.log(msg);
        }
    };
    /**
     * Kill the script after printing an error
     * @param e Error Message
     */
    Subclean.prototype.kill = function (e, err) {
        if (err === void 0) { err = true; }
        this.log((err ? '[Error] ' : '') + ("" + e));
        process.exit(0);
    };
    Subclean.prototype.help = function () {
        this.kill([
            '|---------------------------------------------------------------------------|',
            '|---------------------------  subclean arguments ---------------------------|',
            '|---------------------------------------------------------------------------|',
            '| --input       | ( -i ) | The file you want to clean                       |',
            '| --output      | ( -o ) | Where the cleaned subtitle file will be written  |',
            '| --overwrite   | ( -w ) | Overwrite the output file if it already exists   |',
            '| --clean       | ( -c ) | Delete the input file before writing the output  |',
            '| --debug       |        | Display extra debugging information              |',
            '| --version     | ( -v ) | Print the current package version                |',
            '| --help        |        | Show the text you\'re reading now                 |',
            '| --no-check    | ( -n ) | Don\'t check for a new package version            |',
            '| --silent      | ( -s ) | Silent mode. Nothing logged to console           |',
            '|---------------------------------------------------------------------------|',
            '|         Example: subclean subtitle.srt -o cleaned.en.srt                  |',
            '|---------------------------------------------------------------------------|'
        ].join('\n'), false);
    };
    /**
     * Prepare the arguments and defaults
     */
    Subclean.prototype.prepare = function () {
        if (argv.help)
            this.help();
        // Parse the required arguments from short or long parameters
        this.args = {
            input: (argv._.shift() || argv.i || argv['input'] || ''),
            output: (argv.o || argv['output'] || ''),
            overwrite: (!!argv.w || !!argv.overwrite),
            clean: (!!argv.c || !!argv.clean),
            debug: (!!argv.debug),
            help: (!!argv.help),
            nocheck: (!!argv.n || !!argv['no-check']),
            silent: (!!argv.silent || !!argv.s),
            version: (!!argv.version || !!argv.v)
        };
        // Debugging
        if (this.args.debug) {
            this.log(JSON.stringify(this.args));
            this.log(JSON.stringify(argv));
        }
        if (!this.args.nocheck) {
            if (notifier.update) {
                this.log("[Info] Update available: " + pkg.version + " -> " + notifier.update.latest);
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
    };
    /**
     * Attempt to validate files and arguments
     */
    Subclean.prototype.validate = function () {
        // Resolve input
        this.args.input = path_1.resolve(this.args.input);
        // Detect the directory and file extension
        this.args.directory = path_1.dirname(this.args.input);
        this.args.ext = path_1.extname(this.args.input).substr(1);
        if (!this.supported.includes(this.args.ext)) {
            this.kill("Subtitle format " + this.args.ext + " not supported.", true);
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
            this.kill("Ouput file already exists. Pass -w to overwrite");
        }
        if (this.args.debug)
            this.log('Arguments validated');
    };
    /**
     * Load all the items in a blacklist filter into the current blacklist
     * TODO: Unload? Maybe.
     * @param filter Name of the blacklist filter
     */
    Subclean.prototype.loadBlacklist = function (filter) {
        if (this.loaded.includes(filter))
            return;
        try {
            var items = JSON.parse(fs.readFileSync(path_1.join(this.fd, filter + ".json"), 'utf-8'));
            this.blacklist = __spreadArrays(this.blacklist, items);
            this.loaded.push(filter);
            if (this.args.debug) {
                this.log("[Filter] Added " + items.length + " items from filter " + filter);
            }
        }
        catch (e) {
            this.log('[Error] Failed to load a filter: ' + filter);
        }
    };
    /**
     * Add your own items to the blacklist. Currently not used.
     * Needs to be passed a file name to read
     * @param items Array of stings
     */
    Subclean.prototype.addBlacklistItems = function (items) {
        this.blacklist = __spreadArrays(this.blacklist, items);
        this.log("[Filter] Added " + items.length + " custom blacklist items");
    };
    /**
     * Clean the subtitle file, then write the output
     */
    Subclean.prototype.clean = function () {
        var _this = this;
        // Load the blacklist
        this.loadBlacklist('main');
        this.loadBlacklist('users');
        // Parse the subtitle file
        var nodes = subtitle_1.parseSync(fs.readFileSync(this.args.input, 'utf-8'));
        var hits = 0;
        // Remove ads
        nodes.forEach(function (node, index) {
            _this.blacklist.forEach(function (mark) {
                var regex = null;
                if (mark.startsWith('^')) {
                    regex = new RegExp(mark, 'i');
                    if (regex.exec(node.data.text)) {
                        if (_this.args.debug) {
                            _this.log("[Match] [Debug] " + node.data.text);
                        }
                        else {
                            _this.log("[Match] Advertising found in node " + index + " (" + mark + ")");
                            hits++;
                        }
                        node.data.text = '';
                    }
                }
                else {
                    if (node.data.text.toLowerCase().includes(mark)) {
                        if (_this.args.debug) {
                            _this.log("[Match] [Debug] " + node.data.text);
                        }
                        else {
                            _this.log("[Match] Advertising found in node " + index + " (" + mark + ")");
                            hits++;
                        }
                        node.data.text = '';
                    }
                }
            });
        });
        // Remove input file
        if (this.args.clean)
            fs.unlinkSync(this.args.input);
        // Stringify cleaned subtitles
        var cleaned = subtitle_1.stringifySync(nodes, {
            format: this.args.ext
        });
        // Write the file
        if (hits > 0) {
            fs.writeFileSync(this.args.output, cleaned);
            this.log("[Done] Removed " + hits + " node(s) and wrote to " + this.args.output);
        }
        else {
            this.log('[Done] No advertising found');
        }
    };
    return Subclean;
}());
new Subclean().init();
