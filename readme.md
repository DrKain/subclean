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
| --clean       |       | Remove the source file before writing the output.                                                         | `subclean subtitle.srt --clean`        |
| --debug       |       | Log the raw and processed arguments. If you post an issue please include a screenshot of the debug screen |

**Filters**

I will be adding to the [main filter](https://github.com/DrKain/subclean/blob/main/filters/main.json) as I encounter new ads. If you would like to contribute you are welcome to create a PR.  
To prevent accidental matches please include a sample of the ad you found in the description of the pull request.

Example:

```
00:00:06,000 --> 00:00:12,074
Buy quality propane and propane accessories!
Visit www.PropaneEmporium.org today
```
