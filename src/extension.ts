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
        gitDiffCache.update();
    });
    vscode.workspace.onDidChangeWorkspaceFolders(d => {
        console.log(`onDidChangeWorkspaceFolders event fired`);
        gitDiffCache.update();
    });
    // TODO: could maybe skip the openTextDocument event for efficiency and instead just populate the gitCache on startup
    vscode.workspace.onDidOpenTextDocument(d => {
        console.log(`onDidOpenTextDocument event fired`);
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
    });
    const previousLocalChangeCommand = vscode.commands.registerCommand('extension.jump.previousLocalChange', async () => {
        console.log(`Command previousLocalChange triggered!`);
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

// this method is called when your extension is deactivated
export function deactivate() {
}

