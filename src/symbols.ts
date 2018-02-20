import * as vscode from 'vscode';


export async function getSymbols(document: vscode.TextDocument) {
    const symbols = await vscode.commands.executeCommand<vscode.SymbolInformation[]>('vscode.executeDocumentSymbolProvider', document.uri);
    if (!symbols) return [];
    return symbols; //.filter(s => s.containerName === '');
}

export type NewPositionFunc = (document: vscode.TextDocument, currentPosition: vscode.Position) => Promise<vscode.Position>;

export const nextSymbolPosition: NewPositionFunc = async (document, currentPosition) => {
    const symbols = await getSymbols(document);
    const nextLineIndex = symbols.findIndex(s => s.location.range.start.line > currentPosition.line);
    return _symbolsArrToPosition(nextLineIndex, symbols, currentPosition);
};

export const previousSymbolPosition: NewPositionFunc = async (document, currentPosition) => {
    const symbols = await getSymbols(document);
    const prevIndex = symbols.findIndex(s => s.location.range.start.line === currentPosition.line) - 1;
    return _symbolsArrToPosition(prevIndex, symbols, currentPosition);
};

function _symbolsArrToPosition(index: number, symbols: vscode.SymbolInformation[],
    defaultPosition: vscode.Position): vscode.Position {
    let line = defaultPosition.line;
    let character = defaultPosition.character;
    if (index !== -1) {
        line = symbols[index].location.range.start.line;
        character = symbols[index].location.range.start.character;
    }
    return new vscode.Position(line, character);
}