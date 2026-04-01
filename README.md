# GrowthToolkit MCP Server

Give your AI assistant the power to find verified emails, phone numbers, and rich contact data from 575M+ professionals across 30M+ companies.

This is an [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that connects Claude, Cursor, Windsurf, and other AI tools to [GrowthToolkit's](https://growthtoolkit.io) enrichment and prospecting API.

## What is GrowthToolkit?

[GrowthToolkit](https://growthtoolkit.io) is a B2B prospecting platform that finds real-time, triple-verified emails and phone numbers from any company. It uses deep search technology, real-time SMTP verification, and catch-all verification to find contacts that other tools miss, with a bounce rate under 2.5%.

It's the all-in-one alternative to Apollo, Lusha, Hunter, and RocketReach, with pay-as-you-go pricing and 1,200 free credits to start. No credit card required.

**[Sign up free](https://enrich.growthtoolkit.io/dashboard/?authType=get-started)** | **[Visit growthtoolkit.io](https://growthtoolkit.io)**

## Why Use This MCP Server?

Instead of switching between your AI assistant and the GrowthToolkit dashboard, just ask naturally:

- *"Find the email for John Smith at Google"*
- *"Enrich this LinkedIn profile: https://linkedin.com/in/satyanadella"*
- *"Verify if hello@example.com is a valid email"*
- *"Show me my prospect lists and export the top one"*

Your AI assistant handles the API calls, parses the results, and gives you clean answers. It can also chain multiple tools together, like finding an email and then verifying it in one conversation.

## Available Tools (17 total)

### Enrichment
| Tool | What it does |
|------|-------------|
| `enrich_linkedin` | Turn any LinkedIn URL into a full profile with emails, phones, job history, skills, and more |
| `enrich_email` | Get the full profile behind an email address (name, company, title, socials) |
| `enrich_phone` | Find the person behind a phone number with full profile data |
| `enrich_domain` | Get company details from a domain name |

### Email Discovery & Verification
| Tool | What it does |
|------|-------------|
| `find_email` | Find someone's email from their first name, last name, and company domain |
| `verify_email` | Check if an email is valid, deliverable, and safe to send to |

### Task Status
| Tool | What it does |
|------|-------------|
| `check_task` | Poll the status of async enrichment tasks (email enrichment returns results via task) |

### List Management
| Tool | What it does |
|------|-------------|
| `list_prospects` | Browse your prospect/contact lists |
| `list_email_finder` | Browse your email finder lists |
| `list_email_verifier` | Browse your email verifier lists |
| `list_linkedin_scraper` | Browse your LinkedIn scraper lists |
| `list_sales_navigator_scraper` | Browse your Sales Navigator scraper lists |

### Data Export
| Tool | What it does |
|------|-------------|
| `export_prospects` | Export enriched contacts from a prospect list |
| `export_email_finder` | Export found emails from a list |
| `export_email_verifier` | Export verified emails (filter by valid/invalid/all) |
| `export_linkedin_scraper` | Export LinkedIn scraper results |
| `export_sales_navigator_scraper` | Export Sales Navigator scraper results |

## Getting Started

### 1. Get your free API key

If you don't have an account yet, **[sign up for free](https://enrich.growthtoolkit.io/dashboard/?authType=get-started)** (no credit card, takes 30 seconds). You get 1,200 free credits to start.

Then grab your API key from **[growthtoolkit.io/api-keys](https://enrich.growthtoolkit.io/api-keys/)**. It starts with `lf_...`.

### 2. Add to your AI tool

Pick your tool and add the config below. That's it.

#### Claude Desktop

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

#### Claude Code (CLI)

Add to `.claude/settings.json` or project-level settings:

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

#### Cursor / Windsurf / VS Code

Add to `.cursor/mcp.json`, `.windsurf/mcp.json`, or your editor's MCP config:

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

> Replace `lf_your_api_key_here` with your actual API key from [growthtoolkit.io/api-keys](https://enrich.growthtoolkit.io/api-keys/).

### 3. Alternative: Install from source

If you prefer not to use `npx`:

```bash
git clone https://github.com/iamanantgupta/growthtoolkit-mcp.git
cd growthtoolkit-mcp
npm install && npm run build
```

Then use this config instead:

```json
{
  "command": "node",
  "args": ["/absolute/path/to/growthtoolkit-mcp/dist/index.js"],
  "env": { "GROWTHTOOLKIT_API_KEY": "lf_your_api_key_here" }
}
```

## Tool Reference

### Enrichment Tools

**`enrich_linkedin`** is the most powerful tool. Pass any LinkedIn URL and get back:
- Verified email addresses and phone numbers (set `emails: 1`, `phones: 1` to unlock)
- Full name, headline, job title, and current company
- Complete work history, education, and skills
- Location, interests, and social profiles
- Optional: `list_id` to save results, `webhook_url` for async callbacks

**`enrich_email`** works asynchronously. It returns a `task_id` right away. Use `check_task` with that ID to get the full enriched profile once it's ready (usually takes a few seconds).

**`enrich_phone`** requires a `list_id` parameter. Returns the same rich profile data.

**`enrich_domain`** returns company-level information from a domain name.

### Email Tools

**`find_email`** takes `first_name`, `last_name`, and `domain` and returns the most likely email address. GrowthToolkit's deep search finds 30% more emails than traditional tools.

**`verify_email`** checks real-time SMTP validity. Returns `is_valid`, `mx_domain`, and account type (work vs free).

### List & Export Tools

All list tools support `page`, `page_size`, `q` (search), and `detailed` (0 or 1).

All export tools support `page` for pagination. Email verifier export also takes `type_` (`valid`, `invalid`, or `all`). LinkedIn scraper export takes `type` (`search` or `profile`).

## Rate Limits

| Category | Limit | Applies to |
|----------|-------|------------|
| Action | 2 req/sec | Enrichment, email finder, email verifier |
| List | 1 req/sec | Listing and browsing lists |
| Export | 10 req/10 sec | Exporting data from lists |
| Status | 1 req/2 sec | Checking task status |

When rate limited, the API returns HTTP 429 with a `sec` field telling you how long to wait.

## Links

- **GrowthToolkit Homepage**: [growthtoolkit.io](https://growthtoolkit.io)
- **Sign Up (free)**: [Get started](https://enrich.growthtoolkit.io/dashboard/?authType=get-started)
- **API Keys**: [growthtoolkit.io/api-keys](https://enrich.growthtoolkit.io/api-keys/)
- **API Docs**: [growthtoolkit.io/docs](https://enrich.growthtoolkit.io/docs/)

## Built by

Created by [Anant Gupta](https://www.linkedin.com/in/iamanantgupta/), Founder of [GrowthToolkit](https://growthtoolkit.io).

## License

MIT
