'use strict';

import * as vscode from 'vscode';

import * as git from './git';
import * as symbols from './symbols';
import * as editor from './editor';

export function activate(context: vscode.ExtensionContext) {
    const gitEnabled = vscode.workspace.getConfiguration('git', null!).get<boolean>('enabled', true);
    if (!gitEnabled) {
        console.log(`'Next/Previous Local Change' is not available as this project does not have git available -- "git.enabled": false`);
        // Custom workspace property we can reference when checking whether to run git features
        // context.workspaceState.update('git.enabled', false);
    }

    const gitDiffCache = new git.GitDiffCache();
    if (gitEnabled) gitDiffCache.update(); // Get the current git diff at startup

    // Register event handlers
    vscode.workspace.onDidSaveTextDocument(d => {
        // TODO: works fine not awaiting here, but should we anyways?
        if (gitEnabled) gitDiffCache.update();
    });
    vscode.workspace.onDidChangeWorkspaceFolders(d => {
        if (gitEnabled) gitDiffCache.update();
    });
    // vscode.workspace.onDidOpenTextDocument(d => {
    //     if (gitEnabled) gitDiffCache.update();
    // });

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
        const fp = editor.currentFilePosition();
        if (fp) {
            const nextPosition = gitDiffCache.nextPosition(fp);
            if (nextPosition) {
                nextPosition.line -= 1; // vscode starts at line 0, git lib starts at line 1
                editor.openDocument(nextPosition.relativePath,
                    new vscode.Position(nextPosition.line, 0));
            }
        }
    });
    const previousLocalChangeCommand = vscode.commands.registerCommand('extension.jump.previousLocalChange', async () => {
        const fp = editor.currentFilePosition();
        if (fp) {
            const nextPosition = gitDiffCache.previousPosition(fp);
            if (nextPosition) {
                nextPosition.line -= 1; // vscode starts at line 0, git lib starts at line 1
                editor.openDocument(nextPosition.relativePath,
                    new vscode.Position(nextPosition.line, 0));
            }
        }
    });


    context.subscriptions.push(
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

