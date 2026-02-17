# AGENT.md — Ntropy CLI for AI Agents

## Overview

The `ntropy` CLI provides access to the Ntropy financial transaction enrichment API. Use it to enrich transactions with merchant data, labels, and categories.

## Prerequisites

```bash
ntropy config set --api-key <key>
```

## All Commands

### Config
```bash
ntropy config set --api-key <key>
ntropy config show
```

### Transactions
```bash
ntropy transactions enrich --id <id> --description <desc> --amount <n> --date <YYYY-MM-DD> --account-holder-id <id>
ntropy transactions enrich-batch --file <path-to-json>
ntropy transactions list
ntropy transactions list --limit 50
ntropy transactions get <id>
```

### Account Holders
```bash
ntropy accounts create --id <id> --type consumer
ntropy accounts create --id <id> --type business --name "Corp" --currency USD
ntropy accounts list
ntropy accounts get <id>
ntropy accounts delete <id>
```

### Reports
```bash
ntropy reports get <account-id>
ntropy reports get <account-id> --period 2024-01
ntropy reports metrics <account-id>
```

### Labels
```bash
ntropy labels list
```

## JSON Output

Always use `--json` when parsing programmatically:
```bash
ntropy transactions enrich ... --json
ntropy accounts list --json
```

## Error Handling

CLI exits with code 1 on error. Common errors:
- `Authentication failed` — Check your API key
- `Resource not found` — Verify the ID
