import * as vscode from 'vscode';

export async function updateCursorPosition(newPositionFunc: NewPositionFunc) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const newPosition = await newPositionFunc(editor.document, editor.selection.active);
        const newSelection = new vscode.Selection(newPosition, newPosition);
        // Move the cursor
        editor.selection = newSelection;
        // Move the editor window
        editor.revealRange(newSelection, vscode.TextEditorRevealType.Default);
        // console.log(`Moved cursor to line ${newPosition.line}`);
    }
}


// TODO: this could be cached per openPage, on pageOpen and pageChange events
async function getSymbols(document: vscode.TextDocument) {
    const symbols = await vscode.commands.executeCommand<vscode.SymbolInformation[]>('vscode.executeDocumentSymbolProvider', document.uri);
    if (!symbols) return [];
    return symbols //.filter(s => SYMBOL_WHITELIST.includes(s.kind));
}

export type NewPositionFunc = (document: vscode.TextDocument, currentPosition: vscode.Position)
    => Promise<vscode.Position>;

export const nextSymbolPosition: NewPositionFunc = async (document, currentPosition) => {
    return _getNewSymbolPosition(document, currentPosition,
        (symbols, currentPosition) =>
            symbols.findIndex(s => s.location.range.start.line > currentPosition.line));
};

export const previousSymbolPosition: NewPositionFunc = async (document, currentPosition) => {
    return _getNewSymbolPosition(document, currentPosition,
        (symbols, currentPosition) =>
            findLastIndex(symbols, s => s.location.range.start.line < currentPosition.line));
};

export const nextSymbolPositionSameScope: NewPositionFunc = async (document, currentPosition) => {
    return _getNewSymbolPosition(document, currentPosition,
        (symbols, currentPosition) => {
            const currentSymbol = symbols.find(s => s.location.range.start.line === currentPosition.line);
            return symbols.findIndex(s => currentSymbol !== undefined &&
                (s.location.range.start.line > currentPosition.line && currentSymbol.containerName === s.containerName));
        })
};

export const previousSymbolPositionSameScope: NewPositionFunc = async (document, currentPosition) => {
    return _getNewSymbolPosition(document, currentPosition,
        (symbols, currentPosition) => {
            const currentSymbol = symbols.find(s => s.location.range.start.line === currentPosition.line);
            return findLastIndex(symbols, s => currentSymbol !== undefined &&
                (s.location.range.start.line < currentPosition.line && currentSymbol.containerName === s.containerName));
        })
};

// Like Array.findIndex() but instead finds the lastIndex
function findLastIndex<T>(arr: Array<T>, predicate: (value: T) => boolean) {
    const firstReverseIndex = arr.slice().reverse().findIndex(predicate);
    return (firstReverseIndex > -1) ? (arr.length - 1) - firstReverseIndex : -1;
}

async function _getNewSymbolPosition(document: vscode.TextDocument, currentPosition: vscode.Position,
    calcNewPosition: (a: vscode.SymbolInformation[], b: vscode.Position) => number): Promise<vscode.Position> {
    const symbols = await getSymbols(document);
    const newIndex = calcNewPosition(symbols, currentPosition);
    return _symbolsArrToPosition(newIndex, symbols, currentPosition);
}

function _symbolsArrToPosition(index: number, symbols: vscode.SymbolInformation[],
    defaultPosition: vscode.Position): vscode.Position {
    let line = defaultPosition.line;
    let character = defaultPosition.character;
    if (index > -1 && symbols[index] && symbols[index].location) {
        line = symbols[index].location.range.start.line;
        character = symbols[index].location.range.start.character;
        // TODO: display the current symbol type in a tooltip or in window footer?
        // console.log(`Current symbol kind=${SymbolStrings[symbols[index].kind]}, container=${symbols[index].containerName}`);
    }
    return new vscode.Position(line, character);
}

// DEBUG
// const currentIndex = symbols.findIndex(s => s.location.range.start.line === currentPosition.line) // DEBUG
// console.log(`Current symbol ${SymbolStrings[symbols[currentIndex] && symbols[currentIndex].kind]}`); // DEBUG
export const SymbolStrings = {
    0: "File",
    1: "Module",
    2: "Namespace",
    3: "Package",
    4: "Class",
    5: "Method",
    6: "Property",
    7: "Field",
    8: "Constructor",
    9: "Enum",
    10: "Interface",
    11: "Function",
    12: "Variable",
    13: "Constant",
    14: "String",
    15: "Number",
    16: "Boolean",
    17: "Array",
    18: "Object",
    19: "Key",
    20: "Null",
    21: "EnumMember",
    22: "Struct",
    23: "Event",
    24: "Operator",
    25: "TypeParameter",
    false: "Undefined"
};

// Symbols to jump to
const SYMBOL_WHITELIST = [
    vscode.SymbolKind.Class,
    vscode.SymbolKind.Constructor,
    vscode.SymbolKind.Enum,
    vscode.SymbolKind.Event, // Keep?
    vscode.SymbolKind.Field,
    vscode.SymbolKind.File, // Keep?
    vscode.SymbolKind.Function,
    vscode.SymbolKind.Interface,
    vscode.SymbolKind.Method,
    vscode.SymbolKind.Namespace,
    vscode.SymbolKind.Property,
    vscode.SymbolKind.Struct,
    vscode.SymbolKind.TypeParameter, // Keep?
    vscode.SymbolKind.Module,

    // vscode.SymbolKind.Key,
    // vscode.SymbolKind.String,
];