# JumpNext extension for Visual Studio Code
## Features

Adds the ability to move your cursor to the next (or previous) code symbol (e.g. functions, methods, imports, ...) or local git change.

The available commands are:

| Command | Keyboard Shortcut |
| --- | --- |
| Previous Symbol | `ctrl+[` |
| Next Symbol | `ctrl+]` |
| Previous Symbol - Same Scope | `ctrl+shift+[` |
| Next Symbol - Same Scope | `ctrl+shift+]` |
| Previous Local Change | `ctrl+,` |
| Next Local Change | `ctrl+.` |

## Requirements

If your project is not using git, `Previous Local Change` and `Next Local Change` commands will be disabled.

## Known Issues

The following issues will be addressed in a later release:
- Does not yet support multiple workspace folders open at once
- `Next Local Change` does not jump to every fine grained diff (as shown by the git change gutter highlight), but instead jumps to the course grained diffs output by the `git diff` command

## Release Notes

### 1.0.0

Initial release.
