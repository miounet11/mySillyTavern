"use client"

import { Character } from '@sillytavern-clone/shared'
import { Card, Button, Badge, ActionIcon, Group, Text, Stack, Tooltip, Menu, Box } from '@mantine/core'
import { IconMessageCircle, IconEdit, IconTrash, IconDownload, IconDotsVertical } from '@tabler/icons-react'

interface CharacterCardProps {
  character: Character
  messageCount?: number
  onClick?: (character: Character) => void
  onSelect?: (character: Character) => void
  onEdit?: (character: Character) => void
  onDelete?: (id: string) => void
  onExport?: (id: string) => void
  variant?: 'default' | 'large'
}

export default function CharacterCard({
  character,
  messageCount,
  onClick,
  onSelect,
  onEdit,
  onDelete,
  onExport,
  variant = 'large'
}: CharacterCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on action buttons
    const target = e.target as HTMLElement
    if (target.closest('button')) {
      return
    }
    
    if (onClick) {
      onClick(character)
    } else if (onSelect) {
      onSelect(character)
    }
  }

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation()
    action()
  }

  if (variant === 'large') {
    return (
      <Card
        className="character-card group stagger-item animate-fade-in"
        onClick={handleClick}
        padding={0}
        radius="md"
        withBorder
        style={{
          cursor: 'pointer',
          overflow: 'hidden',
          contain: 'layout style paint',
          willChange: 'transform',
        }}
        styles={{
          root: {
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
            },
          },
        }}
      >
        {/* Character Image */}
        <Box
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '2/3',
            background: 'linear-gradient(to bottom right, hsl(var(--bg-base-end)), hsl(var(--bg-base-start)))',
            overflow: 'hidden',
          }}
        >
          {character.avatar ? (
            <img
              src={character.avatar}
              alt={character.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s ease',
              }}
              className="group-hover:scale-105"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const fallback = e.currentTarget.nextElementSibling as HTMLElement
                if (fallback) fallback.style.display = 'flex'
              }}
            />
          ) : null}
          <div 
            style={{ 
              display: character.avatar ? 'none' : 'flex',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, hsl(var(--primary-rose) / 0.2), hsl(var(--accent-gold) / 0.2))'
            }}
          >
            <Text
              size="72px"
              fw={700}
              style={{
                background: 'linear-gradient(to right, hsl(var(--primary-rose)), hsl(var(--accent-gold)))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {character.name.charAt(0).toUpperCase()}
            </Text>
          </div>

          {/* Gradient overlay */}
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, hsl(var(--bg-base-start)), transparent, transparent)',
              opacity: 0.6,
            }}
          />
          
          {/* Hover overlay with actions */}
          <div 
            className="group-hover:opacity-100"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.6), transparent)',
              opacity: 0,
              transition: 'opacity 0.2s ease',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              padding: '1rem',
              backdropFilter: 'blur(2px)',
            }}
          >
            <Stack 
              gap="xs" 
              style={{ 
                width: '100%',
                transform: 'translateY(12px)',
                transition: 'transform 0.2s ease',
              }}
              className="group-hover:translate-y-0"
            >
              {onSelect && (
                <Button
                  onClick={(e) => handleAction(e, () => onSelect(character))}
                  fullWidth
                  size="sm"
                  variant="gradient"
                  gradient={{ from: 'cyan', to: 'blue', deg: 90 }}
                  leftSection={<IconMessageCircle size={16} />}
                  styles={{
                    root: {
                      boxShadow: 'var(--shadow-rose-gold)',
                    },
                  }}
                >
                  开始对话
                </Button>
              )}
              <Group gap="xs" grow>
                {onEdit && (
                  <Tooltip label="编辑">
                    <ActionIcon
                      onClick={(e) => handleAction(e, () => onEdit(character))}
                      variant="light"
                      color="gray"
                      size="lg"
                      style={{
                        backgroundColor: 'hsl(var(--primary-rose) / 0.1)',
                        borderColor: 'hsl(var(--primary-rose) / 0.3)',
                      }}
                    >
                      <IconEdit size={18} />
                    </ActionIcon>
                  </Tooltip>
                )}
                {onExport && (
                  <Tooltip label="导出">
                    <ActionIcon
                      onClick={(e) => handleAction(e, () => onExport(character.id))}
                      variant="light"
                      color="gray"
                      size="lg"
                      style={{
                        backgroundColor: 'hsl(var(--primary-rose) / 0.1)',
                        borderColor: 'hsl(var(--primary-rose) / 0.3)',
                      }}
                    >
                      <IconDownload size={18} />
                    </ActionIcon>
                  </Tooltip>
                )}
                {onDelete && (
                  <Tooltip label="删除">
                    <ActionIcon
                      onClick={(e) => handleAction(e, () => onDelete(character.id))}
                      variant="filled"
                      color="red"
                      size="lg"
                      styles={{
                        root: {
                          backgroundColor: 'rgba(220, 38, 38, 0.8)',
                          '&:hover': {
                            backgroundColor: 'rgb(185, 28, 28)',
                          },
                        },
                      }}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            </Stack>
          </div>
        </Box>

        {/* Character Info */}
        <Stack gap="sm" p="md">
          <Text
            size="md"
            fw={600}
            lineClamp={1}
            className="group-hover:text-rose-400"
            style={{
              color: 'hsl(var(--text-primary))',
              transition: 'color 0.2s ease',
            }}
          >
            {character.name}
          </Text>
          
          {character.description && (
            <Text
              size="sm"
              c="dimmed"
              lineClamp={2}
              style={{
                minHeight: '2.5rem',
                lineHeight: 1.5,
              }}
            >
              {character.description}
            </Text>
          )}

          {character.tags && character.tags.length > 0 && (
            <Group gap={6} pt="xs">
              {character.tags.slice(0, 3).map((tag: string, index: number) => (
                <Badge
                  key={index}
                  size="sm"
                  variant="light"
                  color="cyan"
                  styles={{
                    root: {
                      textTransform: 'none',
                      fontSize: '0.75rem',
                    },
                  }}
                >
                  {tag}
                </Badge>
              ))}
              {character.tags.length > 3 && (
                <Badge
                  size="sm"
                  variant="light"
                  color="gray"
                  styles={{
                    root: {
                      textTransform: 'none',
                      fontSize: '0.75rem',
                    },
                  }}
                >
                  +{character.tags.length - 3}
                </Badge>
              )}
            </Group>
          )}

          {messageCount !== undefined && messageCount > 0 && (
            <Group
              gap={6}
              pt="xs"
              style={{
                borderTop: '1px solid rgba(107, 114, 128, 0.3)',
              }}
            >
              <IconMessageCircle size={14} color="rgb(96, 165, 250)" />
              <Text size="xs" c="dimmed">
                {messageCount} 条消息
              </Text>
            </Group>
          )}
        </Stack>
      </Card>
    )
  }

  // Default compact variant (for backward compatibility)
  return (
    <Card
      onClick={handleClick}
      padding="md"
      radius="md"
      withBorder
      style={{
        backgroundColor: 'rgb(31, 41, 55)',
        borderColor: 'rgb(55, 65, 81)',
        cursor: 'pointer',
        transition: 'border-color 0.2s ease',
        contain: 'layout style paint',
      }}
      styles={{
        root: {
          '&:hover': {
            borderColor: 'rgb(59, 130, 246)',
          },
        },
      }}
    >
      <Stack gap="md">
        <div>
          <Text size="lg" fw={600} c="gray.1" mb="xs">
            {character.name}
          </Text>
          <Text size="sm" c="dimmed" lineClamp={2}>
            {character.description}
          </Text>
        </div>

        {character.tags && character.tags.length > 0 && (
          <Group gap={4}>
            {character.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="light" size="sm">
                {tag}
              </Badge>
            ))}
          </Group>
        )}

        <Group gap="xs">
          {onSelect && (
            <Button
              onClick={(e) => handleAction(e, () => onSelect(character))}
              variant="filled"
              size="sm"
              flex={1}
            >
              选择
            </Button>
          )}
          {onEdit && (
            <Button
              onClick={(e) => handleAction(e, () => onEdit(character))}
              variant="light"
              size="sm"
            >
              编辑
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={(e) => handleAction(e, () => onDelete(character.id))}
              variant="filled"
              color="red"
              size="sm"
            >
              删除
            </Button>
          )}
        </Group>
      </Stack>
    </Card>
  )
}

