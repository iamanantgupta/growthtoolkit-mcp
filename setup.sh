#!/bin/bash
# GrowthToolkit MCP Server - One-line setup
# Usage: curl -fsSL https://raw.githubusercontent.com/iamanantgupta/growthtoolkit-mcp/main/setup.sh | bash

set -e

INSTALL_DIR="$HOME/.growthtoolkit-mcp"

echo ""
echo "==> Installing GrowthToolkit MCP Server..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is required but not installed."
    echo "Install it from https://nodejs.org/ and try again."
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
echo "Add this to your AI tool's MCP config."
echo "Replace lf_your_api_key_here with your key"
echo "from https://enrich.growthtoolkit.io/api-keys/"
echo ""
echo "Don't have an account? Sign up free (no credit card):"
echo "https://enrich.growthtoolkit.io/dashboard/?authType=get-started"
echo ""
echo "--- Copy below this line ---"
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
echo "--- Copy above this line ---"
echo ""
echo "Config file locations:"
echo "  Claude Desktop (macOS): ~/Library/Application Support/Claude/claude_desktop_config.json"
echo "  Claude Desktop (Windows): %APPDATA%\\Claude\\claude_desktop_config.json"
echo "  Claude Code: .claude/settings.json"
echo "  Cursor: .cursor/mcp.json"
echo "  Windsurf: .windsurf/mcp.json"
echo ""
