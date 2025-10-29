#!/bin/bash
#
# SillyTavern 上下文持久化系统 - 完整部署脚本
# 
# 用法: ./deploy-context-system.sh
#

set -e  # 遇到错误立即停止

echo "========================================="
echo "🚀 SillyTavern 上下文持久化系统部署"
echo "========================================="
echo

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
  echo "❌ 错误: 请在项目根目录执行此脚本"
  exit 1
fi

# 步骤 1: 数据库迁移
echo "📊 步骤 1/4: 执行数据库迁移"
echo "----------------------------------------"
echo

# 检查 DATABASE_URL 环境变量
if [ -z "$DATABASE_URL" ]; then
  if [ -f ".env" ]; then
    export $(grep DATABASE_URL .env | xargs)
  else
    echo "❌ 错误: 未找到 DATABASE_URL 环境变量"
    echo "请在 .env 文件中配置 DATABASE_URL"
    exit 1
  fi
fi

echo "正在连接数据库..."

# 提取数据库连接信息
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')

echo "数据库: $DB_NAME @ $DB_HOST:$DB_PORT"
echo

# 执行 SQL 迁移
echo "执行 SQL 迁移脚本..."
psql "$DATABASE_URL" -f packages/database/prisma/migrations/20251029_context_system_upgrade.sql

if [ $? -eq 0 ]; then
  echo "✅ 数据库迁移完成"
else
  echo "❌ 数据库迁移失败"
  echo "请检查："
  echo "1. PostgreSQL 版本是否 >= 11"
  echo "2. 是否已安装 pgvector 扩展: sudo apt-get install postgresql-15-pgvector"
  echo "3. 数据库用户是否有足够权限"
  exit 1
fi

echo

# 步骤 2: 重新生成 Prisma Client
echo "🔧 步骤 2/4: 重新生成 Prisma Client"
echo "----------------------------------------"
cd packages/database
pnpm prisma generate
cd ../..
echo "✅ Prisma Client 生成完成"
echo

# 步骤 3: 检查环境变量
echo "⚙️  步骤 3/4: 检查环境变量配置"
echo "----------------------------------------"

required_vars=(
  "CONTEXT_MAX_TOKENS"
  "CONTEXT_RESERVE_TOKENS"
  "WORLDINFO_MAX_RECURSIVE_DEPTH"
  "WORLDINFO_DEFAULT_VECTOR_THRESHOLD"
)

missing_vars=()

for var in "${required_vars[@]}"; do
  if ! grep -q "^$var=" .env 2>/dev/null; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
  echo "⚠️  以下环境变量未配置，将使用默认值:"
  for var in "${missing_vars[@]}"; do
    echo "  - $var"
  done
  echo
  echo "建议添加到 .env 文件:"
  echo "CONTEXT_MAX_TOKENS=8000"
  echo "CONTEXT_RESERVE_TOKENS=1000"
  echo "WORLDINFO_MAX_RECURSIVE_DEPTH=2"
  echo "WORLDINFO_DEFAULT_VECTOR_THRESHOLD=0.7"
  echo
else
  echo "✅ 所有必需环境变量已配置"
fi

echo

# 步骤 4: 重启服务
echo "🔄 步骤 4/4: 重启服务"
echo "----------------------------------------"

# 检测是否使用 PM2
if command -v pm2 &> /dev/null; then
  echo "检测到 PM2，正在重启..."
  
  # 查找 SillyTavern 进程
  if pm2 list | grep -q "sillytavern"; then
    pm2 restart sillytavern
    echo "✅ PM2 重启完成"
  elif pm2 list | grep -q "web"; then
    pm2 restart web
    echo "✅ PM2 重启完成"
  else
    echo "⚠️  未找到 PM2 进程，请手动重启"
    echo "运行: pm2 start ecosystem.config.js"
  fi
else
  echo "⚠️  未检测到 PM2"
  echo "如果使用其他进程管理器，请手动重启服务"
fi

echo
echo "========================================="
echo "✨ 部署完成！"
echo "========================================="
echo
echo "📋 后续步骤（可选）:"
echo
echo "1. 生成现有 World Info 的 embeddings:"
echo "   npx tsx scripts/generate-all-embeddings.ts"
echo
echo "2. 访问 https://www.isillytavern.com/ 验证功能"
echo
echo "3. 查看日志确认系统正常运行:"
echo "   pm2 logs sillytavern"
echo
echo "========================================="
echo "🎉 享受极致的上下文持久化体验！"
echo "========================================="

