#! /usr/bin/env node
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var subtitle_1 = require("subtitle");
var help_1 = require("./help");
var https_1 = require("https");
var argv = require('minimist')(process.argv.slice(2));
var updateNotifier = require('update-notifier');
var pkg = require('../package.json');
var SubClean = /** @class */ (function () {
    function SubClean() {
        var _a;
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
            sweep: argv.sweep || null,
            depth: (_a = argv.depth) !== null && _a !== void 0 ? _a : 10
        };
        this.fd = path_1.join(__dirname, '../filters');
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
    SubClean.prototype.getFiles = function (dir, depth) {
        var _this = this;
        if (depth === void 0) { depth = 5; }
        return new Promise(function (done) { return __awaiter(_this, void 0, void 0, function () {
            var subdirs, files;
            var _this = this;
            return __generator(this, function (_a) {
                subdirs = fs_1.readdirSync(dir);
                files = [];
                subdirs.map(function (subdir) { return __awaiter(_this, void 0, void 0, function () {
                    var res, data, _a, _i, data_1, item;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                res = path_1.resolve(dir, subdir);
                                data = [];
                                if (!fs_1.statSync(res).isDirectory()) return [3 /*break*/, 4];
                                if (!(depth > 0)) return [3 /*break*/, 2];
                                return [4 /*yield*/, this.getFiles(res, depth - 1)];
                            case 1:
                                _a = _b.sent();
                                return [3 /*break*/, 3];
                            case 2:
                                _a = [];
                                _b.label = 3;
                            case 3:
                                data = _a;
                                return [3 /*break*/, 5];
                            case 4:
                                data = [res];
                                _b.label = 5;
                            case 5:
                                // Filter out files that are not supported subtitles
                                for (_i = 0, data_1 = data; _i < data_1.length; _i++) {
                                    item = data_1[_i];
                                    if (this.supported.includes(path_1.extname(item).substr(1))) {
                                        files.push(item);
                                    }
                                }
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/, done(files)];
            });
        }); });
    };
    /**
     * Log a message to the console, only if subclean is not in silent mode
     * @param msg Message
     */
    SubClean.prototype.log = function (msg) {
        if (!this.args.silent)
            console.log(msg);
    };
    /**
     * Kill the script after printing an error
     * @param e Error Message
     */
    SubClean.prototype.kill = function (e, err) {
        if (err === void 0) { err = true; }
        this.log((err ? '[Error] ' : '') + ("" + e));
        process.exit(0);
    };
    // TODO: Auto-generate help text
    SubClean.prototype.help = function () {
        this.kill(help_1.help_text, false);
    };
    /**
     * Add a file (with config) to the queue.
     * A check will be made to ensure it is not already in the queue
     * @param config
     * @returns
     */
    SubClean.prototype.addToQueue = function (config) {
        var exists = this.queue.find(function (item) { return item.input === config.input; });
        if (exists)
            return this.log("[Error] Duplicate in queue '" + config.input + "'");
        else {
            config.directory = path_1.dirname(config.input);
            config.ext = path_1.extname(config.input).substr(1);
            this.queue.push(config);
        }
    };
    /**
     * This is where files will be fetched and arguments validated
     * Extra information that might be needed for cleaning will also be filled
     * @returns
     */
    SubClean.prototype.prepare = function () {
        return __awaiter(this, void 0, void 0, function () {
            var notifier, files, _i, files_1, file, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        // Display help message
                        if (this.args.help)
                            this.help();
                        if (!this.args.update) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.updateFilters()];
                    case 1:
                        _a.sent();
                        this.kill('[Info] Updated all filters', false);
                        _a.label = 2;
                    case 2:
                        // Notify if there's a new update
                        if (!this.args.nocheck) {
                            notifier = updateNotifier({ pkg: pkg, updateCheckInterval: 1000 * 60 * 60 });
                            if (notifier.update) {
                                this.log("[Info] Update available: " + pkg.version + " -> " + notifier.update.latest);
                                this.log('[Info] https://github.com/DrKain/subclean/releases');
                            }
                        }
                        // Log the current version
                        if (this.args.version) {
                            return [2 /*return*/, this.kill('You are using subclean@' + pkg.version, false)];
                        }
                        // Just in case
                        if (typeof this.args.depth !== 'number')
                            this.args.depth = 10;
                        if (this.args.depth > 25)
                            this.args.depth = 25;
                        if (this.args.depth < 0)
                            this.args.depth = 1;
                        // Not really wildcard support, more of a shortcut
                        // TODO: Custom regex match for getFiles() to properly support wildcards
                        if (this.args.input === '*') {
                            this.args.depth = 1;
                            this.args.sweep = __dirname;
                        }
                        if (!this.args.sweep) return [3 /*break*/, 4];
                        // Validate the sweep directory exists
                        this.args.sweep = path_1.resolve(this.args.sweep);
                        if (!fs_1.existsSync(this.args.sweep))
                            this.kill(this.args.sweep + " is not a valid path", true);
                        // Fetch files and add them to the queue
                        this.log("[Info] Scanning for subtitle files. This may take a few minutes with large collections");
                        return [4 /*yield*/, this.getFiles(this.args.sweep, this.args.depth)];
                    case 3:
                        files = _a.sent();
                        for (_i = 0, files_1 = files; _i < files_1.length; _i++) {
                            file = files_1[_i];
                            this.addToQueue(__assign(__assign({}, this.args), { overwrite: true, input: file, output: file }));
                        }
                        // Log how many items were added
                        this.log("[Info] Added " + this.queue.length + " files to the queue");
                        return [3 /*break*/, 5];
                    case 4:
                        // Display an error if the user did not specify an input file
                        if (this.args.input === '') {
                            return [2 /*return*/, this.kill('Missing arguments. Use --help for details', true)];
                        }
                        // If an output file is not set, generate a default path
                        if (this.args.output === '') {
                            // You will still need to enable --overwrite to overwrite the file
                            this.args.output = this.args.input;
                        }
                        // Make sure the input file exists
                        if (!fs_1.existsSync(this.args.input)) {
                            this.kill('Input file does not exist', true);
                        }
                        // Make sure it's not a directory
                        if (fs_1.statSync(this.args.input).isDirectory()) {
                            this.kill('Input file was detected to be a directory', true);
                        }
                        // Prevent accidentally overwriting a file
                        if (fs_1.existsSync(this.args.output) && this.args.overwrite === false) {
                            this.kill("Ouput file already exists. Pass -w to overwrite", true);
                        }
                        this.addToQueue(this.args);
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        this.kill("" + error_1, true);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Load all the items in a blacklist filter into the current blacklist
     * TODO: Move filters to appdata
     * TODO: Support for custom filters, also in appdata
     * @param filter Name of the blacklist filter
     */
    SubClean.prototype.loadBlacklist = function (filter) {
        if (this.loaded.includes(filter))
            return;
        try {
            // We want to use appdata for this if possible
            var target = path_1.join(this.getPath(), 'filters', filter + ".json");
            // If the appdata file doesn't exist, use the internal filters
            if (!fs_1.existsSync(target))
                target = path_1.join(this.fd, filter + ".json");
            // If it still doesn't exist, return
            if (!fs_1.existsSync(target)) {
                if (filter !== 'custom') {
                    this.log('[Info] Unable to locate filter: ' + filter);
                }
                return;
            }
            var items = JSON.parse(fs_1.readFileSync(target, 'utf-8'));
            this.blacklist = __spreadArray(__spreadArray([], this.blacklist), items);
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
     * Clean a subtitle file using the desired config
     * @param item Queue item
     * @returns IArguments
     */
    SubClean.prototype.cleanFile = function (item) {
        var _this = this;
        return new Promise(function (done, reject) {
            try {
                // Parse the subtitle file
                var fileData = fs_1.readFileSync(item.input, 'utf-8');
                // Remove all cases of \r (parser can not handle these)
                fileData = fileData.replace(/\r/g, ' ');
                var nodes = subtitle_1.parseSync(fileData);
                var hits_1 = 0;
                // Remove ads
                nodes.forEach(function (node, index) {
                    _this.blacklist.forEach(function (mark) {
                        var regex = null;
                        if (mark.startsWith('^')) {
                            regex = new RegExp(mark, 'i');
                            if (regex.exec(node.data.text)) {
                                _this.log("[Match] Advertising found in node " + index + " (" + mark + ")");
                                hits_1++;
                                node.data.text = '';
                            }
                        }
                        else {
                            if (node.data.text.toLowerCase().includes(mark)) {
                                _this.log("[Match] Advertising found in node " + index + " (" + mark + ")");
                                hits_1++;
                                node.data.text = '';
                            }
                        }
                    });
                });
                // Remove input file
                if (item.clean)
                    fs_1.unlinkSync(item.input);
                // Stringify cleaned subtitles
                var cleaned = subtitle_1.stringifySync(nodes, { format: item.ext });
                // Write cleaned file
                fs_1.writeFileSync(item.output, cleaned);
                if (hits_1 > 0)
                    _this.log("[Done] Removed " + hits_1 + " node(s) and wrote to " + item.output + "\n");
                else
                    _this.log('[Done] No advertising found\n');
                // Resolve the promise
                done(item);
            }
            catch (error) {
                if (("" + error).includes('expected timestamp at')) {
                    _this.log("[Error] Unable to parse \"" + item.input + "\"");
                    _this.log("[Error] Please create an issue on GitHub with a copy of this file.\n");
                }
                reject(error);
            }
        });
    };
    SubClean.prototype.getPath = function () {
        var _a, _b, _c, _d;
        var target = '';
        switch (process.platform) {
            case 'win32':
                target = path_1.join((_b = (_a = process.env.APPDATA) !== null && _a !== void 0 ? _a : process.env.LOCALAPPDATA) !== null && _b !== void 0 ? _b : '', 'subclean');
                break;
            case 'darwin':
                target = path_1.join((_c = process.env.HOME) !== null && _c !== void 0 ? _c : '', 'Library', 'Application Support', 'subclean');
                break;
            default:
                target = path_1.join((_d = process.env.HOME) !== null && _d !== void 0 ? _d : '', 'subclean');
                break;
        }
        return target;
    };
    SubClean.prototype.downloadFilter = function (name) {
        var _this = this;
        return new Promise(function (resolve) {
            var url = "https://raw.githubusercontent.com/DrKain/subclean/main/filters/" + name + ".json";
            var save_to = path_1.join(_this.getPath(), 'filters', name + ".json");
            var current = 0;
            if (fs_1.existsSync(save_to))
                current = fs_1.statSync(save_to).size;
            https_1.get(url, function (res) {
                var data = '';
                res.on('data', function (chunk) { return (data += chunk); });
                res.on('end', function () {
                    fs_1.writeFileSync(save_to, data);
                    if (fs_1.statSync(save_to).size !== current) {
                        _this.log("[Info] Downloaded new filters for: " + name);
                    }
                    resolve(name);
                });
            }).on('error', function (err) {
                _this.log("[Error] " + err);
                resolve(false);
            });
        });
    };
    SubClean.prototype.updateFilters = function () {
        return __awaiter(this, void 0, void 0, function () {
            var $app, $filters, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        $app = this.getPath();
                        $filters = path_1.join($app, 'filters');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        // Ensure user directories exist
                        if (!fs_1.existsSync($app))
                            fs_1.mkdirSync($app);
                        if (!fs_1.existsSync($filters))
                            fs_1.mkdirSync($filters);
                        // Download both filters
                        return [4 /*yield*/, this.downloadFilter('main')];
                    case 2:
                        // Download both filters
                        _a.sent();
                        return [4 /*yield*/, this.downloadFilter('users')];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        this.log("[Error] " + error_2);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SubClean.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _i, index, item, name_1, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // Load the blacklist
                        this.loadBlacklist('main');
                        this.loadBlacklist('users');
                        this.loadBlacklist('custom');
                        // Prepare files
                        return [4 /*yield*/, this.prepare()];
                    case 1:
                        // Prepare files
                        _c.sent();
                        this.log('[Info] Starting queue...\n');
                        _a = [];
                        for (_b in this.queue)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        index = _a[_i];
                        item = this.queue[index];
                        name_1 = path_1.basename(item.input);
                        if (this.args.debug)
                            name_1 = item.input;
                        this.log("[" + (+index + 1) + "/" + this.queue.length + "] Cleaning \"" + name_1 + "\"");
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.cleanFile(item)];
                    case 4:
                        _c.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_3 = _c.sent();
                        this.log("[Error] " + error_3);
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return SubClean;
}());
new SubClean().init();
