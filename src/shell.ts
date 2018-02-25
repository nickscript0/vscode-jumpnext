'use strict';

// From https://github.com/eamodio/vscode-gitlens/blob/ee14b2f31e9492fcda9d1767fb33a8379f4e7da1/src/git/shell.ts

import { execFile } from 'child_process';

export interface CommandOptions {
    readonly cwd?: string;
    readonly env?: Object;
    readonly encoding?: BufferEncoding;
    /**
     * The size the output buffer to allocate to the spawned process. Set this
     * if you are anticipating a large amount of output.
     *
     * If not specified, this will be 10MB (10485760 bytes) which should be
     * enough for most Git operations.
     */
    readonly maxBuffer?: number;
    /**
     * An optional string or buffer which will be written to
     * the child process stdin stream immediately immediately
     * after spawning the process.
     */
    readonly stdin?: string | Buffer;
    /**
     * The encoding to use when writing to stdin, if the stdin
     * parameter is a string.
     */
    readonly stdinEncoding?: string;
}

export function runCommand(command: string, args: any[], options: CommandOptions = {}) {
    const { stdin, stdinEncoding, ...opts } = { maxBuffer: 10 * 1024 * 1024, ...options } as CommandOptions;

    return new Promise<string>((resolve, reject) => {
        const proc = execFile(
            command,
            args,
            opts,
            (err: Error & { code?: string | number } | null, stdout, stderr) => {
                if (!err) {
                    if (stderr) {
                        console.log(`Warning(${command} ${args.join(' ')}): ${stderr}`);
                    }
                    resolve(stdout);

                    return;
                }

                if (err.message === 'stdout maxBuffer exceeded') {
                    reject(new Error(`Command output exceeded the allocated stdout buffer. Set 'options.maxBuffer' to a larger value than ${opts.maxBuffer} bytes`));
                }

                console.log(`Warning(${command} ${args.join(' ')}): ${stderr}`);
                reject(err);
            }
        );

        if (stdin) {
            proc.stdin.end(stdin, stdinEncoding || 'utf8');
        }
    });
}
