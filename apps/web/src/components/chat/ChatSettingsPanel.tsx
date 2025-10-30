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
  characterName
}: ChatSettingsPanelProps) {
  const { t } = useTranslation()
  const router = useRouter()

  if (!isOpen) {
    return (
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
    )
  }

  return (
    <Box
      style={{
        width: '16rem',
        height: '100%',
        borderRight: '1px solid var(--mantine-color-dark-5)',
        backgroundColor: 'var(--mantine-color-dark-7)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Header */}
      <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-dark-5)' }}>
        <Group justify="space-between" mb="md">
          <Text size="sm" fw={600}>{t('chat.settingsPanel.title')}</Text>
          <ActionIcon
            onClick={onToggle}
            variant="subtle"
            color="gray"
            title={t('chat.settingsPanel.collapseSidebar')}
          >
            <IconLayoutSidebarLeftCollapse size={16} />
          </ActionIcon>
        </Group>

        {characterName && (
          <Text size="xs" c="dimmed">
            {t('chat.settingsPanel.currentCharacter')}: <Text component="span" c="teal">{characterName}</Text>
          </Text>
        )}
      </Box>

      {/* Navigation Buttons */}
      <ScrollArea style={{ flex: 1 }} p="md">
        <Stack gap="xs">
          <Button
            onClick={() => router.push('/characters')}
            variant="default"
            fullWidth
            leftSection={<IconArrowLeft size={16} />}
            justify="flex-start"
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
            <Text size="xs" c="gray">--</Text>
          </Group>
          <Group justify="space-between">
            <Text size="xs" c="dimmed">{t('chat.settingsPanel.stats.tokenUsage')}:</Text>
            <Text size="xs" c="gray">--</Text>
          </Group>
        </Stack>
      </Box>

      {/* Dialogs moved to chat/page to match World Info open behavior */}
    </Box>
  )
}

