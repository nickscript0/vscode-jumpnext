export interface Change {
    filename: string;
    lines: number[];
}

// Algo: 
// Repeat the following for each +++ instance
//  - Parse the file path from the +++ line
//  - Find each @@, parse line number, until the next +++, @@, or EOF is reached
export function parseDiff(diffText: string): Change[] {
    const changes: Change[] = [];
    for (const line of diffText.split('\n')) {
        let currentChange: Change | null = null;
        console.log(`CURRENT: ${line}`);
        if (line.startsWith('+++')) {
            console.log(`current line +++ MATCH!!! ${line}`);
            
            if (currentChange !== null) {
                changes.push(currentChange);
            }
            currentChange = {
                filename: line.split('b/')[1],
                lines: []
            }
        } else if (currentChange !== null && line.startsWith('@@')) {
            console.log(`current line @@ MATCH!!! ${line}`);
            
            // Assumes @@ lines of the form: @@ -63,8 +63,8 @@ ...
            const lineChangeNum = parseInt(line.split('@@ -')[1].split(',')[0]);
            (currentChange as Change).lines.push(lineChangeNum);

        }
    }
    return changes;
}