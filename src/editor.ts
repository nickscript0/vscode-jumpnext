import * as vscode from 'vscode';
import * as path from 'path';

import { FilePosition } from './git';

export async function openDocument(relFilename: string, cursorPosition: vscode.Position) {
    const baseDir = getBaseDir();
    if (baseDir) {
        const filename = path.join(baseDir, relFilename);
        // Open the new path
        const doc = await vscode.workspace.openTextDocument(filename);
        const newEditor = await vscode.window.showTextDocument(doc);
        // Move the cursor
        const newSelection = new vscode.Selection(cursorPosition, cursorPosition);
        newEditor.selection = newSelection;
        // Scroll the window
        newEditor.revealRange(newSelection, vscode.TextEditorRevealType.Default);

    }
}

export function currentFilePosition(): FilePosition | undefined {
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