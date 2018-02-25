import * as vscode from 'vscode';
import * as shell from './shell';
import { Change, parseDiff } from './git-diff';

// function refreshGitCache(document: vscode.TextDocument | vscode.WorkspaceFoldersChangeEvent) {
//     // TODO: run git diff on save
// }


export interface FilePosition {
    relativePath: string;
    line: number;
}

export class GitDiffCache {
    private diffText: string;
    private changes: Change[];
    // private changesByFile: Map<string, number[]>;
    private diffIndex: DiffIndex;

    constructor() {
        this.diffText = '';
        this.changes = [];
        // this.changesByFile = new Map();
        this.diffIndex = new DiffIndex();
    }

    async update() {
        const diffRaw = await gitDiffCommand();
        if (diffRaw) {
            this.changes = parseDiff(diffRaw);
            // this.changesByFile = new Map(); // TODO: Memory leak?
            // this.changes.forEach(change => this.changesByFile.set(change.filename, change.lines));
            this.diffText = diffRaw;
            this.diffIndex.update(this.changes);
        }
    }



    nextPosition(fp: FilePosition): FilePosition | undefined {
        const newPos = this.diffIndex.findNextPosition(fp);
        console.log(`nextPosition: ${printFp(fp)} --> ${printFp(newPos)}`);
        return newPos;
        // let nextRelativePath = this.changes[0].filename;
        // let nextLine = 0; //new vscode.Position(0, 0);

        // return this.diffIndex.nextPosition(fp.line, fp.relativePath);
        // const currentRelativePath = fp.relativePath;
        // const currentLine = fp.line;

        // const currentFileLines = this.changesByFile.get(currentRelativePath);
        // if (currentFileLines) {
        //     const nextRelativePath = currentRelativePath;
        //     const nextIndex = currentFileLines.findIndex(line => line > currentLine);
        //     if (nextIndex > -1) {
        //         // Current file
        //         const nextLine = currentFileLines[nextIndex];
        //         return {
        //             relativePath: nextRelativePath,
        //             line: nextLine
        //         };
        //     } else {
        //         // Next File and Next Line
        //         const nextFileIndex = this.changes.findIndex(c => c.filename === currentRelativePath) + 1;
        //         if (nextFileIndex > 0) {
        //             if (nextFileIndex < this.changes.length) {
        //                 const a = {
        //                     relativePath: this.changes[nextFileIndex].filename,
        //                     line: this.changes[nextFileIndex].lines[0]
        //                 };
        //                 return a;
        //             } else {
        //                 // No files left
        //                 return undefined;
        //             }

        //         } else {
        //             // Default to very start of git diffs
        //             return {
        //                 relativePath: this.changes[0].filename,
        //                 line: 0
        //             }
        //         }
        //     }

        // }
        // return undefined;

    }
    previousPosition(fp: FilePosition): FilePosition | undefined {
        const newPos = this.diffIndex.findPreviousPosition(fp);
        console.log(`nextPosition: ${printFp(fp)} --> ${printFp(newPos)}`);
        return newPos;


        // return this.diffIndex.previousPosition(fp.line, fp.relativePath);
        // const currentRelativePath = fp.relativePath;
        // const currentLine = fp.line;

        // const currentFileLines = this.changesByFile.get(currentRelativePath);
        // if (currentFileLines) {
        //     const previousRelativePath = currentRelativePath;
        //     const previousIndex = findLastIndex(currentFileLines, line => line > currentLine);
        //     if (previousIndex > -1) {
        //         // Current file
        //         const previousLine = currentFileLines[previousIndex];
        //         return {
        //             relativePath: previousRelativePath,
        //             line: previousLine
        //         };
        //     } else {
        //         // Previous File and Line
        //         const previousFileIndex = this.changes.findIndex(c => c.filename === currentRelativePath) - 1;
        //         if (previousFileIndex > -1) {
        //             if (previousFileIndex === -2) return undefined;
        //             return {
        //                 relativePath: this.changes[previousFileIndex].filename,
        //                 line: this.changes[previousFileIndex].lines.slice(-1)[0]
        //             }
        //         } else {
        //             // Default to very end of git diffs
        //             return {
        //                 relativePath: this.changes[this.changes.length - 1].filename,
        //                 line: this.changes[this.changes.length - 1].lines.slice(-1)[0]
        //             }
        //         }
        //     }

        // }
        // return undefined;
    }

}

function printFp(fp: FilePosition | undefined) {
    return `path=[${fp && fp.relativePath} line=${fp && fp.line}]`;
}

class DiffIndex {
    private flatFilePositions: FilePosition[];
    private changesByFile: Map<string, number[]>;


    constructor() {
        this.flatFilePositions = [];
        this.changesByFile = new Map();
    }

    update(changes: Change[]) {
        this.flatFilePositions = [];
        changes.forEach(change => this.changesByFile.set(change.filename, change.lines));
    }

    private firstLineNextFile(currentPosition: FilePosition): FilePosition {
        const keys = Array.from(this.changesByFile.keys());
        const nextFileIndex = keys.findIndex(fn => fn === currentPosition.relativePath) + 1;
        if (nextFileIndex - 1 === -1) throw Error('What? Shouldnt be');

        let relativePath = currentPosition.relativePath; // Default to current
        let line = currentPosition.line; // Default to current
        if (nextFileIndex < keys.length) {
            const newFilepath = keys[nextFileIndex];
            const nextFileChanges = this.changesByFile.get(newFilepath);
            if (nextFileChanges) {
                relativePath = newFilepath;
                line = nextFileChanges[0];
            }
        }
        return {
            relativePath,
            line
        }
    }

    private lastLinePreviousFile(currentPosition: FilePosition): FilePosition {
        const keys = Array.from(this.changesByFile.keys());
        const previousFileIndex = keys.findIndex(fn => fn === currentPosition.relativePath) - 1;
        if (previousFileIndex + 1 === -1) throw Error('What? Shouldnt be');

        let relativePath = currentPosition.relativePath;
        let line = currentPosition.line;
        if (previousFileIndex > -1) {
            const newFilepath = keys[previousFileIndex];
            const previousFileChanges = this.changesByFile.get(newFilepath);
            if (previousFileChanges) {
                relativePath = newFilepath;
                line = previousFileChanges.slice(-1)[0]; // last line
            }
        }
        return {
            relativePath,
            line
        }
    }

    findNextPosition(currentPosition: FilePosition): FilePosition {
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
        return this.flatFilePositions[0];

    }

    findPreviousPosition(currentPosition: FilePosition): FilePosition {
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
        return this.flatFilePositions.slice(-1)[0];

    }

    // findNext(currentLine: number, relFilePath: string): FilePosition | undefined {
    //     const newIndex = this.flatFilePositions.findIndex(fp => fp.relativePath === relFilePath &&
    //         fp.line > currentLine);
    //     if (newIndex > -1) {
    //         return {
    //             relativePath: this.flatFilePositions[newIndex].relativePath,
    //             line: this.flatFilePositions[newIndex].line
    //         }
    //     } else {
    //         return undefined;
    //     }

    // }

    // previousPosition(currentLine: number, relFilePath: string): FilePosition | undefined {
    //     const newIndex = findLastIndex(this.flatFilePositions, fp => fp.relativePath === relFilePath &&
    //         fp.line < currentLine);
    //     if (newIndex > -1) {
    //         return {
    //             relativePath: this.flatFilePositions[newIndex].relativePath,
    //             line: this.flatFilePositions[newIndex].line
    //         }
    //     } else {
    //         return undefined;
    //     }
    // }

}

// Like Array.findIndex() but instead finds the lastIndex
function findLastIndex<T>(arr: Array<T>, predicate: (value: T) => boolean) {
    const firstReverseIndex = arr.slice().reverse().findIndex(predicate);
    return (firstReverseIndex > -1) ? (arr.length - 1) - firstReverseIndex : -1;
}


// Algo: 
// Repeat the following for each +++ instance
//  - Parse the file path from the +++ line
//  - Find each @@, parse line number, until the next +++, @@, or EOF is reached
// export function parseDiff(diffText: string): Change[] {
//     const changes: Change[] = [];
//     for (const line of diffText.split('\n')) {
//         let currentChange: Change | null = null;
//         if (line.startsWith('+++')) {
//             if (currentChange !== null) {
//                 changes.push(currentChange);
//             }
//             currentChange = {
//                 filename: line.split('b/')[1],
//                 lines: []
//             }
//         } else if (currentChange !== null && line.startsWith('@@')) {
//             // Assumes @@ lines of the form: @@ -63,8 +63,8 @@ ...
//             const lineChangeNum = parseInt(line.split('@@ -')[1].split(',')[0]);
//             (currentChange as Change).lines.push(lineChangeNum);

//         }
//     }
//     return changes;
// }

export async function gitDiffCommand(): Promise<string | null> {
    const rootPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.path;
    // console.log(`rootPath: ${rootPath}`);
    if (rootPath) {
        const diffText = await shell.runCommand('git', ['diff'], { cwd: rootPath });
        // console.log(`git diff: ${diffText}`);
        return diffText
    } else {
        console.log(`You do not have a workspace folder open so we can't determine your root path`);
        return null;
    }
}

/*
index 9f6adbf..4c7fe70 100644
--- a/scripts/src/CoinMarketCap.ts
+++ b/scripts/src/CoinMarketCap.ts
@@ -63,8 +63,8 @@ async function _getPrice(url) {
     return Big(JSON.parse((await request(url)).text)[0].price_cad);
 }
 
-export async function getPricesRaw(): Promise<PricesRaw> {
-    const uBTC = `https://api.coinmarketcap.com/v1/ticker/bitcoin/?convert=CAD`;
+export async function getPricesRaw(): aPromise<PricesRaw> {
+    abcconst uBTC = `https://api.coinmarketcap.com/v1/ticker/bitcoin/?convert=CAD`;
     const uLTC = `https://api.coinmarketcap.com/v1/ticker/litecoin/?convert=CAD`;
     const uETH = `https://api.coinmarketcap.com/v1/ticker/ethereum/?convert=CAD`;
     const uRAI = `https://api.coinmarketcap.com/v1/ticker/raiblocks/?convert=CAD`;
@@ -84,5 +84,5 @@ export async function getPricesRaw(): Promise<PricesRaw> {
 }
 
 async function _getPriceRaw(url) {
-    return JSON.parse((await request(url)).text)[0];
+    return JSON.parse((a2wait request(url)).text)[0];
 }
\ No newline at end of file
diff --git a/web/tsconfig.json b/web/tsconfig.json
index 2bd7781..be12ec3 100644
--- a/web/tsconfig.json
+++ b/web/tsconfig.json
@@ -1,5 +1,5 @@
 {
-    "compilerOptions": {
+    "DEBUGcompilerOptions": {
         "target": "es2016",
         "module": "commonjs",
         "sourceMap": true,
*/

async function gitDiff() {

    // TODO DETERMINE HOW explorerCommands.ts in git-lens repo sets repoPath
    // e.g. :
    // async terminalPushCommit(node: ExplorerNode) {
    //     if (!(node instanceof CommitNode)) return;

    //     const branch = node.branch || await Container.git.getBranch(node.repoPath);
    //     if (branch === undefined) return;

    //     const command = `push ${branch.getRemote()} ${node.ref}:${branch.getName()}`;
    //     this.sendTerminalCommand(command, node.repoPath);
    // }


    // const diffResult = await shell.runCommand('git', ['--version']);
    // const diffResult = await shell.runCommand('pwd', [], {cwd: vscode.workspace.rootPath});

    // console.log(`diffResult: ${diffResult}`);
    const rootPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.path;
    // console.log(`rootPath: ${rootPath}`);
    if (rootPath) {
        const diffResult = await shell.runCommand('git', ['diff'], { cwd: rootPath });
        // console.log(`git diff: ${diffResult}`);
    } else {
        console.log(`You do not have a workspace folder open so we can't determine your root path`);
    }
    // console.log(`process.env: ${JSON.stringify(process.env)}`);

    // const sc = vscode.scm.createSourceControl('git', 'git'); //, vscode.Uri.parse(vscode.scm.workspaceRoot));
    // console.log(`sc.rootUri: ${sc.rootUri}`);

    // function createResourceUri(relativePath: string): vscode.Uri {
    //     const absolutePath = path.join(vscode.workspace.rootPath, relativePath);
    //     return vscode.Uri.file(absolutePath);
    //   }

    //   const gitSCM = vscode.scm.createSourceControl('git', "Git");

    //   const index = gitSCM.createResourceGroup('index', "Index");
    //   index.resourceStates = [
    //     { resourceUri: createResourceUri('README.md') },
    //     { resourceUri: createResourceUri('src/test/api.ts') }
    //   ];

    //   const workingTree = gitSCM.createResourceGroup('workingTree', "Changes");
    //   workingTree.resourceStates = [
    //     { resourceUri: createResourceUri('.travis.yml') },
    //     { resourceUri: createResourceUri('README.md') }
    //   ];    
}