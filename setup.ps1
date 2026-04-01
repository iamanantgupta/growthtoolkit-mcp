# GrowthToolkit MCP Server - Windows Setup
# Usage: irm https://raw.githubusercontent.com/iamanantgupta/growthtoolkit-mcp/main/setup.ps1 | iex

$ErrorActionPreference = "Stop"
$INSTALL_DIR = "$env:USERPROFILE\.growthtoolkit-mcp"

Write-Host ""
Write-Host "==> Installing GrowthToolkit MCP Server..." -ForegroundColor Cyan
Write-Host ""

# Check git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: git is required but not installed." -ForegroundColor Red
    Write-Host "Install it from https://git-scm.com/ and try again."
    exit 1
}

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js is required but not installed." -ForegroundColor Red
    Write-Host "Install it from https://nodejs.org/ and try again."
    exit 1
}

# Check npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: npm is required but not installed." -ForegroundColor Red
    Write-Host "It usually comes with Node.js. Install Node.js from https://nodejs.org/"
    exit 1
}

# Clone or update
if (Test-Path $INSTALL_DIR) {
    Write-Host "==> Updating existing installation..."
    Set-Location $INSTALL_DIR
    git pull --quiet origin main
} else {
    Write-Host "==> Cloning repository..."
    git clone --quiet https://github.com/iamanantgupta/growthtoolkit-mcp.git $INSTALL_DIR
    Set-Location $INSTALL_DIR
}

# Install and build
Write-Host "==> Installing dependencies..."
npm install --silent 2>$null
Write-Host "==> Building..."
npm run build --silent 2>$null

$distPath = "$INSTALL_DIR\dist\index.js" -replace '\\', '/'

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  GrowthToolkit MCP Server installed!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "STEP 1: Copy the JSON config below."
Write-Host "STEP 2: Replace lf_your_api_key_here with your API key."
Write-Host "STEP 3: Paste it into your AI tool's config file (see locations below)."
Write-Host "STEP 4: Restart your AI tool."
Write-Host ""
Write-Host "Get your API key: https://enrich.growthtoolkit.io/api-keys/"
Write-Host "Don't have an account? Sign up free (no credit card required):"
Write-Host "https://enrich.growthtoolkit.io/dashboard/?authType=get-started"
Write-Host ""
Write-Host "========== COPY THIS CONFIG ==========" -ForegroundColor Yellow
Write-Host ""
Write-Host @"
{
  "mcpServers": {
    "growthtoolkit": {
      "command": "node",
      "args": ["$distPath"],
      "env": {
        "GROWTHTOOLKIT_API_KEY": "lf_your_api_key_here"
      }
    }
  }
}
"@
Write-Host ""
Write-Host "========== END OF CONFIG ==========" -ForegroundColor Yellow
Write-Host ""
Write-Host "NOTE: If your config file already has other MCP servers,"
Write-Host 'just add the "growthtoolkit" section inside the existing'
Write-Host '"mcpServers" object. Do not replace the entire file.'
Write-Host ""
Write-Host "Config file locations:"
Write-Host "  Claude Desktop: $env:APPDATA\Claude\claude_desktop_config.json"
Write-Host "  Claude Code: $env:USERPROFILE\.claude\settings.json"
Write-Host "  Cursor: .cursor\mcp.json"
Write-Host "  Windsurf: .windsurf\mcp.json"
Write-Host ""
Write-Host "After pasting the config, RESTART your AI tool to activate." -ForegroundColor Cyan
Write-Host ""
