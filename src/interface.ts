export interface IArguments {
    /**
     * Subtitle file to clean.
     * This defaults to the first non-flagged argument
     */
    input: string;
    /**
     * Where to write the cleaned file. Defaults to input
     */
    output: string;
    /**
     * If subclean should overwrite when the output already exists
     */
    overwrite: boolean;
    /**
     * Delete the input file before writing the output
     */
    clean: boolean;
    /**
     * Log extra information to the console for testing
     */
    debug: boolean;
    /**
     * Print the current version. All other arguments (excluding --silent will be ignored)
     */
    version: boolean;
    /**
     * Print the help text
     */
    help: boolean;
    /**
     * Disable update notifications
     */
    nocheck: boolean;
    /**
     * Do not log anything to the console
     */
    silent: boolean;
    /**
     * Attempt to remove chained ads
     */
    nochains: boolean;
    /**
     * Expects directory. This will clean multiple files across multiple directories and subdirectories.
     * Use the depth parameter to limit how many directories deep subclean will look.
     */
    sweep: string;
    /**
     * Limits how many subdirectories deep subclean will look for subtitles.
     * Defaults to 10
     */
    depth: number;
    /**
     * Download new filters from GitHub
     */
    update: boolean;

    // Set by code, do not change

    /**
     * File extension. Used to check for .vtt or .srt
     */
    ext: string;
    /**
     * Directory of the subtitle file
     */
    directory: string;
    /*
    Delete empty nodes instead of blanking the text
    */
    ne: boolean;
    /**
     * When true the file will not be saved but all cleaning will be logged.
     * This is for testing to ensure the script is working without having to create a new
     * subtitle file every time.
     */
    testing: boolean;
    /**
     * Use filters: appdata or internal
     */
    uf: 'default' | 'appdata' | 'internal';
    /**
     * Force the loading of filters for certain languages. Format must be the
     * ISO 639-1 language codes seperated by a comma. Must be 2 characters,
     * anything else will be ignored by the program.
     * EG: --lang=en,de
     */
    lang: string;
}

export interface INode {
    data: {
        text: string;
    };
}

export interface IFE {
    encoding: string;
    language: string;
    confidence: {
        encoding: number;
        language: number;
    };
}
