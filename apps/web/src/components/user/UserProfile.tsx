/**
 * 用户信息组件
 * 显示和编辑用户信息
 */

'use client'

import { useState } from 'react'
import { useUserStore } from '@/stores/userStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'

export function UserProfile() {
  const { user, isLoading, updateUsername, bindEmail } = useUserStore()
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [isBindingEmail, setIsBindingEmail] = useState(false)
  const [email, setEmail] = useState('')

  // 处理用户名编辑
  const handleUsernameEdit = () => {
    setNewUsername(user?.username || '')
    setIsEditingUsername(true)
  }

  // 保存用户名
  const handleUsernameSave = async () => {
    if (!newUsername.trim()) {
      toast.error('用户名不能为空')
      return
    }

    const success = await updateUsername(newUsername)
    if (success) {
      toast.success('用户名更新成功')
      setIsEditingUsername(false)
    } else {
      toast.error('用户名更新失败')
    }
  }

  // 取消编辑用户名
  const handleUsernameCancel = () => {
    setIsEditingUsername(false)
    setNewUsername('')
  }

  // 显示邮箱绑定表单
  const handleShowEmailBinding = () => {
    setEmail(user?.email || '')
    setIsBindingEmail(true)
  }

  // 保存邮箱
  const handleEmailSave = async () => {
    if (!email.trim()) {
      toast.error('邮箱不能为空')
      return
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('请输入有效的邮箱地址')
      return
    }

    const success = await bindEmail(email)
    if (success) {
      toast.success('邮箱绑定成功')
      setIsBindingEmail(false)
    } else {
      toast.error('邮箱绑定失败')
    }
  }

  // 取消绑定邮箱
  const handleEmailCancel = () => {
    setIsBindingEmail(false)
    setEmail('')
  }

  if (!user) {
    return (
      <div className="text-center py-4 text-gray-500">
        正在加载用户信息...
      </div>
    )
  }

  // 脱敏显示用户 ID（只显示前8位）
  const maskedUserId = user.id.substring(0, 8) + '...'

  return (
    <div className="space-y-6">
      {/* 用户 ID */}
      <div>
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          用户 ID
        </Label>
        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-mono">
          {maskedUserId}
        </div>
      </div>

      {/* 用户名 */}
      <div>
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          用户名
        </Label>
        {isEditingUsername ? (
          <div className="mt-2 space-y-2">
            <Input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="输入新用户名"
              maxLength={50}
              disabled={isLoading}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleUsernameSave}
                disabled={isLoading}
                size="sm"
              >
                保存
              </Button>
              <Button
                onClick={handleUsernameCancel}
                variant="outline"
                disabled={isLoading}
                size="sm"
              >
                取消
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm">{user.username}</span>
            <Button
              onClick={handleUsernameEdit}
              variant="outline"
              size="sm"
            >
              编辑
            </Button>
          </div>
        )}
      </div>

      {/* 邮箱 */}
      <div>
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          邮箱
        </Label>
        {isBindingEmail ? (
          <div className="mt-2 space-y-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="输入邮箱地址"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              绑定邮箱后可用于账号找回
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleEmailSave}
                disabled={isLoading}
                size="sm"
              >
                保存
              </Button>
              <Button
                onClick={handleEmailCancel}
                variant="outline"
                disabled={isLoading}
                size="sm"
              >
                取消
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm">
              {user.email || '未绑定'}
            </span>
            <Button
              onClick={handleShowEmailBinding}
              variant="outline"
              size="sm"
            >
              {user.email ? '修改' : '绑定'}
            </Button>
          </div>
        )}
      </div>

      {/* 创建时间 */}
      <div>
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          创建时间
        </Label>
        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {new Date(user.createdAt).toLocaleString('zh-CN')}
        </div>
      </div>
    </div>
  )
}

