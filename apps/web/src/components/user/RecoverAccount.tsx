/**
 * 账号找回组件
 * 通过邮箱找回账号
 */

'use client'

import { useState } from 'react'
import { useUserStore } from '@/stores/userStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'react-hot-toast'

interface RecoverAccountProps {
  trigger?: React.ReactNode
}

export function RecoverAccount({ trigger }: RecoverAccountProps) {
  const { isLoading, recoverAccount } = useUserStore()
  const [email, setEmail] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // 处理账号找回
  const handleRecover = async () => {
    if (!email.trim()) {
      toast.error('请输入邮箱地址')
      return
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('请输入有效的邮箱地址')
      return
    }

    const success = await recoverAccount(email)
    if (success) {
      toast.success('账号找回成功，正在刷新页面...')
      setIsOpen(false)
      // recoverAccount 函数会自动刷新页面
    } else {
      // 错误信息已在 store 中处理
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="link" size="sm">
            找回账号
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>找回账号</DialogTitle>
          <DialogDescription>
            输入您绑定的邮箱地址，我们将帮您找回账号。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="recover-email">邮箱地址</Label>
            <Input
              id="recover-email"
              type="email"
              placeholder="输入绑定的邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleRecover()
                }
              }}
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              💡 提示：找回账号后，您的浏览器将自动切换到该账号。
              本地聊天记录将保持不变。
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleRecover}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? '找回中...' : '找回账号'}
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              disabled={isLoading}
            >
              取消
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

