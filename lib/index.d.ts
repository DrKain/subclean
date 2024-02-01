#! /usr/bin/env node
import { IArguments } from './interface';
export declare class SubClean {
    args: IArguments;
    fd: string;
    blacklist: string[];
    supported: string[];
    loaded: string[];
    queue: IArguments[];
    noFileOutput: boolean;
    silent: boolean;
    logtofile: boolean;
    private actions_count;
    private nodes_count;
    private filter_count;
    private log_data;
    constructor();
    /**
     *
     * @param dir Top level directory to get files in
     * @param depth How many sub-directories to look through
     * @returns
     */
    private getFiles;
    /**
     * Log a message to the console, only if subclean is not in silent mode
     * @param msg Message
     */
    private log;
    /**
     * Kill the script after printing an error
     * @param e Error Message
     */
    private kill;
    help(): void;
    /**
     * Add a file (with config) to the queue.
     * A check will be made to ensure it is not already in the queue
     * @param config
     * @returns
     */
    private addToQueue;
    /**
     * This is where files will be fetched and arguments validated
     * Extra information that might be needed for cleaning will also be filled
     * @returns
     */
    private prepare;
    private writeLogs;
    /**
     * Load all the items in a blacklist filter into the current blacklist
     * @param file Target blacklist file
     */
    private loadBlacklist;
    private getFileEncoding;
    private readFile;
    /**
     * Clean raw subtitle text instead of a file
     * @param text Raw subtitle text
     * @param config Config for cleaning the file
     * @returns string Cleaned subtitle text
     */
    cleanRaw(text: string, config?: Partial<IArguments>): Promise<string>;
    private testData;
    private verifyFileData;
    /**
     * Clean a subtitle file using the desired config
     * @param item Queue item
     * @returns IArguments
     */
    clean(item: IArguments, text?: string): Promise<string>;
    private getPath;
    saveFile(data: string, location: string): Promise<any>;
    private downloadFilter;
    private ensureDirs;
    private updateFilters;
    init(): Promise<void>;
}
export declare let subclean: SubClean;
export * from './interface';
