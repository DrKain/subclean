// TODO: Automate this. Cac? Commander?
// Something lightweight
export const help_text = `
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

      v- You likely do not need to use these -v

      --depth      How many sub-directories to look when sweep cleaning
      --debug      Display extra debugging information
      --help       Show the text you're reading now
      --ne         No Empty (nodes). Deletes empty nodes after cleaning.
      --testing    Testing mode. Will not modify files.
      --uf         Use Filter: internal or appdata
`;
