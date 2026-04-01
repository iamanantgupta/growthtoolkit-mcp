# GrowthToolkit MCP Server

An MCP (Model Context Protocol) server that connects AI assistants like Claude to the [GrowthToolkit](https://enrich.growthtoolkit.io) enrichment API. Find emails, phone numbers, and enrich contacts from LinkedIn profiles, email addresses, phone numbers, or company domains.

## What Can It Do?

| Tool | Description |
|------|-------------|
| `enrich_linkedin` | Get full profile from a LinkedIn URL (emails, phones, job, company, skills) |
| `enrich_email` | Enrich a contact by email address (async - returns task_id) |
| `enrich_phone` | Enrich a contact by phone number |
| `enrich_domain` | Enrich a company by its domain |
| `find_email` | Find someone's email from first name + last name + company domain |
| `verify_email` | Check if an email is valid and deliverable |
| `check_task` | Poll async task status (for email enrichment results) |
| `list_prospects` | Browse your prospect/contact lists |
| `list_email_finder` | Browse your email finder lists |
| `list_email_verifier` | Browse your email verifier lists |
| `list_linkedin_scraper` | Browse your LinkedIn scraper lists |
| `list_sales_navigator_scraper` | Browse your Sales Navigator scraper lists |
| `export_prospects` | Export enriched contacts from a prospect list |
| `export_email_finder` | Export results from an email finder list |
| `export_email_verifier` | Export results from an email verifier list (filter by valid/invalid) |
| `export_linkedin_scraper` | Export results from a LinkedIn scraper list |
| `export_sales_navigator_scraper` | Export results from a Sales Navigator scraper list |

## Prerequisites

- **Node.js** 18 or later
- A **GrowthToolkit API key**

## Getting Your API Key

1. If you don't have an account, **sign up free** at:
   **https://enrich.growthtoolkit.io/dashboard/?authType=get-started**

2. Once logged in, get your API key from:
   **https://enrich.growthtoolkit.io/api-keys/**

3. Copy the API key (it starts with `lf_...`)

## Quick Start (npx - no install needed)

The fastest way. No cloning, no building. Just add to your config and go:

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "growthtoolkit": {
      "command": "npx",
      "args": ["-y", "growthtoolkit-mcp"],
      "env": {
        "GROWTHTOOLKIT_API_KEY": "lf_your_api_key_here"
      }
    }
  }
}
```

### Claude Code (CLI)

Add to `.claude/settings.json` or project settings:

```json
{
  "mcpServers": {
    "growthtoolkit": {
      "command": "npx",
      "args": ["-y", "growthtoolkit-mcp"],
      "env": {
        "GROWTHTOOLKIT_API_KEY": "lf_your_api_key_here"
      }
    }
  }
}
```

### Cursor / Windsurf / VS Code

Add to `.cursor/mcp.json`, `.windsurf/mcp.json`, or equivalent:

```json
{
  "mcpServers": {
    "growthtoolkit": {
      "command": "npx",
      "args": ["-y", "growthtoolkit-mcp"],
      "env": {
        "GROWTHTOOLKIT_API_KEY": "lf_your_api_key_here"
      }
    }
  }
}
```

> Replace `lf_your_api_key_here` with your actual API key.

## Alternative Installation

If you prefer not to use `npx`:

```bash
# Install globally
npm install -g growthtoolkit-mcp

# Then use "growthtoolkit-mcp" as the command instead of "npx"
```

Or clone and build from source:

```bash
git clone https://github.com/nicegrowth/growthtoolkit-mcp.git
cd growthtoolkit-mcp
npm install && npm run build
# Then use: "command": "node", "args": ["/path/to/growthtoolkit-mcp/dist/index.js"]
```

## Usage Examples

Once connected, just ask your AI assistant naturally:

- *"Find the email for John Smith at Google"*
- *"Enrich this LinkedIn profile: https://linkedin.com/in/satyanadella"*
- *"Verify if hello@example.com is a valid email"*
- *"Show me my prospect lists"*
- *"Export contacts from prospect list 42"*

### Tool Details

#### Enrichment Tools

**`enrich_linkedin`** - The most powerful tool. Pass a LinkedIn URL and get back:
- Email addresses and phone numbers (set `emails: 1`, `phones: 1`)
- Full name, job title, company
- Work history, education, skills, interests
- Location, social profiles
- Optional: `list_id` to save results, `webhook_url` for async callback

**`enrich_email`** - Async enrichment by email. Returns a `task_id` immediately. Use `check_task` to poll for results (usually completes in seconds). Returns same rich profile data as LinkedIn enrichment.

**`enrich_phone`** - Enrich by phone number. Requires `list_id`.

**`enrich_domain`** - Enrich a company by domain name.

#### Email Discovery & Verification

**`find_email`** - Find someone's email from their name + company domain. Params: `first_name`, `last_name`, `domain`.

**`verify_email`** - Check if an email exists, is deliverable, and what type it is (work/free). Returns `is_valid`, `mx_domain`.

#### List Management

All list tools support pagination (`page`, `page_size`), search (`q`), and detail level (`detailed: 1`).

#### Export Tools

Export enriched data from any list type. All support pagination. Email verifier export supports filtering by `type_: "valid" | "invalid" | "all"`. LinkedIn scraper export supports `type: "search" | "profile"`.

## Rate Limits

| Category | Limit | What it covers |
|----------|-------|----------------|
| Action | 2 requests/second | Enrichment, find, verify (credit-using operations) |
| List | 1 request/second | Fetching list details |
| Export | 10 requests/10 seconds | Downloading list data |
| Status | 1 request/2 seconds | Checking task status |

If rate limited, the API returns a `429` with a `sec` field indicating how long to wait.

## API Reference

- **Base URL**: `https://api.appconnector.pro`
- **Auth**: API key passed as query parameter (`?api_key=...`)
- **Full docs**: https://enrich.growthtoolkit.io/docs/

## License

MIT
