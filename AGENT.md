# AGENT.md — Ntropy Transaction API CLI for AI Agents

This document explains how to use the ntropy CLI as an AI agent.

## Overview

The `ntropy` CLI provides access to the Ntropy Transaction API. Use it for transaction classification, merchant enrichment.

## Prerequisites

The CLI must be configured before use. Check status with:

```bash
ntropy config show
```

If not configured, run:
```bash
ntropy config set --api-key <key>
# or
ntropy config set --access-token <token>
```

## All Commands

### Config

```bash
ntropy config set --api-key <key>
ntropy config set --access-token <token>
ntropy config show
```

### Commands

Run `ntropy --help` to see all available commands.

## JSON Output

All commands support `--json` for structured output. Always use `--json` when parsing results programmatically:

```bash
ntropy <command> --json
```

## Error Handling

The CLI exits with code 1 on error and prints an error message to stderr. Common errors:

- `Not configured` — Run `ntropy config set`
- `Authentication failed` — Check your credentials
- `Resource not found` — Check the ID/parameters are correct

## Tips for Agents

1. Always use `--json` when you need to extract specific fields
2. Check the help output (`--help`) to discover all available commands
3. Handle errors gracefully and provide meaningful feedback to users
