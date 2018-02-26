export interface Change {
    filename: string;
    lines: number[];
}

/* TODO: Algo refinement for fine-grained diffs: 
***The Problem: fine-grained diffs can be addition only, subtraction only, or both; making it 
hard to keep track of the absolute line number. e.g.:
@@ -63,19
...
...
+
...
...
-
+
...
...
-
-
+
+
...

***The Solution: 
Split the file by @@ blocks. Each block is put in a data structure that tracks
add, sub, add/sub cases and the absolute line number for each. 
*/

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
            // TODO: BUG: this should parse the SECOND number in the @@
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

// Takes a git diff block after a "@@ -63,8 +63,8 @@" line, breaks it into segments
// where +- are separated by one or more lines, and calculates the absolute line numbers
class PlusMinusCounter {
    block: string;
    absoluteStartLine: number;

    constructor(block: string, absoluteStartLine: number) {
        this.block = block;
        this.absoluteStartLine = absoluteStartLine;
    }

    parse() {
        // TODO: just do multiline regex for the 3 cases:
        // 1. One or more lines that start with + : In this case each line counts
        // 2. One or more lines that start with - : In this case each line counts
        // 3. One or more lines that start with +- : In this case only half of the lines count (unless non-symmetric +/- sections are possible??)
    }
}