# prview

A terminal UI for reviewing GitHub PRs without leaving your terminal. Browse open PRs, read diffs, approve or reject — all from the keyboard.

![prview demo](demo.gif)

## install

```bash
bun install -g prview
```

or run directly with bun:

```bash
bunx prview
```

## setup

on first run prview will ask for a GitHub personal access token.

1. generate a token at [github.com/settings/tokens](https://github.com/settings/tokens)
2. select `repo` scope
3. paste it into prview — or press `[o]` to open github directly from the terminal

token is stored at `~/.prview/config.json` and never asked again.

## usage

```bash
cd your-repo
prview
```

prview detects the github remote automatically from your current directory.

```bash
prview --help       # show usage and keyboard shortcuts
prview uninstall    # remove all prview data from ~/.prview
```

## keyboard shortcuts

### PR list

| key     | action          |
| ------- | --------------- |
| `↑↓`    | navigate PRs    |
| `enter` | open diff       |
| `a`     | approve PR      |
| `r`     | request changes |
| `q`     | quit            |

### diff view

| key           | action                  |
| ------------- | ----------------------- |
| `↑↓`          | scroll lines            |
| `←→` or `j/k` | switch files            |
| `v`           | view full file          |
| `c`           | comment on current line |
| `a`           | approve PR              |
| `r`           | request changes         |
| `esc`         | back to PR list         |
| `q`           | quit                    |

### file view

| key   | action       |
| ----- | ------------ |
| `↑↓`  | scroll lines |
| `v`   | back to diff |
| `esc` | back to diff |
| `q`   | quit         |

## features

- detects github repo automatically from git remote
- browse all open PRs with author and age
- read file diffs with syntax highlighting
- subtle green/red backgrounds for additions and removals
- view full file with changed lines highlighted
- approve or request changes with an optional comment
- inline comments on specific diff lines
- dynamic layout adapts to your terminal size
- first time setup with browser open shortcut

## tech stack

- [React Ink](https://github.com/vadimdemedes/ink) — terminal UI
- [Bun](https://bun.sh) — runtime and package manager
- [simple-git](https://github.com/steveukx/git-js) — git remote detection
- [cli-highlight](https://github.com/felixfbecker/cli-highlight) — syntax highlighting
- [figlet](https://github.com/patorjk/figlet.js) — banner text

## uninstall

```bash
prview uninstall    # removes ~/.prview config
bun remove -g prview
```

## license

MIT
