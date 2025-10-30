"use client"

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Group, Button, ActionIcon, Burger, Drawer, Stack, Text } from '@mantine/core'
import { IconMessageCircle, IconUsers, IconWorld, IconSettings } from '@tabler/icons-react'

export default function TopNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: '首页', href: '/', icon: IconMessageCircle },
    { name: '角色卡', href: '/characters', icon: IconUsers },
    { name: '角色卡社区', href: '/characters/community', icon: IconWorld },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  const handleSettingsClick = () => {
    window.dispatchEvent(new CustomEvent('open-settings'))
  }

  const handleNavigate = (href: string) => {
    router.push(href)
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <Group h={60} px="md" justify="space-between" style={{ maxWidth: '80rem', margin: '0 auto', width: '100%' }}>
        {/* Logo */}
        <Button
          variant="subtle"
          onClick={() => router.push('/')}
          style={{
            fontWeight: 700,
            fontSize: '1.25rem',
            background: 'linear-gradient(to right, #2dd4bf, #22d3ee)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            transition: 'all 0.3s',
          }}
          px="xs"
        >
          <IconMessageCircle 
            size={24} 
            style={{ 
              color: '#2dd4bf', 
              marginRight: '0.75rem',
              flexShrink: 0,
            }} 
          />
          SillyTavern
        </Button>

        {/* Desktop Navigation */}
        <Group gap="xs" visibleFrom="md">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Button
                key={item.name}
                variant={active ? 'light' : 'subtle'}
                leftSection={<Icon size={16} />}
                onClick={() => router.push(item.href)}
                color={active ? 'cyan' : 'gray'}
                size="sm"
              >
                {item.name}
              </Button>
            )
          })}

          <Button
            variant="subtle"
            leftSection={<IconSettings size={16} />}
            onClick={handleSettingsClick}
            color="gray"
            size="sm"
          >
            设置
          </Button>
        </Group>

        {/* Mobile menu button */}
        <Burger
          opened={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          hiddenFrom="md"
          color="gray"
        />
      </Group>

      {/* Mobile Drawer */}
      <Drawer
        opened={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        position="right"
        size="xs"
        title={
          <Text fw={700} size="lg" style={{
            background: 'linear-gradient(to right, #2dd4bf, #22d3ee)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            导航
          </Text>
        }
      >
        <Stack gap="xs">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Button
                key={item.name}
                variant={active ? 'light' : 'subtle'}
                leftSection={<Icon size={18} />}
                onClick={() => handleNavigate(item.href)}
                color={active ? 'cyan' : 'gray'}
                fullWidth
                justify="flex-start"
              >
                {item.name}
              </Button>
            )
          })}

          <Button
            variant="subtle"
            leftSection={<IconSettings size={18} />}
            onClick={() => {
              handleSettingsClick()
              setIsMobileMenuOpen(false)
            }}
            color="gray"
            fullWidth
            justify="flex-start"
          >
            设置
          </Button>
        </Stack>
      </Drawer>
    </>
  )
}

