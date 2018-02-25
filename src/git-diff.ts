export interface Change {
    filename: string;
    lines: number[];
}

// Algorithm: Repeat the following for each +++ instance
//  - Parse the file path from the +++ line
//  - Find each @@, parse line number, find the next line that starts 
//    with - or + but not followed by "++ b", calculate and record the absolute line number
export function parseDiff(diffText: string): Change[] {
    const changes: Change[] = [];
    let currentChange: Change | null = null;
    let startAbsoluteDiffLine: number | null = null;
    let startRelativeDiffLine: number | null = null;

    const lines = diffText.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('+++ b/')) {
            startAbsoluteDiffLine = null;
            startRelativeDiffLine = null;
            if (currentChange !== null) {
                changes.push(currentChange);
            }
            currentChange = {
                filename: line.split('b/').slice(1).join('b/'),
                lines: []
            }
        } else if (currentChange !== null && line.startsWith('@@')) {
            // Assumes @@ lines of the form: @@ -63,8 +63,8 @@ ...
            startAbsoluteDiffLine = parseInt(line.split('@@ -')[1].split(',')[0]);
            startRelativeDiffLine = i + 1;
        } else if (currentChange !== null && startAbsoluteDiffLine !== null && startRelativeDiffLine !== null
            && /^[-+](?!\+\+ b)/.test(line)) {
            // Match a line that starts with - or + but not followed by "++ b"
            const linesFromStartOfDiff = i - startRelativeDiffLine;
            // TODO: VSC or Typescript bug? [ts] 'calculatedLineNum' is declared but its value is never read.
            const calculatedLineNum = linesFromStartOfDiff + startAbsoluteDiffLine;
            currentChange.lines.push(calculatedLineNum);
            startRelativeDiffLine = null;
        }
    }

    if (currentChange !== null) changes.push(currentChange);
    return changes;
}