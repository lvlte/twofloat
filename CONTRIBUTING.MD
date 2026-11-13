# Notes for Contributors

Thank you for your interest in **twofloat**!

Whether you want to contribute code, report bugs, request a feature, improve documentation, create your own custom build, or simply run the test suites locally, this guide will help you get set up.

## Filing an Issue

If you encounter a bug or a numerical inconsistency, if something is missing from the documentation, or if you have a feature request:
- Check existing [GitHub Issues](https://github.com/lvlte/twofloat/issues) to see if it has already been reported.
- If it has, upvote the issue and/or add a comment with any additional relevant details.
- Otherwise open a new issue with:
  - A clear, descriptive title.
  - For bug reports: a minimal reproducible example with actual vs expected results.
  - If relevant: the `twofloat` version, environment details, and any other helpful context.

## Contributing

If you are planning to submit a Pull Request, please review the guidelines below. Basic familiarity with Git and GitHub is assumed.

---

## Prerequisites

### Node.js & npm

The recommended Node.js version is pinned in [.nvmrc](.nvmrc). If you use a version manager like [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm), simply run the `install` and/or `use` command in your local twofloat directory.

Otherwise go to https://nodejs.org/en/download, select the pinned version and follow the instructions. In any case, ensure your environment satisfies:

- Node.js: ^22.18.0 || ^24.11.0 || >=26.0.0
- npm: >=11.16.0

### Julia

Julia is only required for running the high-precision accuracy tests. It is NOT required for general development, building, or running unit tests. If you want to submit a small contribution that doesn't involve mathematical functions, you can skip this section.

- Recommended version: latest, or at least `1.10` (see the [Installation Manual](https://docs.julialang.org/en/v1/manual/installation/)).
- Dependencies: running the tests for the first time will automatically fetch and precompile the required packages into the project environment, no manual installation is needed (you can inspect the [project](Project.toml) and [manifest](Manifest.toml) files to see what packages get installed).

### Coreutils (Windows only)

If you are on Windows and not under WSL, ensure you have [Coreutils](https://learn.microsoft.com/en-us/windows/core-utils/overview) installed.

### Local Project Setup

- Clone the repository:
  - Contributors: [Fork](https://github.com/lvlte/twofloat/fork) the repository, then clone your fork ([what's a fork?](https://docs.github.com/en/pull-requests/how-tos/work-with-forks/fork-a-repo)).
  - Just testing: [clone](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) the repository.

- Install dependencies: go into your local twofloat directory and run:

  ```bash
  npm install
  ```

## Running Tests

To run the complete test suite (requires Julia):

```bash
npm test
```

To run all tests except those requiring Julia:

```bash
npm run test:nojl
```

See the [Scripts Reference](#scripts-reference) for more info about the individual test scripts.

## Building the Library

The project uses [`tsdown`](https://github.com/rolldown/tsdown) to build the distribution packages:

```bash
npm run build
```

The build produces:
- `dist/esm/*` — ES Modules distribution for modern runtimes (Node.js, browser, bundlers).
- `dist/cjs/*` — CommonJS distribution for Node.js.
- `dist/umd/*` — Minified UMD bundle with source maps for browsers.

> [!TIP]
> **Custom build** — If you don't like bundlers, you can add an entry in [tsdown.config.ts](tsdown.config.ts) to produce your own custom build (see the [API reference](https://tsdown.dev/reference/api/Interface.UserConfig)).

## Code Style & Guidelines

Code quality and consistency are enforced via strict TypeScript compiler settings and lint rules.

### Linting and Formatting

If you use [VS Code](https://code.visualstudio.com/), the repository includes pre-configured workspace settings, which include recommended extensions for linting and Julia language support. If you enable the integrated XO linter, make sure to disable the ESLint extension for this workspace if you have it enabled globally to avoid conflicts.

If you work without IDE-integrated linting, run `npm run lint` regularly. Use `npm run lint:fix` to resolve standard formatting issues automatically.

> [!NOTE] Some lint rules may be overly strict or simply not apply:
> - Locally: you can disable a rule inline if you include a brief comment explaining why.
> - Globally: if you think a rule should be turned off or adjusted, update `xo.config.ts` and explain why in your commit message.

### Typing and Documentation

- Use explicit type annotations where appropriate, especially for public exports.
- All exported functions and constants should have detailed [TSDoc](https://tsdoc.org/) docstrings explaining their mathematical purpose, parameters, return values, and error bounds if known.
- Preserve existing comments, docstrings, and citations.

### Naming Conventions

`twofloat` follows a consistent naming scheme:
- Exported constants should be uppercased and may use underscores to improve readability.
- Math constant names should be consistent with those from the standard JS `Math` library.
- Mathematical function names should preferably remain short and lowercased, as in most of the standard (including JS) math libraries (eg. `acos`, not `archCosine`).
- Main functions vs Type-specific functions: see [Function Signature and Naming Convention](README.md#function-signature-and-naming-convention).

### Commit Guidelines

- **Keep Commits Atomic**: Prefer small, focused commits over large "all-in-one" commits. Each commit should represent a single logical change so that history remains easy to review, bisect, and revert if needed.
- **Commit Messages**: [Conventional Commits](https://conventionalcommits.org) are preferred as they help automate changelog generation, but not mandatory as long as the message is clear and meaningful. In general,
  - for small commits, a single descriptive subject line is sufficient.
  - for larger commits or when changes might not be obvious for the reader, use a concise subject line followed by a blank line and a short body summarizing what changed and why.
- **Line Length**: Wrapping all lines (both the subject and the body) at **72 characters maximum** is strongly encouraged so commit messages render cleanly across GitHub, terminals, etc. without horizontal truncation.

## Submitting a Pull Request

First ensure your PR can be linked to an existing issue, otherwise [file an issue](#filing-an-issue) first.

> [!IMPORTANT]
> If your pull request contains substantive contributions from a generative AI tool, please disclose so with details, and review all changes before opening. This also applies to issues, discussions, and comments.

1. In your local fork, create a topic branch from `main`.
2. Implement your changes, following the [Code Style & Guidelines](#code-style--guidelines).
3. Add tests if relevant (new feature, bug uncaught by existing tests).
4. Ensure all tests pass (at minimum the `nojl` tests) and verify that the project builds.
5. When ready, push your branch to your remote fork and open a Pull Request against `main` with a clear, descriptive title.
6. In your PR description:
   - What changed and why.
   - Any relevant issue numbers (eg. `Fixes #123`).
   - For mathematical changes: provide references, derivation notes, or error bound justifications.

> [!TIP]
> - Sync your branch with `main` regularly to avoid merge conflicts.
> - When pulling changes from upstream, run `npm ci` to ensure your local dependencies match the lockfile.

## Scripts Reference

Usage: `npm run <cmd>` where `<cmd>` is one of the following commands:

| Command | Description |
| :--- | :--- |
| `tscheck` | Type-check sources and test files |
| `lint` | Code quality and styling checks via XO linter |
| `test:clean` | Clean output directories for the accuracy tests |
| `test:unit` | Jest unit tests (core logic, predicates, conversions, edge cases) |
| `test:prejl` | Accuracy tests prerun (TypeScript): generate inputs and collect outputs for each tested function |
| `test:jl` | Accuracy tests (Julia): parse the input/output vectors generated by the `prejl` script and check the accuracy of each function |
| | |
| `test` | Run full test suite (`tscheck`, `lint`, `test:*`) |
| `test:nojl` | Run `tscheck`, `lint`, and `test:unit` |
| `build` | Build ESM/CJS dists and minified UMD bundle |

Check the [package.json](package.json) for more details about the individual scripts.

See also the julia [scripts](scripts/) which contain utilities for generating Padé approximant coefficients and `TwoF64` / `ThreeF64` constants.
