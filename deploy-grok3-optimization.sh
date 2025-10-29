#!/bin/bash

# grok-3 优化快速部署脚本
# 使用方法: bash deploy-grok3-optimization.sh

set -e  # 遇到错误立即退出

echo "========================================="
echo "  grok-3 聊天系统优化部署脚本"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 项目路径
PROJECT_DIR="/www/wwwroot/jiuguanmama/mySillyTavern"
cd "$PROJECT_DIR"

echo -e "${YELLOW}当前目录:${NC} $PWD"
echo ""

# 步骤 1: 检查环境
echo -e "${YELLOW}[1/5] 检查环境...${NC}"

if [ ! -f "package.json" ]; then
    echo -e "${RED}错误: 未找到 package.json，请确认在正确的目录${NC}"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}错误: 未找到 pnpm，请先安装 pnpm${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 环境检查通过${NC}"
echo ""

# 步骤 2: 创建 .env 文件
echo -e "${YELLOW}[2/5] 创建环境变量配置...${NC}"

if [ -f ".env" ]; then
    echo -e "${YELLOW}警告: .env 文件已存在${NC}"
    read -p "是否备份现有 .env 并创建新的？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        BACKUP_FILE=".env.backup.$(date +%Y%m%d_%H%M%S)"
        cp .env "$BACKUP_FILE"
        echo -e "${GREEN}✓ 已备份到 $BACKUP_FILE${NC}"
    else
        echo -e "${YELLOW}跳过创建 .env，使用现有配置${NC}"
        echo ""
        echo -e "${YELLOW}请确保以下配置存在于 .env 文件中：${NC}"
        cat << 'EOF'
CONTEXT_MAX_TOKENS=100000
CONTEXT_RESERVE_TOKENS=8000
CONTEXT_ENABLE_SMART_TRIM=true
CONTEXT_ENABLE_AUTO_SUMMARY=true
CONTEXT_SUMMARY_INTERVAL=30
MESSAGE_SLIDING_WINDOW=100
WORLDINFO_MAX_ACTIVATED_ENTRIES=15
WORLDINFO_MAX_TOTAL_TOKENS=20000
WORLDINFO_MAX_RECURSIVE_DEPTH=2
WORLDINFO_DEFAULT_VECTOR_THRESHOLD=0.7
WORLDINFO_AUTO_EMBEDDING=false
WORLDINFO_CACHE_ENABLED=true
WORLDINFO_CACHE_TTL=300
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-3-small
ST_PARITY_GREETING_ENABLED=true
EOF
        echo ""
        read -p "按回车继续..."
        echo ""
    fi
fi

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}创建 .env 文件...${NC}"
    cat > .env << 'EOF'
# ===== 上下文管理（grok-3 优化）=====
CONTEXT_MAX_TOKENS=100000
CONTEXT_RESERVE_TOKENS=8000
CONTEXT_ENABLE_SMART_TRIM=true
CONTEXT_ENABLE_AUTO_SUMMARY=true
CONTEXT_SUMMARY_INTERVAL=30
MESSAGE_SLIDING_WINDOW=100

# ===== World Info 限流 =====
WORLDINFO_MAX_ACTIVATED_ENTRIES=15
WORLDINFO_MAX_TOTAL_TOKENS=20000
WORLDINFO_MAX_RECURSIVE_DEPTH=2
WORLDINFO_DEFAULT_VECTOR_THRESHOLD=0.7
WORLDINFO_AUTO_EMBEDDING=false

# ===== 性能优化 =====
WORLDINFO_CACHE_ENABLED=true
WORLDINFO_CACHE_TTL=300

# ===== Embedding 提供商（可选）=====
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-3-small

# ===== 其他配置 =====
ST_PARITY_GREETING_ENABLED=true
EOF
    echo -e "${GREEN}✓ .env 文件已创建${NC}"
    echo -e "${YELLOW}注意: 请根据实际情况修改数据库连接等配置${NC}"
fi

echo ""

# 步骤 3: 安装依赖
echo -e "${YELLOW}[3/5] 检查依赖...${NC}"
echo "运行: pnpm install"
pnpm install
echo -e "${GREEN}✓ 依赖安装完成${NC}"
echo ""

# 步骤 4: 构建项目
echo -e "${YELLOW}[4/5] 构建项目...${NC}"
echo "运行: pnpm build"
pnpm build
echo -e "${GREEN}✓ 项目构建完成${NC}"
echo ""

# 步骤 5: 重启服务
echo -e "${YELLOW}[5/5] 重启服务...${NC}"

if command -v pm2 &> /dev/null; then
    echo "运行: pm2 restart sillytavern"
    pm2 restart sillytavern || pm2 start ecosystem.config.js
    echo -e "${GREEN}✓ 服务已重启${NC}"
    echo ""
    echo -e "${YELLOW}查看日志:${NC} pm2 logs sillytavern"
else
    echo -e "${YELLOW}未检测到 PM2，请手动重启服务${NC}"
fi

echo ""
echo "========================================="
echo -e "${GREEN}  部署完成！${NC}"
echo "========================================="
echo ""
echo "验证步骤："
echo "1. 查看日志: pm2 logs sillytavern --lines 50"
echo "2. 发送测试消息，观察响应时间"
echo "3. 检查日志中的 token 使用情况"
echo ""
echo "关键日志关键词："
echo "  - [Context Cache] Enabled"
echo "  - [Generate API] Loading 100 messages"
echo "  - [World Info Activation] Activated"
echo "  - [Context Builder] Token budgets"
echo ""
echo "详细文档："
echo "  - 部署指南: GROK3_OPTIMIZATION_DEPLOYMENT.md"
echo "  - 配置说明: GROK3_OPTIMIZATION_CONFIG.md"
echo "  - 优化总结: GROK3_OPTIMIZATION_SUMMARY.md"
echo ""
echo "预期效果："
echo "  ✓ 响应成功率: >95%"
echo "  ✓ 响应时间: 10-30 秒"
echo "  ✓ Token 控制: <100k"
echo ""

