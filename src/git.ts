import * as vscode from 'vscode';
import * as shell from './shell';

// function refreshGitCache(document: vscode.TextDocument | vscode.WorkspaceFoldersChangeEvent) {
//     // TODO: run git diff on save
// }

export async function gitTest() {

    // TODO DETERMINE HOW explorerCommands.ts in git-lens repo sets repoPath
    // e.g. :
    // async terminalPushCommit(node: ExplorerNode) {
    //     if (!(node instanceof CommitNode)) return;

    //     const branch = node.branch || await Container.git.getBranch(node.repoPath);
    //     if (branch === undefined) return;

    //     const command = `push ${branch.getRemote()} ${node.ref}:${branch.getName()}`;
    //     this.sendTerminalCommand(command, node.repoPath);
    // }


    // const diffResult = await shell.runCommand('git', ['--version']);
    // const diffResult = await shell.runCommand('pwd', [], {cwd: vscode.workspace.rootPath});

    // console.log(`diffResult: ${diffResult}`);
    const rootPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.path;
    console.log(`rootPath: ${rootPath}`);
    if (rootPath) {
        const diffResult = await shell.runCommand('git', ['status'], { cwd: rootPath });
        console.log(`git status: ${diffResult}`);
    } else {
        console.log(`You do not have a workspace folder open so we can't determine your root path`);
    }
    // console.log(`process.env: ${JSON.stringify(process.env)}`);

    // const sc = vscode.scm.createSourceControl('git', 'git'); //, vscode.Uri.parse(vscode.scm.workspaceRoot));
    // console.log(`sc.rootUri: ${sc.rootUri}`);

    // function createResourceUri(relativePath: string): vscode.Uri {
    //     const absolutePath = path.join(vscode.workspace.rootPath, relativePath);
    //     return vscode.Uri.file(absolutePath);
    //   }

    //   const gitSCM = vscode.scm.createSourceControl('git', "Git");

    //   const index = gitSCM.createResourceGroup('index', "Index");
    //   index.resourceStates = [
    //     { resourceUri: createResourceUri('README.md') },
    //     { resourceUri: createResourceUri('src/test/api.ts') }
    //   ];

    //   const workingTree = gitSCM.createResourceGroup('workingTree', "Changes");
    //   workingTree.resourceStates = [
    //     { resourceUri: createResourceUri('.travis.yml') },
    //     { resourceUri: createResourceUri('README.md') }
    //   ];    
}