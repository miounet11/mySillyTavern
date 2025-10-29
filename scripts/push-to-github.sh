#!/bin/bash

# 🚀 GitHub 推送脚本
# 使用方法: ./scripts/push-to-github.sh <YOUR_GITHUB_TOKEN>

set -e

echo "🚀 准备推送到 GitHub..."

if [ -z "$1" ]; then
    echo "❌ 错误: 请提供 GitHub Token"
    echo "使用方法: ./scripts/push-to-github.sh <YOUR_GITHUB_TOKEN>"
    echo ""
    echo "如何获取 GitHub Token:"
    echo "1. 访问: https://github.com/settings/tokens"
    echo "2. 点击 'Generate new token (classic)'"
    echo "3. 勾选 'repo' 权限"
    echo "4. 复制生成的 token"
    exit 1
fi

TOKEN=$1
REPO_URL="https://${TOKEN}@github.com/miounet11/mySillyTavern.git"

# 检查是否有待推送的提交
echo "📊 检查待推送的提交..."
git log origin/main..HEAD --oneline || echo "无法比较，将强制推送"

# 推送到 GitHub
echo "🚀 推送到 GitHub..."
git push "$REPO_URL" main

echo "✅ 推送成功！"
echo "🔗 查看仓库: https://github.com/miounet11/mySillyTavern"

