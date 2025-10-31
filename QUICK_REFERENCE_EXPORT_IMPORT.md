# 快速参考 - 设置导出导入

## 🚀 快速开始

### 打开设置
- **移动端**: 点击底部导航栏 "定义User名称" → 自动打开常规设置
- **桌面端**: 点击顶部导航栏 "设置" → 打开模型设置

### 导出配置
1. 打开设置 → 常规标签
2. 点击底部 "导出" 按钮
3. 下载 `sillytavern-backup-{时间戳}.json`

### 导入配置
1. 打开设置 → 常规标签
2. 点击底部 "导入" 按钮
3. 选择备份文件
4. 等待自动刷新

## 📦 导出内容

✅ 用户名和邮箱  
✅ AI模型配置（含API Key）  
✅ Provider配置  
✅ 聊天设置  
✅ 界面设置  
✅ 正则脚本  
✅ 语言设置  

## 💡 使用场景

- 🔄 更换新设备
- 💾 定期备份
- 🔧 重装浏览器
- 👥 分享配置（注意安全）

## ⚠️ 注意事项

- 导出文件包含API Key等敏感信息，请妥善保管
- 导入后会自动刷新页面
- 用户信息会自动同步到数据库

## 🔧 技术细节

### 导出文件格式
```json
{
  "version": "1.0.0",
  "timestamp": "2025-10-31T...",
  "user": { "username": "...", "email": "..." },
  "localStorage": { ... },
  "metadata": { ... }
}
```

### 相关文件
- `src/stores/settingsUIStore.ts` - 全局状态
- `src/components/settings/SettingsDrawer.tsx` - 导出导入逻辑
- `src/components/layout/BottomNavigation.tsx` - 底部导航
- `src/app/(dashboard)/layout.tsx` - 主布局

## 📚 更多信息

详细文档请查看：
- `SETTINGS_EXPORT_IMPORT_GUIDE.md` - 完整使用指南
- `IMPLEMENTATION_SUMMARY.md` - 技术实施总结

