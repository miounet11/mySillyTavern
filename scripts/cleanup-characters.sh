#!/bin/bash
# Cleanup script to remove all seed characters from the database
# This allows users to start with a clean slate

set -e

echo "========================================="
echo "  角色卡数据清理脚本"
echo "========================================="
echo ""
echo "⚠️  警告：此脚本将删除数据库中的所有角色卡数据！"
echo ""
echo "这包括："
echo "  - 所有系统预置的角色（11个seed角色）"
echo "  - 所有用户创建的角色"
echo "  - 所有从社区导入的角色"
echo ""
echo "重要提醒："
echo "  - 此操作不可逆！"
echo "  - 相关的聊天记录也会被删除（因为外键级联）"
echo "  - 请确保已经备份重要数据！"
echo ""
echo "清理后，用户可以："
echo "  1. 从空白状态开始"
echo "  2. 从社区下载角色"
echo "  3. 创建自己的角色"
echo "  4. 导入角色文件"
echo ""
read -p "确定要继续吗？(输入 yes 继续): " confirm

if [ "$confirm" != "yes" ]; then
  echo ""
  echo "❌ 操作已取消"
  exit 0
fi

echo ""
echo "正在清理角色卡数据..."

# Navigate to database package
cd "$(dirname "$0")/../packages/database"

# Execute SQL to delete all characters
# Due to CASCADE, related chats and messages will also be deleted
npx prisma db execute --stdin <<SQL
-- Delete all characters (CASCADE will handle related data)
DELETE FROM "Character";

-- Reset any sequences if needed
-- (Not necessary for cuid/nanoid based IDs)
SQL

echo ""
echo "✅ 角色卡数据已成功清理！"
echo ""
echo "下一步："
echo "  1. 重启应用: pm2 restart sillytavern"
echo "  2. 访问角色卡页面，应该看到空列表"
echo "  3. 访问社区页面，可以下载官方角色"
echo ""
echo "💡 提示：从现在开始，所有角色都需要用户主动添加"
echo "   - 社区下载"
echo "   - 文件导入"
echo "   - 手动创建"
echo ""

