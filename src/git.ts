import * as vscode from 'vscode';
import * as shell from './shell';
import { Change, parseDiff } from './git-diff';

export interface FilePosition {
    relativePath: string;
    line: number;
}

export class GitDiffCache {
    private changes: Change[];
    private diffIndex: DiffIndex;

    constructor() {
        this.changes = [];
        this.diffIndex = new DiffIndex();
    }

    async update() {
        const diffRaw = await gitDiffCommand();
        if (diffRaw !== null) {
            this.changes = parseDiff(diffRaw);
            this.diffIndex.update(this.changes);
        }
    }

    nextPosition(fp: FilePosition): FilePosition | undefined {
        const newPos = this.diffIndex.findNextPosition(fp);
        // console.log(`nextPosition: ${printFp(fp)} --> ${printFp(newPos)}`);
        return newPos;
    }
    previousPosition(fp: FilePosition): FilePosition | undefined {
        const newPos = this.diffIndex.findPreviousPosition(fp);
        // console.log(`previousPosition: ${printFp(fp)} --> ${printFp(newPos)}`);
        return newPos;
    }

}

function printFp(fp: FilePosition | undefined) {
    return `[path=${fp && fp.relativePath} line=${fp && fp.line}]`;
}

class DiffIndex {
    private changesByFile: Map<string, number[]>;
    private fileKeys: string[];

    constructor() {
        this.changesByFile = new Map();
        this.fileKeys = [];
    }

    update(changes: Change[]) {
        this.changesByFile.clear();
        changes.forEach(change => this.changesByFile.set(change.filename, change.lines));
        this.fileKeys = Array.from(this.changesByFile.keys());
    }

    private firstPosition(): FilePosition | undefined {
        const firstPath = this.fileKeys[0];
        const firstFileChanges = this.changesByFile.get(firstPath)
        return firstFileChanges ? { relativePath: firstPath, line: firstFileChanges[0] } : undefined;
    }

    private lastPosition(): FilePosition | undefined {
        const lastPath = this.fileKeys.slice(-1)[0];
        const lastFileChanges = this.changesByFile.get(lastPath)
        return lastFileChanges ? { relativePath: lastPath, line: lastFileChanges.slice(-1)[0] } : undefined;
    }

    private firstLineNextFile(currentPosition: FilePosition): FilePosition | undefined {
        const nextFileIndex = this.fileKeys.findIndex(fn => fn === currentPosition.relativePath) + 1;
        if (nextFileIndex - 1 === -1) throw Error('What? Shouldnt be');

        let relativePath = undefined; // = currentPosition.relativePath; // Default to current
        let line = undefined; // = currentPosition.line; // Default to current
        if (nextFileIndex < this.fileKeys.length) {
            const newFilepath = this.fileKeys[nextFileIndex];
            const nextFileChanges = this.changesByFile.get(newFilepath);
            if (nextFileChanges) {
                relativePath = newFilepath;
                line = nextFileChanges[0];
            }
        }
        return (relativePath && line) ? { relativePath, line } : undefined;
    }

    private lastLinePreviousFile(currentPosition: FilePosition): FilePosition | undefined {
        const previousFileIndex = this.fileKeys.findIndex(fn => fn === currentPosition.relativePath) - 1;
        if (previousFileIndex + 1 === -1) throw Error('What? Shouldnt be');

        let relativePath = undefined; // = currentPosition.relativePath;
        let line = undefined; // = currentPosition.line;
        if (previousFileIndex > -1) {
            const newFilepath = this.fileKeys[previousFileIndex];
            const previousFileChanges = this.changesByFile.get(newFilepath);
            if (previousFileChanges) {
                relativePath = newFilepath;
                line = previousFileChanges.slice(-1)[0]; // last line
            }
        }
        return (relativePath && line) ? { relativePath, line } : undefined;
    }

    findNextPosition(currentPosition: FilePosition): FilePosition | undefined {
        // Case: In a file with changes
        const currentFileChanges = this.changesByFile.get(currentPosition.relativePath);
        if (currentFileChanges) {
            const nextIndex = currentFileChanges.findIndex(line => line > currentPosition.line);

            // Case: next line in the current file
            if (nextIndex > -1) {
                return {
                    relativePath: currentPosition.relativePath,
                    line: currentFileChanges[nextIndex]
                }

            } else {
                // Case: not in current file, advance to first entry of next file
                return this.firstLineNextFile(currentPosition);
            }

        }
        // Case: Not in a file with changes, advance to first in arr
        return this.firstPosition();

    }

    findPreviousPosition(currentPosition: FilePosition): FilePosition | undefined {
        // Case: In a file with changes
        const currentFileChanges = this.changesByFile.get(currentPosition.relativePath);
        if (currentFileChanges) {
            const previousIndex = findLastIndex(currentFileChanges, line => line < currentPosition.line);

            // Case: next line in the current file
            if (previousIndex > -1) {
                return {
                    relativePath: currentPosition.relativePath,
                    line: currentFileChanges[previousIndex]
                }

            } else {
                // Case: not in current file, advance to first entry of previous file
                return this.lastLinePreviousFile(currentPosition);
            }

        }
        // Case: Not in a file with changes, advance to last in arr
        return this.lastPosition();

    }
}

// Like Array.findIndex() but instead finds the lastIndex
function findLastIndex<T>(arr: Array<T>, predicate: (value: T) => boolean) {
    const firstReverseIndex = arr.slice().reverse().findIndex(predicate);
    return (firstReverseIndex > -1) ? (arr.length - 1) - firstReverseIndex : -1;
}

async function gitDiffCommand(): Promise<string | null> {
    const rootPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.path;
    if (rootPath) {
        console.log(`shell: git diff`);
        const diffText = await shell.runCommand('git', ['diff'], { cwd: rootPath });
        return diffText;
    } else {
        console.log(`You do not have a workspace folder open so we can't determine your root path`);
        return null;
    }
}
