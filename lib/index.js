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
var Subclean = /** @class */ (function () {
    function Subclean() {
        this.blacklist = [];
        this.loaded = [];
        this.fd = path_1.join(__dirname, '../filters');
    }
    Subclean.prototype.init = function () {
        this.prepare();
        this.validate();
        this.clean();
    };
    /**
     * Kill the script after printing an error
     * @param e Error Message
     */
    Subclean.prototype.kill = function (e, err) {
        if (err === void 0) { err = true; }
        if (err)
            console.error("[Error] " + e);
        else
            console.log(e);
        process.exit(0);
    };
    Subclean.prototype.help = function () {
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
        ].join('\n'), false);
    };
    /**
     * Prepare the arguments and defaults
     */
    Subclean.prototype.prepare = function () {
        if (!argv._.length && !argv.i) {
            if (argv.help)
                this.help();
            else
                this.kill('Missing arguments');
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
        if (this.args.debug)
            console.log('prepared arguments');
    };
    /**
     * Attempt to validate files and arguments
     */
    Subclean.prototype.validate = function () {
        // Resolve input
        this.args.input = path_1.resolve(this.args.input);
        // Detect the directory and file extension
        this.args.directory = path_1.dirname(this.args.input);
        this.args.ext = path_1.extname(this.args.input);
        // If an output file is not set, generate a default path
        if (this.args.output === '') {
            this.args.output = path_1.join(this.args.directory, "output" + this.args.ext);
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
            this.kill("Ouput file already exists. Use -c to overwrite");
        }
        // Make sure the filter file exists
        if (!fs.existsSync(path_1.join(this.fd, this.args.filter + ".json"))) {
            this.kill("Unable to find the filter: " + this.args.filter);
        }
        if (this.args.debug)
            console.log('arguments validated');
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
                console.log("[Filter] Added " + items.length + " items from filter " + filter);
            }
        }
        catch (e) {
            console.log('[Error] Failed to load a filter: ' + filter);
        }
    };
    /**
     * Add your own items to the blacklist. Currently not used.
     * Needs to be passed a file name to read
     * @param items Array of stings
     */
    Subclean.prototype.addBlacklistItems = function (items) {
        this.blacklist = __spreadArrays(this.blacklist, items);
        console.log("[Filter] Added " + items.length + " custom blacklist items");
    };
    /**
     * Clean the subtitle file, then write the output
     */
    Subclean.prototype.clean = function () {
        var _this = this;
        // Load the blacklist
        this.loadBlacklist('main');
        this.loadBlacklist('users');
        this.loadBlacklist(this.args.filter);
        // Parse the subtitle file
        var nodes = subtitle_1.parseSync(fs.readFileSync(this.args.input, 'utf-8'));
        // Remove ads
        nodes.forEach(function (node, index) {
            _this.blacklist.forEach(function (mark) {
                var regex = null;
                if (mark.startsWith('^')) {
                    regex = new RegExp(mark, 'i');
                    if (regex.exec(node.data.text)) {
                        if (_this.args.debug) {
                            console.log("[Match] [Debug] " + node.data.text);
                        }
                        else {
                            console.log("[Match] Advertising found in node " + index + " (" + mark + ")");
                        }
                        node.data.text = '';
                    }
                }
                else {
                    if (node.data.text.toLowerCase().includes(mark)) {
                        if (_this.args.debug) {
                            console.log("[Match] [Debug] " + node.data.text);
                        }
                        else {
                            console.log("[Match] Advertising found in node " + index + " (" + mark + ")");
                        }
                        node.data.text = '';
                    }
                }
            });
        });
        // Remove input file
        if (this.args.ci)
            fs.unlinkSync(this.args.input);
        // Stringify cleaned subtitles
        var cleaned = subtitle_1.stringifySync(nodes, {
            format: this.args.ext.replace(/./g, ''),
        });
        // Write the file
        fs.writeFileSync(this.args.output, cleaned);
        console.log("[Done] Wrote to " + this.args.output);
    };
    return Subclean;
}());
new Subclean().init();
