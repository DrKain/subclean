# subclean

[![NPM](https://img.shields.io/npm/v/subclean)](https://www.npmjs.com/package/subclean) [![NPM](https://img.shields.io/npm/dt/subclean)](https://www.npmjs.com/package/subclean)

## **What is this?\***

A CLI package to remove advertising from subtitle files. I originally created this for my Plex server to quickly remove the ads opensubtitles puts in their subtitle files.

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
| --debug       |       | Log the raw and processed arguments. If you post an issue please include a screenshot of the debug screen |

**Filters**

I will be adding to the [main filter](https://github.com/DrKain/subclean/blob/main/filters/main.json) as I encounter new ads. If you would like to contribute you are welcome to create a PR.  
If you start a filter with `^` it will use regex and match from the start of the line. This was for credits like `Subtitles by JoBoggles`. I will probably change this to allow any regex at some point.
