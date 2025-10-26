import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CharacterCard } from '../CharacterCard'

describe('CharacterCard', () => {
  const mockCharacter = {
    id: '1',
    name: 'Test Character',
    description: 'A test character description',
    avatar: '/test-avatar.png',
    tags: ['tag1', 'tag2'],
  }

  it('should render character information', () => {
    render(<CharacterCard character={mockCharacter} />)

    expect(screen.getByText('Test Character')).toBeInTheDocument()
    expect(screen.getByText('A test character description')).toBeInTheDocument()
  })

  it('should display character tags', () => {
    render(<CharacterCard character={mockCharacter} />)

    expect(screen.getByText('tag1')).toBeInTheDocument()
    expect(screen.getByText('tag2')).toBeInTheDocument()
  })

  it('should call onEdit when edit button is clicked', () => {
    const onEdit = vi.fn()
    render(<CharacterCard character={mockCharacter} onEdit={onEdit} />)

    const editButton = screen.getByRole('button', { name: /edit/i })
    fireEvent.click(editButton)

    expect(onEdit).toHaveBeenCalledWith(mockCharacter)
  })

  it('should call onDelete when delete button is clicked', () => {
    const onDelete = vi.fn()
    render(<CharacterCard character={mockCharacter} onDelete={onDelete} />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    expect(onDelete).toHaveBeenCalledWith(mockCharacter.id)
  })

  it('should display placeholder when no avatar is provided', () => {
    const characterWithoutAvatar = { ...mockCharacter, avatar: undefined }
    render(<CharacterCard character={characterWithoutAvatar} />)

    const avatarElement = screen.getByAltText('Test Character')
    expect(avatarElement).toHaveAttribute('src', expect.stringContaining('placeholder'))
  })
})

