![Banner](https://raw.githubusercontent.com/ktmcp-cli/ntropy/main/banner.svg)

> "Six months ago, everyone was talking about MCPs. And I was like, screw MCPs. Every MCP would be better as a CLI."
>
> — [Peter Steinberger](https://twitter.com/steipete), Founder of OpenClaw
> [Watch on YouTube (~2:39:00)](https://www.youtube.com/@lexfridman) | [Lex Fridman Podcast #491](https://lexfridman.com/peter-steinberger/)

# Ntropy CLI

> **Warning: Unofficial CLI** - Not officially sponsored or affiliated with Ntropy.

Command-line interface for the Ntropy financial transaction enrichment API. Enrich transactions with merchant data, labels, and categories directly from your terminal.

## Installation

```bash
npm install -g @ktmcp-cli/ntropy
```

## Setup

```bash
ntropy config set --api-key <your-api-key>
```

Get your API key at [https://ntropy.network](https://ntropy.network).

## Commands

### Config

```bash
ntropy config set --api-key <key>
ntropy config show
```

### Transactions

```bash
# Enrich a single transaction
ntropy transactions enrich \
  --id tx123 \
  --description "STARBUCKS #1234" \
  --amount -5.50 \
  --date 2024-01-15 \
  --account-holder-id user_001 \
  --entry-type debit \
  --currency USD

# Enrich from JSON file
ntropy transactions enrich-batch --file transactions.json

# List transactions
ntropy transactions list
ntropy transactions list --limit 50

# Get single transaction
ntropy transactions get <transaction-id>
```

### Account Holders

```bash
ntropy accounts create --id user_001 --type consumer --name "John Doe" --currency USD
ntropy accounts list
ntropy accounts get <account-id>
ntropy accounts delete <account-id>
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

All commands support `--json` for structured output:

```bash
ntropy transactions enrich --id tx1 --description "Amazon" --amount -50 --date 2024-01-01 --account-holder-id u1 --json
ntropy accounts list --json
```

## Batch File Format

```json
[
  {
    "id": "tx001",
    "description": "STARBUCKS",
    "amount": -5.50,
    "date": "2024-01-15",
    "account_holder_id": "user_001",
    "entry_type": "debit",
    "currency": "USD"
  }
]
```

## License

MIT
