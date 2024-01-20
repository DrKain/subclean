#! /usr/bin/env node
/// <reference types="node" />
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
    getFiles(dir: string, depth?: number): Promise<string[]>;
    /**
     * Log a message to the console, only if subclean is not in silent mode
     * @param msg Message
     */
    log(msg: any): void;
    /**
     * Kill the script after printing an error
     * @param e Error Message
     */
    kill(e: string, err?: boolean): void;
    help(): void;
    /**
     * Add a file (with config) to the queue.
     * A check will be made to ensure it is not already in the queue
     * @param config
     * @returns
     */
    addToQueue(config: IArguments): void;
    /**
     * This is where files will be fetched and arguments validated
     * Extra information that might be needed for cleaning will also be filled
     * @returns
     */
    prepare(): Promise<void>;
    private writeLogs;
    /**
     * Load all the items in a blacklist filter into the current blacklist
     * @param file Target blacklist file
     */
    loadBlacklist(file: string): void;
    private getFileEncoding;
    private fixEncoding;
    private readFile;
    /**
     * Clean raw subtitle text instead of a file
     * @param text Raw subtitle text
     * @param config Config for cleaning the file
     * @returns string Cleaned subtitle text
     */
    cleanRaw(text: string, config?: Partial<IArguments>): Promise<string>;
    private testData;
    /**
     * Clean a subtitle file using the desired config
     * @param item Queue item
     * @returns IArguments
     */
    clean(item: IArguments, text?: string): Promise<string>;
    getPath(): string;
    saveFile(data: string, location: string, e?: BufferEncoding): Promise<any>;
    downloadFilter(name: string): Promise<unknown>;
    private ensureDirs;
    updateFilters(): Promise<unknown>;
    init(): Promise<void>;
}
export declare let subclean: SubClean;
export * from './interface';
