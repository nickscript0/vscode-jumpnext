'use strict';
/**
 * TODO:
 * - Look into official git plugin to see how they determine a file has local diffs on it
 * - Look further into how git-lens sets node.repoPath in 'terminalPushCommit(node: ExplorerNode)'
 * - Look into Code Outline extension, filter the functions in it retrieve line numbers, and jump to next
 * 
 *     private getSymbols(document: TextDocument): Thenable<SymbolInformation[]> {
        return commands.executeCommand<SymbolInformation[]>('vscode.executeDocumentSymbolProvider', document.uri);
    }
    returns SymbolInformation which has a location property! https://code.visualstudio.com/docs/extensionAPI/vscode-api#SymbolInformation
 */

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as shell from './shell';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "jumpnext" is now active!');

    // Register event handlers
    vscode.workspace.onDidSaveTextDocument(d => console.log(`onDidSaveTextDocument event fired`));
    vscode.workspace.onDidChangeWorkspaceFolders(d => console.log(`onDidChangeWorkspaceFolders event fired`));
    vscode.workspace.onDidOpenTextDocument(d => console.log(`onDidOpenTextDocument event fired`));

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    const sayHelloCommand = vscode.commands.registerCommand('extension.sayHello', async () => {
        // The code you place here will be executed every time your command is executed

        // // Display a message box to the user
        // vscode.window.showInformationMessage('Hello World!');
        // console.log('Ran Hello World command!!!!!');

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }

        const selection = editor.selection;
        // const text = editor.document.getText(selection);
        const position = editor.selection.active;
        console.log(`editor.selection.active.line: ${position.line}`);
        // editor.selection.active = position; //position.with(3, 0);


        const newPosition = position.with(position.line + 1, 0);
        const newSelection = new vscode.Selection(newPosition, newPosition);
        editor.selection = newSelection;
        // // check if there is no selection
        // if (editor.selection.isEmpty) {
        //     // the Position object gives you the line and character where the cursor is
        //     const position = editor.selection.active;
        //     position.line
        // }            

        await gitTest();
    });

    const nextSymbolCommand = vscode.commands.registerCommand('extension.sayHello.nextSymbol', async () => {
        console.log(`Command nextSymbol triggered!`);
    });
    const previousSymbolCommand = vscode.commands.registerCommand('extension.sayHello.previousSymbol', async () => {
        console.log(`Command previousSymbol triggered!`);
    });
    const nextLocalChangeCommand = vscode.commands.registerCommand('extension.sayHello.nextLocalChange', async () => {
        console.log(`Command nextLocalChange triggered!`);
    });
    const previousLocalChangeCommand = vscode.commands.registerCommand('extension.sayHello.previousLocalChange', async () => {
        console.log(`Command previousLocalChange triggered!`);
    });


    context.subscriptions.push(sayHelloCommand,
        nextSymbolCommand,
        previousSymbolCommand,
        nextLocalChangeCommand,
        previousLocalChangeCommand);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

function refreshGitCache(document: vscode.TextDocument | vscode.WorkspaceFoldersChangeEvent) {
    // TODO: run git diff on save
}

async function gitTest() {

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
        const diffResult = await shell.runCommand('git', ['status'], { cwd: rootPath });
        console.log(`git status: ${diffResult}`);
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