#!/bin/bash

# i18n Translation Loading Fix - Deployment Script
# 部署 i18n 翻译加载修复

set -e  # Exit on error

echo "============================================"
echo "i18n 翻译加载修复 - 部署脚本"
echo "============================================"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${YELLOW}步骤 1/4: 检查文件...${NC}"
if [ ! -f "apps/web/src/lib/i18n.ts" ]; then
    echo -e "${RED}错误: 找不到 apps/web/src/lib/i18n.ts${NC}"
    exit 1
fi

if [ ! -f "apps/web/src/components/providers/I18nProvider.tsx" ]; then
    echo -e "${RED}错误: 找不到 apps/web/src/components/providers/I18nProvider.tsx${NC}"
    exit 1
fi

if [ ! -f "apps/web/public/locales/zh-CN/common.json" ]; then
    echo -e "${RED}错误: 找不到翻译文件 zh-CN/common.json${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 所有必需文件已就位${NC}"
echo ""

echo -e "${YELLOW}步骤 2/4: 构建应用...${NC}"
echo "这可能需要几分钟时间..."
if npm run build > build-i18n-fix.log 2>&1; then
    echo -e "${GREEN}✓ 构建成功${NC}"
else
    echo -e "${RED}✗ 构建失败，请查看 build-i18n-fix.log${NC}"
    tail -50 build-i18n-fix.log
    exit 1
fi
echo ""

echo -e "${YELLOW}步骤 3/4: 检查 PM2 进程...${NC}"
if command -v pm2 &> /dev/null; then
    PM2_PROCESS=$(pm2 list | grep -E "sillytavern|web" | head -1 || true)
    if [ -n "$PM2_PROCESS" ]; then
        echo "找到 PM2 进程"
        echo "$PM2_PROCESS"
    else
        echo "未找到运行中的 PM2 进程"
    fi
else
    echo "PM2 未安装"
fi
echo ""

echo -e "${YELLOW}步骤 4/4: 重启应用...${NC}"
if command -v pm2 &> /dev/null; then
    if [ -f "ecosystem.config.js" ]; then
        echo "使用 ecosystem.config.js 重启..."
        pm2 restart ecosystem.config.js
        echo -e "${GREEN}✓ PM2 应用已重启${NC}"
    else
        echo "尝试重启 sillytavern 相关进程..."
        pm2 restart all || echo "PM2 重启命令执行（可能没有进程在运行）"
    fi
else
    echo -e "${YELLOW}⚠ PM2 未安装，请手动重启应用${NC}"
    echo "如果使用 Node.js 直接运行："
    echo "  npm start"
    echo ""
    echo "或者："
    echo "  node server.js"
fi
echo ""

echo "============================================"
echo -e "${GREEN}部署完成！${NC}"
echo "============================================"
echo ""
echo "接下来的步骤："
echo "1. 清除浏览器缓存或使用无痕模式"
echo "2. 访问应用 URL"
echo "3. 验证不再显示翻译键（如 chat.settingsPanel.title）"
echo ""
echo "测试检查清单："
echo "  □ 启动时看到简洁的加载指示器"
echo "  □ 加载完成后直接显示中文文本"
echo "  □ 没有翻译键闪烁"
echo "  □ 设置面板所有文本正确显示"
echo ""
echo "详细测试指南: I18N_LOADING_TEST_GUIDE.md"
echo "问题排查: I18N_LOADING_FIX.md"
echo ""
echo "如有问题，请查看日志："
echo "  - 构建日志: build-i18n-fix.log"
echo "  - PM2 日志: pm2 logs"
echo ""

