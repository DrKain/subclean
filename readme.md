# subclean

[![NPM](https://img.shields.io/npm/v/subclean)](https://www.npmjs.com/package/subclean) [![NPM](https://img.shields.io/npm/dt/subclean)](https://www.npmjs.com/package/subclean)

![Preview](https://i.imgur.com/ki2Au6v.png)  

## **What is this?**

A CLI package to remove advertising from subtitle files. I originally created this for my Plex server to quickly remove the ads opensubtitles puts in their subtitle files.
It's very simple to use and should get rid of most subtitle ads or branding without disrupting the subtitles themselves.  

**Install:**

`npm install -g subclean`

**Basic Use:**

`subclean subtitle.srt` 

**Advanced Use:**

| Argument      | Short | Description                                                                                               | Example                                |
| :------------ | :---- | :-------------------------------------------------------------------------------------------------------- | :------------------------------------- |
| --input-file  | -i    | The file you want to clean                                                                                | `subclean -i subtitle.srt`             |
| --output-file | -o    | Where the cleaned file will be written                                                                    | `subclean subtitle.srt -o cleaned.srt` |
| --continue    | -c    | Overwrite the output file if it already exists                                                            | `subclean subtitle.srt -c`             |
| --filter      | -f    | Select a filter file. This is currently useless as there's only one filter.                               | `subclean -f main`                     |
| --ci          |       | Delete the input file before writing the output.                                                          | `subclean subtitle.srt --ci`           |
| --debug       |       | Log the raw and processed arguments. If you post an issue please include a screenshot of the debug screen |                                        |
| --help        |       | Displays a message in the console with most of the text above, excluding the examples for each            |                                        |   
  
**Bazarr**  
If you want to use this in [Bazarr](https://github.com/morpheus65535/bazarr), grab the latest build from the [releases](https://github.com/DrKain/subclean/releases) page.  
Do not use npm to install globally, Bazarr will not be able to run it.  
  
Then in `Settings -> Subtitles` you can add the following command to the post-processing section: `subclean "{{subtitles}}" -o "{{subtitles}}" --ci --continue 2>&1`  