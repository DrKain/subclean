# subclean

[![NPM](https://img.shields.io/npm/v/subclean)](https://www.npmjs.com/package/subclean) [![NPM](https://img.shields.io/npm/dt/subclean)](https://www.npmjs.com/package/subclean)

![Preview](https://i.imgur.com/iM9UWzw.png)

## What is this?

A CLI package to remove advertising from subtitle files. I originally created this for my Plex server to quickly remove the ads opensubtitles puts in their subtitle files.
It's very simple to use and should get rid of most subtitle ads or branding without disrupting the subtitles themselves. If you want to use this with Bazarr scroll down to the bottom of the readme.

### Download:

Downloads for Windows, Linux or Mac are on the [releases](https://github.com/DrKain/subclean/releases) page.

### NodeJS Install:

```
npm install -g subclean
```

Or you can build it yourself: `npm install && npm run build`

### Basic Use:

This cleans the target file. `-w` overwrites the existing file.

```
subclean subtitle.srt -w
```

### Clean everything:

This will recursively look through sub-directories for subtitle files and add them to a queue.
Once the file collection is complete, each subtitle file will be cleaned one by one.  
The cleaned file will overwrite the existing file.

Take a look at the [depth map](https://github.com/DrKain/subclean/wiki/Bulk-Cleaning#depth-map) for a visual guide on what depth to use.

```
subclean --sweep "path/to/media" --depth 5
```

### Quickly:

This will quickly clean all subtitle files in the current directory.
This will **not** look in sub-directories.

```
subclean --sweep .
```

### Command Arguments:

| Argument    | Short | Description                                                          |
| :---------- | :---- | :------------------------------------------------------------------- |
| --input     | -i    | The file you want to clean                                           |
| --output    | -o    | Where the cleaned subtitle file will be written                      |
| --overwrite | -w    | Overwrite the output file if it already exists                       |
| --clean     | -c    | Delete the input file before writing the output                      |
| --debug     |       | Display extra debugging information                                  |
| --version   | -v    | Print the current package version                                    |
| --help      |       | Show the text you're reading now                                     |
| --no-check  | -n    | Don't check for a new package version                                |
| --sweep     |       | Sweep a directory (and sub-dirs) to clean multiple files at once     |
| --depth     |       | Limit how many sub-dirs deep --sweep will go. Default = 10, Max = 25 |
| --silent    | -s    | Silent mode. Nothing logged to console                               |

### Bazarr

See the Wiki entry for [Bazarr](https://github.com/DrKain/subclean/wiki/Bazarr)

### Optimization

Currently not needed.  
With 100 unique filters subclean can process 20,000 nodes from 10 files in under a second.

### GUI

Currently not available. I might look into this in the future.

### Lastly:

Subclean is not complete! See [here](https://github.com/DrKain/subclean/issues?q=is%3Aopen+is%3Aissue+label%3Aenhancement) for planned features.

Want to help with this project? Feel like you can improve on the code? Feel free to PR any changes to both the package or the filter lists. Any help is greatly appreciated.  
A [Wiki](https://github.com/DrKain/subclean/wiki) is under construction with some basic information. Feel free to contribute there too.
