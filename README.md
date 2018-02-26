# JumpNext extension for Visual Studio Code

> Quickly navigate code jumping by symbol or local change.

## Features


Adds the ability to jump your cursor to the next (or previous):
- code symbol (e.g. functions, methods, imports, ...) in the active window
- local (uncommitted git) change across all files in your workspace

### Available commands are:

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
