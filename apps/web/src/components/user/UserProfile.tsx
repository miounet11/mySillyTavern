/**
 * 用户信息组件
 * 显示和编辑用户信息
 */

'use client'

import { useState } from 'react'
import { useUserStore } from '@/stores/userStore'
import { Button, TextInput, Stack, Group, Text, Loader, Paper } from '@mantine/core'
import { IconDeviceFloppy, IconX, IconEdit, IconMail, IconUser } from '@tabler/icons-react'
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
      <Stack align="center" justify="center" py="xl">
        <Loader size="md" />
        <Text size="sm" c="dimmed">
          正在加载用户信息...
        </Text>
      </Stack>
    )
  }

  // 脱敏显示用户 ID（只显示前8位）
  const maskedUserId = user.id.substring(0, 8) + '...'

  return (
    <Stack gap="lg">
      {/* 用户 ID */}
      <Paper p="md" radius="md" withBorder>
        <Stack gap="xs">
          <Group gap="xs">
            <IconUser size={16} />
            <Text size="sm" fw={500}>
              用户 ID
            </Text>
          </Group>
          <Text size="sm" c="dimmed" ff="monospace">
            {maskedUserId}
          </Text>
        </Stack>
      </Paper>

      {/* 用户名 */}
      <Paper p="md" radius="md" withBorder>
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <IconUser size={16} />
              <Text size="sm" fw={500}>
                用户名
              </Text>
            </Group>
            {!isEditingUsername && (
              <Button
                onClick={handleUsernameEdit}
                variant="light"
                size="xs"
                leftSection={<IconEdit size={14} />}
              >
                编辑
              </Button>
            )}
          </Group>
          {isEditingUsername ? (
            <Stack gap="sm">
              <TextInput
                value={newUsername}
                onChange={(e) => setNewUsername(e.currentTarget.value)}
                placeholder="输入新用户名"
                maxLength={50}
                disabled={isLoading}
              />
              <Group gap="xs">
                <Button
                  onClick={handleUsernameSave}
                  disabled={isLoading}
                  size="sm"
                  leftSection={<IconDeviceFloppy size={14} />}
                  loading={isLoading}
                >
                  保存
                </Button>
                <Button
                  onClick={handleUsernameCancel}
                  variant="default"
                  disabled={isLoading}
                  size="sm"
                  leftSection={<IconX size={14} />}
                >
                  取消
                </Button>
              </Group>
            </Stack>
          ) : (
            <Text size="sm">{user.username}</Text>
          )}
        </Stack>
      </Paper>

      {/* 邮箱 */}
      <Paper p="md" radius="md" withBorder>
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <IconMail size={16} />
              <Text size="sm" fw={500}>
                邮箱
              </Text>
            </Group>
            {!isBindingEmail && (
              <Button
                onClick={handleShowEmailBinding}
                variant="light"
                size="xs"
                leftSection={<IconEdit size={14} />}
              >
                {user.email ? '修改' : '绑定'}
              </Button>
            )}
          </Group>
          {isBindingEmail ? (
            <Stack gap="sm">
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                placeholder="输入邮箱地址"
                disabled={isLoading}
              />
              <Text size="xs" c="dimmed">
                绑定邮箱后可用于账号找回
              </Text>
              <Group gap="xs">
                <Button
                  onClick={handleEmailSave}
                  disabled={isLoading}
                  size="sm"
                  leftSection={<IconDeviceFloppy size={14} />}
                  loading={isLoading}
                >
                  保存
                </Button>
                <Button
                  onClick={handleEmailCancel}
                  variant="default"
                  disabled={isLoading}
                  size="sm"
                  leftSection={<IconX size={14} />}
                >
                  取消
                </Button>
              </Group>
            </Stack>
          ) : (
            <Text size="sm" c={user.email ? undefined : 'dimmed'}>
              {user.email || '未绑定'}
            </Text>
          )}
        </Stack>
      </Paper>

      {/* 创建时间 */}
      <Paper p="md" radius="md" withBorder>
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            创建时间
          </Text>
          <Text size="sm" c="dimmed">
            {new Date(user.createdAt).toLocaleString('zh-CN')}
          </Text>
        </Stack>
      </Paper>
    </Stack>
  )
}

