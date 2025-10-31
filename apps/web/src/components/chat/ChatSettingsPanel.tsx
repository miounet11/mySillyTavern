"use client"

import { Button, ActionIcon, Stack, Text, Group, Box, ScrollArea, Divider } from '@mantine/core'
import { 
  IconArrowLeft, 
  IconLayoutSidebarLeftCollapse, 
  IconLayoutSidebarLeftExpand,
  IconGitBranch, 
  IconFileText, 
  IconBook,
  IconSettings,
  IconWand,
  IconCode,
  IconFileCode
} from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { useChatStore } from '@/stores/chatStore'

interface ChatSettingsPanelProps {
  isOpen: boolean
  onToggle: () => void
  onOpenWorldInfo: () => void
  onOpenExternalPrompts?: () => void
  onOpenTemplateVariables?: () => void
  onOpenRegexEditor?: () => void
  onOpenPresetEditor?: () => void
  onOpenBranchView?: () => void
  characterName?: string
  hideOverlay?: boolean
  isMobile?: boolean
  isDesktop?: boolean
}

// Simple token estimation (rough approximation: ~4 characters per token)
const estimateTokens = (text: string): number => {
  if (!text) return 0
  return Math.ceil(text.length / 4)
}

export default function ChatSettingsPanel({
  isOpen,
  onToggle,
  onOpenWorldInfo,
  onOpenExternalPrompts,
  onOpenTemplateVariables,
  onOpenRegexEditor,
  onOpenPresetEditor,
  onOpenBranchView,
  characterName,
  hideOverlay = false,
  isMobile = false,
  isDesktop = false
}: ChatSettingsPanelProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const { messages } = useChatStore()

  // Calculate stats
  const messageCount = messages.length
  const totalTokens = messages.reduce((sum, msg) => {
    return sum + estimateTokens(msg.content || '')
  }, 0)
  const formattedTokenCount = totalTokens > 0 ? totalTokens.toLocaleString() : '0'

  // Desktop: Fixed sidebar content
  const sidebarContent = (
    <div className="h-full bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Header */}
      <Box p={isMobile ? 'sm' : 'md'} style={{ borderBottom: '1px solid var(--mantine-color-dark-5)' }}>
        <Group justify="space-between" mb={isMobile ? 'xs' : 'md'}>
          <Text size={isMobile ? 'sm' : 'md'} fw={600}>{t('chat.settingsPanel.title')}</Text>
          <ActionIcon
            onClick={onToggle}
            variant="subtle"
            size={isMobile ? 'xs' : 'sm'}
            title={t('chat.settingsPanel.collapseSidebar') || 'Collapse sidebar'}
          >
            <IconLayoutSidebarLeftCollapse size={isMobile ? 16 : 18} />
          </ActionIcon>
        </Group>

        {characterName && (
          <Text size="xs" c="dimmed">
            {t('chat.settingsPanel.currentCharacter')}: <Text component="span" c="teal">{characterName}</Text>
          </Text>
        )}
      </Box>

      {/* Navigation Buttons */}
      <ScrollArea style={{ flex: 1 }} p={isMobile ? 'sm' : 'md'} className="pb-20 md:pb-0">
        <Stack gap={isMobile ? 'xs' : 'sm'}>
          <Button
            onClick={() => router.push('/characters')}
            variant="default"
            fullWidth
            size={isMobile ? 'sm' : 'md'}
            leftSection={<IconArrowLeft size={isMobile ? 14 : 16} />}
            justify="flex-start"
            className="min-h-[44px] md:min-h-[auto]"
          >
            {t('chat.settingsPanel.backToCharacters')}
          </Button>

          <Text size="xs" fw={600} c="dimmed" tt="uppercase" mt={isMobile ? 'sm' : 'md'} mb="xs">
            {t('chat.settingsPanel.sections.plot')}
          </Text>

          <Button
            onClick={onOpenBranchView}
            variant="default"
            fullWidth
            size={isMobile ? 'sm' : 'md'}
            leftSection={<IconGitBranch size={isMobile ? 14 : 16} />}
            justify="flex-start"
            title={t('chat.settingsPanel.branches.tooltip')}
            className="min-h-[44px] md:min-h-[auto]"
          >
            {t('chat.settingsPanel.branches.title')}
          </Button>

          <Text size="xs" fw={600} c="dimmed" tt="uppercase" mt={isMobile ? 'sm' : 'md'} mb="xs">
            {t('chat.settingsPanel.sections.settings')}
          </Text>

          <Button
            onClick={onOpenExternalPrompts}
            variant="default"
            fullWidth
            size={isMobile ? 'sm' : 'md'}
            leftSection={<IconFileText size={isMobile ? 14 : 16} />}
            justify="flex-start"
            title={t('chat.settingsPanel.externalPrompts.tooltip')}
            className="min-h-[44px] md:min-h-[auto]"
          >
            {t('chat.settingsPanel.externalPrompts.title')}
          </Button>

          <Button
            onClick={onOpenWorldInfo}
            variant="default"
            fullWidth
            size={isMobile ? 'sm' : 'md'}
            leftSection={<IconBook size={isMobile ? 14 : 16} />}
            justify="flex-start"
            title={t('chat.settingsPanel.worldInfo.tooltip')}
            className="min-h-[44px] md:min-h-[auto]"
          >
            {t('chat.settingsPanel.worldInfo.title')}
          </Button>

          <Button
            onClick={onOpenTemplateVariables}
            variant="default"
            fullWidth
            size={isMobile ? 'sm' : 'md'}
            leftSection={<IconWand size={isMobile ? 14 : 16} />}
            justify="flex-start"
            title={t('chat.settingsPanel.templateVars.tooltip')}
            className="min-h-[44px] md:min-h-[auto]"
          >
            {t('chat.settingsPanel.templateVars.title')}
          </Button>

          <Button
            onClick={onOpenRegexEditor}
            variant="default"
            fullWidth
            size={isMobile ? 'sm' : 'md'}
            leftSection={<IconCode size={isMobile ? 14 : 16} />}
            justify="flex-start"
            title={t('chat.settingsPanel.regex.tooltip')}
            className="min-h-[44px] md:min-h-[auto]"
          >
            {t('chat.settingsPanel.regex.title')}
          </Button>

          <Button
            onClick={onOpenPresetEditor}
            variant="default"
            fullWidth
            size={isMobile ? 'sm' : 'md'}
            leftSection={<IconFileCode size={isMobile ? 14 : 16} />}
            justify="flex-start"
            title={t('chat.settingsPanel.presets.tooltip')}
            className="min-h-[44px] md:min-h-[auto]"
          >
            {t('chat.settingsPanel.presets.title')}
          </Button>

          <Text size="xs" fw={600} c="dimmed" tt="uppercase" mt={isMobile ? 'sm' : 'md'} mb="xs">
            {t('chat.settingsPanel.sections.advanced')}
          </Text>

          <Button
            onClick={() => window.dispatchEvent(new CustomEvent('open-settings'))}
            variant="default"
            fullWidth
            size={isMobile ? 'sm' : 'md'}
            leftSection={<IconSettings size={isMobile ? 14 : 16} />}
            justify="flex-start"
            title={t('chat.settingsPanel.advancedSettings.tooltip')}
            className="min-h-[44px] md:min-h-[auto]"
          >
            {t('chat.settingsPanel.advancedSettings.title')}
          </Button>
        </Stack>
      </ScrollArea>

      {/* Footer Info */}
      <Box p={isMobile ? 'sm' : 'md'} style={{ borderTop: '1px solid var(--mantine-color-dark-5)' }}>
        <Stack gap={isMobile ? 2 : 4}>
          <Group justify="space-between">
            <Text size="xs" c="dimmed">{t('chat.settingsPanel.stats.messageCount')}:</Text>
            <Text size="xs" c="gray">{messageCount}</Text>
          </Group>
          <Group justify="space-between">
            <Text size="xs" c="dimmed">{t('chat.settingsPanel.stats.tokenUsage')}:</Text>
            <Text size="xs" c="gray">{formattedTokenCount}</Text>
          </Group>
        </Stack>
      </Box>
    </div>
  )

  // Desktop: Render as fixed sidebar
  if (isDesktop) {
    return (
      <>
        {/* Floating button when closed */}
        {!isOpen && (
          <ActionIcon
            onClick={onToggle}
            size="lg"
            variant="filled"
            color="dark"
            style={{
              position: 'fixed',
              left: '1rem',
              top: '5rem',
              zIndex: 30
            }}
            title={t('chat.settingsPanel.expandSidebar')}
          >
            <IconLayoutSidebarLeftExpand size={20} />
          </ActionIcon>
        )}

        {/* Fixed sidebar */}
        {isOpen && sidebarContent}
      </>
    )
  }

  // Mobile: Render as drawer
  return (
    <>
      {/* Floating button when closed */}
      {!isOpen && (
        <ActionIcon
          onClick={onToggle}
          size="lg"
          variant="filled"
          color="dark"
          style={{
            position: 'fixed',
            left: '1rem',
            top: '5rem',
            zIndex: 30
          }}
          title={t('chat.settingsPanel.expandSidebar')}
        >
          <IconLayoutSidebarLeftExpand size={20} />
        </ActionIcon>
      )}

      {/* Drawer Sheet for mobile */}
      <Sheet open={isOpen} onOpenChange={onToggle}>
        <SheetContent side="left" className="w-[85%] sm:w-[320px] md:w-[340px] p-0 flex flex-col" hideOverlay={hideOverlay}>
          {/* Accessibility titles for screen readers */}
          <SheetTitle className="sr-only">{t('chat.settingsPanel.title')}</SheetTitle>
          <SheetDescription className="sr-only">
            {t('chat.settingsPanel.description') || 'Chat settings and navigation panel'}
          </SheetDescription>
          
          {/* Header */}
          <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-dark-5)' }}>
            <Group justify="space-between" mb="md">
              <Text size="sm" fw={600}>{t('chat.settingsPanel.title')}</Text>
            </Group>

            {characterName && (
              <Text size="xs" c="dimmed">
                {t('chat.settingsPanel.currentCharacter')}: <Text component="span" c="teal">{characterName}</Text>
              </Text>
            )}
          </Box>

          {/* Navigation Buttons */}
          <ScrollArea style={{ flex: 1 }} p="md" className="pb-20 md:pb-0">
            <Stack gap="xs">
          <Button
            onClick={() => router.push('/characters')}
            variant="default"
            fullWidth
            leftSection={<IconArrowLeft size={16} />}
            justify="flex-start"
            className="min-h-[44px] md:min-h-[auto]"
          >
            {t('chat.settingsPanel.backToCharacters')}
          </Button>

          <Text size="xs" fw={600} c="dimmed" tt="uppercase" mt="md" mb="xs">
            {t('chat.settingsPanel.sections.plot')}
          </Text>

          <Button
            onClick={onOpenBranchView}
            variant="default"
            fullWidth
            leftSection={<IconGitBranch size={16} />}
            justify="flex-start"
            title={t('chat.settingsPanel.branches.tooltip')}
            className="min-h-[44px] md:min-h-[auto]"
          >
            {t('chat.settingsPanel.branches.title')}
          </Button>

          <Text size="xs" fw={600} c="dimmed" tt="uppercase" mt="md" mb="xs">
            {t('chat.settingsPanel.sections.settings')}
          </Text>

          <Button
            onClick={onOpenExternalPrompts}
            variant="default"
            fullWidth
            leftSection={<IconFileText size={16} />}
            justify="flex-start"
            title={t('chat.settingsPanel.externalPrompts.tooltip')}
            className="min-h-[44px] md:min-h-[auto]"
          >
            {t('chat.settingsPanel.externalPrompts.title')}
          </Button>

          <Button
            onClick={onOpenWorldInfo}
            variant="default"
            fullWidth
            leftSection={<IconBook size={16} />}
            justify="flex-start"
            title={t('chat.settingsPanel.worldInfo.tooltip')}
            className="min-h-[44px] md:min-h-[auto]"
          >
            {t('chat.settingsPanel.worldInfo.title')}
          </Button>

          <Button
            onClick={onOpenTemplateVariables}
            variant="default"
            fullWidth
            leftSection={<IconWand size={16} />}
            justify="flex-start"
            title={t('chat.settingsPanel.templateVars.tooltip')}
            className="min-h-[44px] md:min-h-[auto]"
          >
            {t('chat.settingsPanel.templateVars.title')}
          </Button>

          <Button
            onClick={onOpenRegexEditor}
            variant="default"
            fullWidth
            leftSection={<IconCode size={16} />}
            justify="flex-start"
            title={t('chat.settingsPanel.regex.tooltip')}
            className="min-h-[44px] md:min-h-[auto]"
          >
            {t('chat.settingsPanel.regex.title')}
          </Button>

          <Button
            onClick={onOpenPresetEditor}
            variant="default"
            fullWidth
            leftSection={<IconFileCode size={16} />}
            justify="flex-start"
            title={t('chat.settingsPanel.presets.tooltip')}
            className="min-h-[44px] md:min-h-[auto]"
          >
            {t('chat.settingsPanel.presets.title')}
          </Button>

          <Text size="xs" fw={600} c="dimmed" tt="uppercase" mt="md" mb="xs">
            {t('chat.settingsPanel.sections.advanced')}
          </Text>

          <Button
            onClick={() => window.dispatchEvent(new CustomEvent('open-settings'))}
            variant="default"
            fullWidth
            leftSection={<IconSettings size={16} />}
            justify="flex-start"
            title={t('chat.settingsPanel.advancedSettings.tooltip')}
            className="min-h-[44px] md:min-h-[auto]"
          >
            {t('chat.settingsPanel.advancedSettings.title')}
          </Button>
            </Stack>
          </ScrollArea>

          {/* Footer Info */}
          <Box p="md" style={{ borderTop: '1px solid var(--mantine-color-dark-5)' }}>
            <Stack gap={4}>
              <Group justify="space-between">
                <Text size="xs" c="dimmed">{t('chat.settingsPanel.stats.messageCount')}:</Text>
                <Text size="xs" c="gray">{messageCount}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="xs" c="dimmed">{t('chat.settingsPanel.stats.tokenUsage')}:</Text>
                <Text size="xs" c="gray">{formattedTokenCount}</Text>
              </Group>
            </Stack>
          </Box>
        </SheetContent>
      </Sheet>
    </>
  )
}

