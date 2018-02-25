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
import * as path from 'path';

import * as git from './git';
import * as symbols from './symbols';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "jumpnext" is now active!');

    const gitEnabled = vscode.workspace.getConfiguration('git', null!).get<boolean>('enabled', true);
    if (!gitEnabled) {
        console.log(`Jump next local change is not available as this project does not have git available -- "git.enabled": false`);

        // Custom property we can reference when checking whether to run git features
        context.workspaceState.update('git.enabled', false);
    } else {
        console.log(`GIT IS AVAILABLE!`);
    }

    const gitDiffCache = new git.GitDiffCache();
    // Register event handlers
    vscode.workspace.onDidSaveTextDocument(d => {
        console.log(`onDidSaveTextDocument event fired`)
        // TODO: should be await or then?
        gitDiffCache.update();
    });
    vscode.workspace.onDidChangeWorkspaceFolders(d => {
        console.log(`onDidChangeWorkspaceFolders event fired`);
        // TODO: should be await or then?
        gitDiffCache.update();
    });
    // TODO: could maybe skip the openTextDocument event for efficiency and instead just populate the gitCache on startup
    vscode.workspace.onDidOpenTextDocument(d => {
        console.log(`onDidOpenTextDocument event fired`);
        // TODO: should be await or then?
        gitDiffCache.update();
    });

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

        //const selection = editor.selection;
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

        console.log(`URI IS: uri.path=${editor.document.uri.path} uri.fspath=${editor.document.uri.fsPath}`);
        // const a = editor.document.uri.with({path: 'abc'});

    });

    const nextSymbolCommand = vscode.commands.registerCommand('extension.jump.nextSymbol', async () => {
        symbols.updateCursorPosition(symbols.nextSymbolPosition);
    });
    const previousSymbolCommand = vscode.commands.registerCommand('extension.jump.previousSymbol', async () => {
        symbols.updateCursorPosition(symbols.previousSymbolPosition);
    });
    const nextSymbolCommandSameScope = vscode.commands.registerCommand('extension.jump.nextSymbolSameScope', async () => {
        symbols.updateCursorPosition(symbols.nextSymbolPositionSameScope);
    });
    const previousSymbolCommandSameScope = vscode.commands.registerCommand('extension.jump.previousSymbolSameScope', async () => {
        symbols.updateCursorPosition(symbols.previousSymbolPositionSameScope);
    });

    const nextLocalChangeCommand = vscode.commands.registerCommand('extension.jump.nextLocalChange', async () => {
        console.log(`Command nextLocalChange triggered!`);
        const fp = currentFilePosition();
        printFp(`next`, fp);
        if (fp) {
            const nextPosition = gitDiffCache.nextPosition(fp);
            if (nextPosition) {
                // console.log(`GIT JUMP NEXT ATTEMPT!`);
                nextPosition.line -= 1; // vscode starts at line 0, git lib starts at line 1
                openDocument(nextPosition.relativePath,
                    new vscode.Position(nextPosition.line, 0));
            }
        }
    });
    const previousLocalChangeCommand = vscode.commands.registerCommand('extension.jump.previousLocalChange', async () => {
        console.log(`Command previousLocalChange triggered!`);
        const fp = currentFilePosition();
        printFp(`previous`, fp);

        if (fp) {
            const nextPosition = gitDiffCache.previousPosition(fp);
            if (nextPosition) {
                // console.log(`GIT JUMP PREVIOUS ATTEMPT!`);
                nextPosition.line -= 1; // vscode starts at line 0, git lib starts at line 1
                openDocument(nextPosition.relativePath,
                    new vscode.Position(nextPosition.line, 0));
            }
        }
    });


    context.subscriptions.push(sayHelloCommand,
        nextSymbolCommand,
        previousSymbolCommand,
        nextSymbolCommandSameScope,
        previousSymbolCommandSameScope);

    if (gitEnabled) {
        context.subscriptions.push(nextLocalChangeCommand, previousLocalChangeCommand);
    }

}

function printFp(m: string, fp: git.FilePosition | undefined) {
    console.log(`${m} path=${fp && fp.relativePath} line=${fp && fp.line}`);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

async function openDocument(relFilename: string, cursorPosition: vscode.Position) {
    // const doc1 = vscode.workspace.textDocuments[0]; //showTextDocument()
    // const rootPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.path;
    console.log(`openDocument: path=${relFilename} cursorLine=${cursorPosition.line}`);
    const baseDir = getBaseDir();
    if (baseDir) {
        const filename = path.join(baseDir, relFilename);
        // Open the filepath
        const doc = await vscode.workspace.openTextDocument(filename);
        // Move the cursor
        // const editor = vscode.window.activeTextEditor;
        // if (!editor) {
        //     return; // No open text editor
        // }
        const newEditor = await vscode.window.showTextDocument(doc);
        const newSelection = new vscode.Selection(cursorPosition, cursorPosition);
        console.log(`revealRange: (${newSelection.start.line}, ${newSelection.end.line})`);
        newEditor.selection = newSelection;
        newEditor.revealRange(newSelection, vscode.TextEditorRevealType.Default);

    }
}

function currentFilePosition(): git.FilePosition | undefined {
    const fname = vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.uri.path;
    const baseDir = getBaseDir();

    const editor = vscode.window.activeTextEditor;

    // Line + 1 as git lib starts at line 1 instead of line 0
    const line = editor ? editor.selection.active.line + 1 : undefined;
    const relativePath = fname && baseDir ? fname.split(baseDir + '/')[1] : undefined;

    return (line && relativePath) ? { line, relativePath } : undefined;
}

function getBaseDir() {
    // TODO: test this with multiple workspace folders open
    return vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.path;
}