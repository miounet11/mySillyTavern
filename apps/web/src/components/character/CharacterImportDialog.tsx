import { useState } from 'react'
import { Modal, Button, Text, Stack, Alert, Group, FileButton } from '@mantine/core'
import { Dropzone, FileWithPath } from '@mantine/dropzone'
import { IconUpload, IconX, IconFile } from '@tabler/icons-react'

interface CharacterImportDialogProps {
  isOpen: boolean
  onClose: () => void
  onImported: () => void
}

export default function CharacterImportDialog({ isOpen, onClose, onImported }: CharacterImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (f: File | FileWithPath) => {
    setError(null)
    setIsLoading(true)
    setFile(f)
    try {
      const form = new FormData()
      form.append('file', f)
      const res = await fetch('/api/characters/import?commit=false', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || '预览失败')
      setPreview(data.preview)
    } catch (err) {
      setError(err instanceof Error ? err.message : '预览失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = async () => {
    if (!file) return
    setIsLoading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/characters/import?commit=true', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || '导入失败')
      onImported()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="导入角色"
      size="lg"
      centered
    >
      <Stack gap="md">
        <Dropzone
          onDrop={(files) => files[0] && handleFile(files[0])}
          accept={['application/json', 'image/png']}
          maxFiles={1}
          loading={isLoading}
          styles={{
            root: {
              backgroundColor: 'rgba(31, 41, 55, 0.5)',
              borderColor: 'rgb(75, 85, 99)',
              borderWidth: '2px',
              borderStyle: 'dashed',
              borderRadius: '0.5rem',
              padding: '2rem',
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                borderColor: 'rgb(96, 165, 250)',
              },
            },
          }}
        >
          <Stack align="center" gap="sm">
            <IconUpload size={40} color="rgb(156, 163, 175)" />
            <Text size="sm" c="dimmed">
              拖拽文件至此
            </Text>
            <FileButton
              onChange={(file) => file && handleFile(file)}
              accept="application/json,image/png"
            >
              {(props) => (
                <Button {...props} variant="light">
                  或选择文件
                </Button>
              )}
            </FileButton>
            <Text size="xs" c="dimmed">
              支持 Tavern 卡片 JSON 或 PNG
            </Text>
          </Stack>
        </Dropzone>

        {error && (
          <Alert
            icon={<IconX size={16} />}
            color="red"
            variant="light"
            title="错误"
          >
            {error}
          </Alert>
        )}

        {isLoading && (
          <Text size="sm" c="dimmed" ta="center">
            解析中…
          </Text>
        )}

        {preview && (
          <Stack
            gap="sm"
            p="md"
            style={{
              backgroundColor: 'rgba(31, 41, 55, 0.5)',
              borderRadius: '0.5rem',
              border: '1px solid rgb(75, 85, 99)',
            }}
          >
            <Text size="xs" c="dimmed" fw={600}>
              预览映射
            </Text>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <Text size="xs" c="dimmed">名称</Text>
                <Text size="sm">{preview.mapping.name}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">问候</Text>
                <Text size="sm" lineClamp={3}>
                  {preview.normalized.greeting || '-'}
                </Text>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Text size="xs" c="dimmed">场景</Text>
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                  {preview.normalized.scenario || '-'}
                </Text>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Text size="xs" c="dimmed">人物设定</Text>
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                  {preview.normalized.personality || '-'}
                </Text>
              </div>
            </div>
          </Stack>
        )}

        <Group justify="flex-end" gap="sm" mt="md">
          <Button variant="default" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleImport} disabled={!file || isLoading} loading={isLoading}>
            导入
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}


