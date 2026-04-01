#!/bin/bash
# GrowthToolkit MCP Server - One-line setup
# Usage: curl -fsSL https://raw.githubusercontent.com/iamanantgupta/growthtoolkit-mcp/main/setup.sh | bash

set -e

INSTALL_DIR="$HOME/.growthtoolkit-mcp"

echo ""
echo "==> Installing GrowthToolkit MCP Server..."
echo ""

# Check git
if ! command -v git &> /dev/null; then
    echo "ERROR: git is required but not installed."
    echo "Install it from https://git-scm.com/ and try again."
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is required but not installed."
    echo "Install it from https://nodejs.org/ and try again."
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is required but not installed."
    echo "It usually comes with Node.js. Install Node.js from https://nodejs.org/"
    exit 1
fi

# Clone or update
if [ -d "$INSTALL_DIR" ]; then
    echo "==> Updating existing installation..."
    cd "$INSTALL_DIR"
    git pull --quiet origin main
else
    echo "==> Cloning repository..."
    git clone --quiet https://github.com/iamanantgupta/growthtoolkit-mcp.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

# Install and build
echo "==> Installing dependencies..."
npm install --silent 2>/dev/null
echo "==> Building..."
npm run build --silent 2>/dev/null

echo ""
echo "============================================"
echo "  GrowthToolkit MCP Server installed!"
echo "============================================"
echo ""
echo "STEP 1: Copy the JSON config below."
echo "STEP 2: Replace lf_your_api_key_here with your API key."
echo "STEP 3: Paste it into your AI tool's config file (see locations below)."
echo "STEP 4: Restart your AI tool."
echo ""
echo "Get your API key: https://enrich.growthtoolkit.io/api-keys/"
echo "Don't have an account? Sign up free (no credit card required):"
echo "https://enrich.growthtoolkit.io/dashboard/?authType=get-started"
echo ""
echo "========== COPY THIS CONFIG =========="
echo ""
cat <<EOF
{
  "mcpServers": {
    "growthtoolkit": {
      "command": "node",
      "args": ["$INSTALL_DIR/dist/index.js"],
      "env": {
        "GROWTHTOOLKIT_API_KEY": "lf_your_api_key_here"
      }
    }
  }
}
EOF
echo ""
echo "========== END OF CONFIG =========="
echo ""
echo "NOTE: If your config file already has other MCP servers,"
echo "just add the \"growthtoolkit\" section inside the existing"
echo "\"mcpServers\" object. Do not replace the entire file."
echo ""
echo "Config file locations:"
echo "  Claude Desktop (macOS): ~/Library/Application Support/Claude/claude_desktop_config.json"
echo "  Claude Code: ~/.claude/settings.json"
echo "  Cursor: .cursor/mcp.json"
echo "  Windsurf: .windsurf/mcp.json"
echo ""
echo "After pasting the config, RESTART your AI tool to activate."
echo ""
