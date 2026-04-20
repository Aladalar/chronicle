#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# Chronicle — Git setup for dev frontend + lab backend
# Run this ONCE on your server to initialize the repo
# ═══════════════════════════════════════════════════════════════
 
set -e
 
REPO_DIR="/var/www/chronicle"
 
# ── 1. Create .gitignore ──
cat > "$REPO_DIR/.gitignore" << 'EOF'
# Dependencies
node_modules/
 
# Build output
dev/dist/
app/dist/
 
# Environment (contains secrets)
lab/.env
api/.env
 
# PM2
*.pid
 
# OS
.DS_Store
Thumbs.db
 
# Editor
.vscode/
.idea/
*.swp
*.swo
 
# Logs
*.log
npm-debug.log*
EOF
 
# ── 2. Init repo ──
cd "$REPO_DIR"
 
if [ -d .git ]; then
  echo "Git already initialized in $REPO_DIR"
else
  git init
  echo "Git initialized"
fi
 
# ── 3. Configure git (if not set globally) ──
git config user.email >/dev/null 2>&1 || git config user.email "chronicle@chronicle.cz"
git config user.name >/dev/null 2>&1 || git config user.name "Chronicle Admin"
 
# ── 4. Add everything ──
git add .
git commit -m "Initial commit — admin frontend + backend"
 
echo ""
echo "═══════════════════════════════════════════════════════"
echo "Local repo ready at $REPO_DIR"
echo ""
echo "Next steps:"
echo ""
echo "1. Create a repo on GitHub:"
echo "   https://github.com/new"
echo "   Name: chronicle"
echo "   Private: yes"
echo "   Do NOT init with README"
echo ""
echo "2. Push to GitHub:"
echo "   cd $REPO_DIR"
echo "   git remote add origin git@github.com:YOURUSER/chronicle.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. If you don't have SSH key set up:"
echo "   ssh-keygen -t ed25519 -C 'chronicle@chronicle.cz'"
echo "   cat ~/.ssh/id_ed25519.pub"
echo "   Add that key to GitHub → Settings → SSH keys"
echo ""
echo "Or use HTTPS instead:"
echo "   git remote add origin https://github.com/YOURUSER/chronicle.git"
echo "   git push -u origin main"
echo "   (will prompt for GitHub username + personal access token)"
echo "═══════════════════════════════════════════════════════"