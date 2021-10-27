# subclean

[![NPM](https://img.shields.io/npm/v/subclean)](https://www.npmjs.com/package/subclean) [![NPM](https://img.shields.io/npm/dt/subclean)](https://www.npmjs.com/package/subclean)

![Preview](https://i.imgur.com/iM9UWzw.png)

## What is this?

A CLI package to remove advertising from subtitle files. I originally created this for my Plex server to quickly remove the ads opensubtitles puts in their subtitle files.
It's very simple to use and should get rid of most subtitle ads or branding without disrupting the subtitles themselves.   
Can be automated with [Bazarr](https://github.com/DrKain/subclean/wiki/Bazarr).  

#### Install:

`npm install -g subclean`

Or grab a pre-built binary from the [releases](https://github.com/DrKain/subclean/releases) page (win, linux, mac).  
Or you can built it yourself: `npm install && npm run build`

#### Basic Use:

`subclean subtitle.srt -w`

#### Command Arguments:

| Argument    | Short | Description                                     |
| :---------- | :---- | :---------------------------------------------- |
| --input     | -i    | The file you want to clean                      |
| --output    | -o    | Where the cleaned subtitle file will be written |
| --overwrite | -w    | Overwrite the output file if it already exists  |
| --clean     | -c    | Delete the input file before writing the output |
| --debug     |       | Display extra debugging information             |
| --version   | -v    | Print the current package version               |
| --help      |       | Show the text you're reading now                |
| --no-check  | -n    | Don't check for a new package version           |
| --silent    | -s    | Silent mode. Nothing logged to console          |

#### Extra:

Want to help with this project? Feel like you can improve on the code? Feel free to PR any changes to both the package or the filter lists. Any help is greatly appreciated.  
A [Wiki](https://github.com/DrKain/subclean/wiki) is under construction with some basic information. Feel free to contribute there too.
