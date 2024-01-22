# [![subclean](https://raw.githubusercontent.com/DrKain/subclean/main/text-logo.png)](#)

[![NPM](https://img.shields.io/npm/v/subclean)](https://www.npmjs.com/package/subclean) [![NPM](https://img.shields.io/npm/dt/subclean)](https://www.npmjs.com/package/subclean)
[![Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](https://github.com/DrKain/subclean/wiki)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/DrKain/subclean/graphs/commit-activity)
[![License: MIT](https://img.shields.io/github/license/DrKain/subclean)](https://github.com/DrKain/subclean/blob/master/LICENSE)

> A powerful CLI tool and node module to remove advertising from subtitle files. Made for personal media servers with full support for automation tools like Bazarr. Simple to use and frequently updated with new filters.

![Preview](https://i.imgur.com/iM9UWzw.png)

## Download

Downloads for Windows, Linux and Mac can be found on the [releases](https://github.com/DrKain/subclean/releases) page.  
Alternatively, you can install using NodeJS:

```sh
npm install -g subclean
```

Or you can build it yourself: `npm install && npm run build`

## Usage

> If you are using this as a node module scroll down to the [node module/npm](#node-module) section.

If using Bazarr, please see the [wiki page](https://github.com/DrKain/subclean/wiki/Bazarr).

```
Usage: subclean [options]
Example: subclean subtitle.srt -w
Bulk: subclean --sweep "path/to/media"

Options:
  -i, --input      The file you want to clean
  -o, --output     Where to write the cleaned file (defaults to input)
  -w, --overwrite  Overwrite the output file if it already exists
  -c, --clean      Delete the input file before writing the output
  -v, --version    Display current version
  -n, --no-check   Don't check for a new package version
  -s, --silent     Silent mode. Nothing logged to console
      --update     Download the latest filters from GitHub
                   This will not update subclean, only the filters!

      --sweep      Bulk subtitle cleaning. Searches for subtitles
                   in multiple directories (and sub-directories)
                   This will enable --overwrite!

      --nochains   Attempt to match and remove chained nodes. Experimental.
      --depth      How many sub-directories to look when sweep cleaning
      --debug      Display extra debugging information
      --help       Show the text you're reading now
      --ne         No Empty (nodes). Deletes empty nodes after cleaning.
      --testing    Testing mode. Will not modify files.
      --uf         Use Filter: internal or appdata
```

## 🧹 Bulk Cleaning

Scans for subtitle files and cleans them one by one.  
Depth is optional. Take a look at the [depth map](https://github.com/DrKain/subclean/wiki/Bulk-Cleaning#depth-map) for a visual guide on what depth to use.

```sh
subclean --sweep "path/to/media" --depth 5
// or
subclean --sweep
```

## 📝 Filters

When you run `subclean --update` new filters will be downloaded from GitHub.
The location of these files may differ depending on what OS you are using.
If the downloaded filters do not exist or can not be accessed the internal filters will be used instead

You can create `custom.json` alongside the downloaded filters. Subclean will automatically load this and apply it when cleaning. You can verify this is being loaded by running `subclean --debug`. You should see a message similar to `Loaded n filters from custom`

## Node Module

As of 1.6.2 and above this can now be used as a node module, allowing you to pass raw text through the `cleanRaw` function. Usage is as follows:

```npm
npm install subclean --save
```

```ts
import { subclean } from 'subclean';

const testdata = `1
00:00:06,000 --> 00:00:12,074
Watch Movies, TV Series and Live Sports
Signup Here -> WWW.ADMITME.APP

2
00:00:27,319 --> 00:00:28,820
Or you can remove that annoying ad using subclean!

3
00:00:28,903 --> 00:00:30,447
Now with support for node modules.`;

subclean.cleanRaw(testdata).then(console.log);
```

Result:

```
1
00:00:27,319 --> 00:00:28,820
Or you can remove that annoying ad using subclean!

2
00:00:28,903 --> 00:00:30,447
Now with support for node modules.
```

You can still pass arguments to customize the process.

```ts
const config = { nochains: true, ne: true };
subclean.cleanRaw(testdata, config).then(console.log);
```

If the data is invalid you will receive an error

```ts
const testdata = `this is invalid data`;
subclean.cleanRaw(testdata).then(console.log).catch(console.log);
// Error: Unable to parse subtitles
```

## 👤 Author

This project was made by **Kain (ksir.pw)**

-   Website: [ksir.pw](https://ksir.pw)
-   Github: [@DrKain](https://github.com/DrKain)
-   Discord: drkain

## 🤝 Contributing

Contributions, issues and feature requests are welcome and greatly appreciated.  
Feel free to check [issues page](https://github.com/DrKain/subclean/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2021 [Kain (ksir.pw)](https://github.com/DrKain).
This project is [MIT](https://github.com/DrKain/subclean/blob/master/LICENSE) licensed.
