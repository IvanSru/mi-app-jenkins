# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run tests
npm test

# Check Node version (required by CI)
node --version
```

There is no build step or linter configured. Tests are plain Node.js scripts — no test framework dependency.

## Architecture

This is a minimal Node.js project used to demonstrate a Jenkins CI/CD pipeline.

- **[src/app.js](src/app.js)** — exports two utility functions: `sumar(a, b)` (addition) and `saludar(nombre)` (greeting string).
- **[test/app.test.js](test/app.test.js)** — hand-written test runner using `process.exit(1)` on failure so Jenkins marks the build as failed.
- **[Jenkinsfile](Jenkinsfile)** — declarative pipeline with four stages: clone, install deps, run tests, simulated deploy.

The test runner is intentionally framework-free: it tracks an `errores` counter and exits non-zero if any assertion fails.
