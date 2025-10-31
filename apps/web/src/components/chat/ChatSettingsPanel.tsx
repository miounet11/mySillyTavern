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
  isMobile = false
}: ChatSettingsPanelProps) {
  const { t } = useTranslation()
  const router = useRouter()

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

      {/* Drawer Sheet */}
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
                <Text size="xs" c="gray">--</Text>
              </Group>
              <Group justify="space-between">
                <Text size="xs" c="dimmed">{t('chat.settingsPanel.stats.tokenUsage')}:</Text>
                <Text size="xs" c="gray">--</Text>
              </Group>
            </Stack>
          </Box>
        </SheetContent>
      </Sheet>
    </>
  )
}

