> "Six months ago, everyone was talking about MCPs. And I was like, screw MCPs. Every MCP would be better as a CLI."
>
> — [Peter Steinberger](https://twitter.com/steipete), Founder of OpenClaw  
> [Watch on YouTube (~2:39:00)](https://www.youtube.com/@lexfridman) | [Lex Fridman Podcast #491](https://lexfridman.com/peter-steinberger/)

# Ntropy Transaction API CLI

A production-ready command-line interface for the [ntropy.network](https://ntropy.network) Ntropy Transaction API. Transaction classification, merchant enrichment directly from your terminal.

> **Disclaimer**: This is an unofficial CLI tool and is not affiliated with, endorsed by, or supported by ntropy.network.

## Features

- **Consumer Classification** — Classify personal transactions
- **Business Classification** — Classify business transactions
- **Batch Processing** — Process multiple transactions at once
- **Merchant Enrichment** — Get logos, websites, and labels
- **API Key Auth** — Simple authentication with your Ntropy API key
- **JSON output** — All commands support `--json` for scripting and piping
- **Colorized output** — Clean, readable terminal output with chalk

## Why CLI > MCP

MCP servers are complex, stateful, and require a running server process. A CLI is:

- **Simpler** — Just a binary you call directly
- **Composable** — Pipe output to other tools
- **Scriptable** — Use in shell scripts, CI/CD pipelines, cron jobs
- **Debuggable** — See exactly what's happening with `--json` flag
- **AI-friendly** — AI agents can call CLIs just as easily as MCPs, with less overhead

## Installation

```bash
npm install -g @ktmcp-cli/ntropy
```

## Authentication Setup

### Configure the CLI

```bash
ntropy config set --api-key YOUR_API_KEY
# or for token-based:
ntropy config set --access-token YOUR_ACCESS_TOKEN
```

### Verify

```bash
ntropy config show
```

## Commands

See help for all available commands:

```bash
ntropy --help
ntropy <command> --help
```

## JSON Output

All commands support `--json` for machine-readable output:

```bash
ntropy <command> --json
```

## Contributing

Issues and pull requests are welcome at [github.com/ktmcp-cli/ntropy](https://github.com/ktmcp-cli/ntropy).

## License

MIT — see [LICENSE](LICENSE) for details.

---

Part of the [KTMCP CLI](https://killthemcp.com) project — replacing MCPs with simple, composable CLIs.
