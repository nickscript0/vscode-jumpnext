import * as vscode from 'vscode';


export async function getSymbols(document: vscode.TextDocument) {
    const symbols = await vscode.commands.executeCommand<vscode.SymbolInformation[]>('vscode.executeDocumentSymbolProvider', document.uri);
    if (!symbols) return [];
    return symbols.filter(s => s.containerName === '');
}

export type NewPositionFunc = (document: vscode.TextDocument, currentPosition: vscode.Position) => Promise<number>;

export const nextSymbolPosition: NewPositionFunc = async (document, currentPosition) => {
    const symbols = await getSymbols(document);
    // currentPosition.line
    const next = symbols.map(s => s.location.range.start.line)
        .find(symbolLine => symbolLine > currentPosition.line);
    return (next !== undefined) ? next : currentPosition.line;
};

export const previousSymbolPosition: NewPositionFunc = async (document, currentPosition) => {
    const symbols = await getSymbols(document);
    // currentPosition.line
    const symbolLines = symbols.map(s => s.location.range.start.line);
    const prevIndex = symbolLines.indexOf(currentPosition.line) - 1;

    // console.log(`Of the available lines: ${JSON.stringify(symbols.map(s => s.location.range.start.line))}, current=${currentPosition.line}, prev=${prev}`);

    return (prevIndex > -1) ? symbolLines[prevIndex] : currentPosition.line;
};
