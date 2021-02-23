# subclean

[![NPM](https://img.shields.io/npm/v/subclean)](https://www.npmjs.com/package/subclean) [![NPM](https://img.shields.io/npm/dt/subclean)](https://www.npmjs.com/package/subclean)

![Preview](https://i.imgur.com/ki2Au6v.png)  

## **What is this?**

A CLI package to remove advertising from subtitle files. I originally created this for my Plex server to quickly remove the ads opensubtitles puts in their subtitle files.
It's very simple to use and should get rid of most subtitle ads or branding without disrupting the subtitles themselves. If you want to use this with Bazarr scroll down to the bottom of the readme.  

**Install:**

`npm install -g subclean`

**Basic Use:**

`subclean subtitle.srt` 

**Advanced Use:**

| Argument      | Short | Description                                     |   
| :------------ | :---- | :---------------------------------------------- |    
| --input       |  -i  | The file you want to clean                       |  
| --output      |  -o  | Where the cleaned subtitle file will be written  |  
| --overwrite   |  -w  | Overwrite the output file if it already exists   |  
| --clean       |  -c  | Delete the input file before writing the output  |  
| --debug       |      | Display extra debugging information              |  
| --version     |  -v  | Print the current package version                |  
| --help        |      | Show the text you're reading now                 |  
| --no-check    |  -n  | Don't check for a new package version            |  
| --silent      |  -s  | Silent mode. Nothing logged to console           |  
  
**Bazarr**  
If you want to use this in [Bazarr](https://github.com/morpheus65535/bazarr), grab the latest build from the [releases](https://github.com/DrKain/subclean/releases) page.  
Do not use npm to install globally, Bazarr will not be able to run it.  
  
Then in `Settings -> Subtitles` you can add the following command to the post-processing section: `subclean "{{subtitles}}" -w 2>&1`  