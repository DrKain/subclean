export interface IArguments {
    // User Input
    input: string;
    output: string;
    overwrite: boolean;
    clean: boolean;
    debug: boolean;
    version: boolean;
    help: boolean;
    nocheck: boolean;
    silent: boolean;
    sweep: string;

    // Set by code, do not change
    ext: string;
    directory: string;
}
