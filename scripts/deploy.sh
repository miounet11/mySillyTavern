#!/bin/bash

# SillyTavern 快速部署脚本
# Usage: ./scripts/deploy.sh

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project directory
PROJECT_DIR="/www/wwwroot/jiuguanmama/mySillyTavern"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  SillyTavern 生产环境部署脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print section header
print_section() {
    echo ""
    echo -e "${YELLOW}>>> $1${NC}"
    echo "----------------------------------------"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "请不要以 root 用户运行此脚本"
    exit 1
fi

# Navigate to project directory
cd "$PROJECT_DIR" || exit 1

# Step 1: Backup current database
print_section "1. 备份当前数据库"
if [ -f "./scripts/backup-db.sh" ]; then
    ./scripts/backup-db.sh
    print_success "数据库备份完成"
else
    print_error "备份脚本不存在，跳过备份"
fi

# Step 2: Pull latest code
print_section "2. 拉取最新代码"
if [ -d ".git" ]; then
    git pull origin main || git pull origin master
    print_success "代码更新完成"
else
    print_error "不是 Git 仓库，跳过拉取"
fi

# Step 3: Install dependencies
print_section "3. 安装依赖"
pnpm install --frozen-lockfile
print_success "依赖安装完成"

# Step 4: Generate Prisma Client
print_section "4. 生成 Prisma Client"
cd packages/database
npx prisma generate
print_success "Prisma Client 生成完成"

# Step 5: Run database migrations
print_section "5. 运行数据库迁移"
npx prisma migrate deploy
print_success "数据库迁移完成"

# Optional: Seed database if empty
DB_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"Character\";" | grep -o '[0-9]\+' | head -1)
if [ "$DB_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}检测到空数据库，是否导入示例数据？(y/n)${NC}"
    read -p "> " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npx prisma db seed
        print_success "示例数据导入完成"
    fi
fi

cd ../..

# Step 6: Build application
print_section "6. 构建应用"
pnpm build
print_success "应用构建完成"

# Step 7: Restart PM2
print_section "7. 重启 PM2 应用"
if command -v pm2 &> /dev/null; then
    # Check if app is running
    if pm2 list | grep -q "sillytavern-web"; then
        pm2 restart sillytavern-web
        print_success "PM2 应用重启完成"
    else
        pm2 start ecosystem.production.config.js --env production
        pm2 save
        print_success "PM2 应用启动完成"
    fi
else
    print_error "PM2 未安装，请手动启动应用"
fi

# Step 8: Check application health
print_section "8. 检查应用健康状态"
sleep 3
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health | grep -q "200"; then
    print_success "应用运行正常"
else
    print_error "应用可能未正常启动，请检查日志"
    echo "查看日志: pm2 logs sillytavern-web"
fi

# Step 9: Reload Nginx
print_section "9. 重新加载 Nginx"
if command -v nginx &> /dev/null; then
    sudo nginx -t && sudo systemctl reload nginx
    print_success "Nginx 重新加载完成"
else
    print_error "Nginx 未安装或未配置"
fi

# Summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  部署完成！${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "应用状态:"
pm2 status
echo ""
echo "访问地址:"
echo "  - Local:  http://localhost:3000"
echo "  - Domain: https://www.isillytavern.com"
echo ""
echo "常用命令:"
echo "  - 查看日志: pm2 logs sillytavern-web"
echo "  - 查看状态: pm2 status"
echo "  - 重启应用: pm2 restart sillytavern-web"
echo "  - 监控应用: pm2 monit"
echo ""
print_success "部署脚本执行完成！"
