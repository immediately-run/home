# Home — the immediately.run launcher

The signed-in launcher bound at `page.home`: the greeting row, the two link
tiles and the footer, with the recents and spaces sections landing on top
(see the `workbench-modes` roadmap items in the
[docs repo](https://github.com/immediately-run/docs)).

Runs as an immediately.run app — React + TypeScript loaded from this repo and
transpiled in the browser. The repo rules (entry point, sandbox limits, the
SDK API index) are in `CLAUDE.md`; verify with:

```bash
npm run verify   # lint && build && test
```
