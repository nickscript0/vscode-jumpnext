import * as vscode from 'vscode';
import * as shell from './shell';
import {Change, parseDiff} from './git-diff';

// function refreshGitCache(document: vscode.TextDocument | vscode.WorkspaceFoldersChangeEvent) {
//     // TODO: run git diff on save
// }



export class GitDiffCache {
    private diffText: string;
    private changes: Change[];

    constructor() {
        this.diffText = '';
        this.changes = [];
    }
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
    console.log(`rootPath: ${rootPath}`);
    if (rootPath) {
        const diffText = await shell.runCommand('git', ['diff'], { cwd: rootPath });
        console.log(`git diff: ${diffText}`);
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
    console.log(`rootPath: ${rootPath}`);
    if (rootPath) {
        const diffResult = await shell.runCommand('git', ['diff'], { cwd: rootPath });
        console.log(`git diff: ${diffResult}`);
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