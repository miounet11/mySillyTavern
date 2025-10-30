import { Modal, Button, Text, Group } from '@mantine/core'
import { IconSettings } from '@tabler/icons-react'

interface ModelNotSetModalProps {
  open: boolean
  onClose: () => void
}

export function ModelNotSetModal({ open, onClose }: ModelNotSetModalProps) {
  const handleGoToSettings = () => {
    onClose()
    try {
      window.dispatchEvent(new CustomEvent('open-settings'))
    } catch {}
  }

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title="请先设置模型"
      size="md"
      centered
    >
      <Text size="sm" c="dimmed" mb="lg">
        在使用导出/删除/重生成等功能前，请先在设置中配置一个可用的 AI 模型（提供商、模型名称、API Key 或本地模型）。
      </Text>
      
      <Group justify="flex-end" gap="sm">
        <Button variant="default" onClick={onClose}>
          稍后再说
        </Button>
        <Button leftSection={<IconSettings size={16} />} onClick={handleGoToSettings}>
          去设置
        </Button>
      </Group>
    </Modal>
  )
}

export default ModelNotSetModal


