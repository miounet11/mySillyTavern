'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Sparkles, 
  Save, 
  Upload,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { TextInput, Select, MultiSelect, Stack, Group, Badge } from '@mantine/core'

interface GenerateFormProps {
  onGenerated?: (character: any) => void
}

export default function CharacterGenerateForm({ onGenerated }: GenerateFormProps) {
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [llmConfigId, setLlmConfigId] = useState('')
  
  const [categories, setCategories] = useState<any[]>([])
  const [llmConfigs, setLlmConfigs] = useState<any[]>([])
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCharacter, setGeneratedCharacter] = useState<any>(null)
  const [isPublishing, setIsPublishing] = useState(false)

  // 加载分类和LLM配置
  useEffect(() => {
    loadCategories()
    loadLLMConfigs()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/config/categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const loadLLMConfigs = async () => {
    try {
      const response = await fetch('/api/admin/config/llm')
      const data = await response.json()
      setLlmConfigs(data.configs || [])
      
      // 自动选择第一个配置
      if (data.configs && data.configs.length > 0) {
        setLlmConfigId(data.configs[0].id)
      }
    } catch (error) {
      console.error('Error loading LLM configs:', error)
    }
  }

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('请输入角色描述')
      return
    }

    if (!llmConfigId) {
      toast.error('请先在设置中配置LLM')
      return
    }

    setIsGenerating(true)
    setGeneratedCharacter(null)

    try {
      const response = await fetch('/api/admin/characters/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description,
          category: category || undefined,
          tags: tags.length > 0 ? tags : undefined,
          llmConfigId
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('角色生成成功！')
        setGeneratedCharacter(data.character)
        onGenerated?.(data.character)
      } else {
        toast.error(data.error || '生成失败')
        if (data.rawContent) {
          console.error('Raw LLM response:', data.rawContent)
        }
      }
    } catch (error) {
      console.error('Generate error:', error)
      toast.error('生成失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePublish = async () => {
    if (!generatedCharacter) return

    setIsPublishing(true)

    try {
      const response = await fetch('/api/admin/characters/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          characterId: generatedCharacter.id,
          author: 'AI Generated'
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('已发布到社区！')
        // 重置表单
        setDescription('')
        setCategory('')
        setTags([])
        setGeneratedCharacter(null)
      } else {
        toast.error(data.error || '发布失败')
      }
    } catch (error) {
      console.error('Publish error:', error)
      toast.error('发布失败，请重试')
    } finally {
      setIsPublishing(false)
    }
  }

  const categoryOptions = categories.map(cat => ({
    value: cat.name,
    label: `${cat.icon || ''} ${cat.name}`
  }))

  const llmConfigOptions = llmConfigs.map(config => ({
    value: config.id,
    label: `${config.name} (${config.provider}/${config.model})`
  }))

  // 常用标签建议
  const tagSuggestions = [
    '可爱', '冷酷', '温柔', '智慧', '傲娇', '治愈',
    '猫娘', '御姐', '萝莉', '助手', '导师', '伙伴'
  ]

  return (
    <div className="space-y-6">
      {/* 生成表单 */}
      <Stack gap="md">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            角色描述 *
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="例如：一个温柔可爱的猫娘，喜欢撒娇，性格温顺乖巧"
            className="glass-input min-h-[120px]"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {description.length}/500 字符
          </p>
        </div>

        <Group grow>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              分类
            </label>
            <Select
              value={category}
              onChange={(value) => setCategory(value || '')}
              placeholder="选择分类（可选）"
              data={categoryOptions}
              searchable
              clearable
              styles={{
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              LLM配置 *
            </label>
            <Select
              value={llmConfigId}
              onChange={(value) => setLlmConfigId(value || '')}
              placeholder="选择LLM配置"
              data={llmConfigOptions}
              disabled={llmConfigs.length === 0}
              styles={{
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }
              }}
            />
            {llmConfigs.length === 0 && (
              <p className="text-xs text-amber-400 mt-1">
                请先在"设置"中配置LLM
              </p>
            )}
          </div>
        </Group>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            标签（可多选）
          </label>
          <MultiSelect
            value={tags}
            onChange={(values) => {
              // 处理标签创建：如果输入的值不在建议列表中，自动添加
              setTags(values)
            }}
            data={tagSuggestions.map(tag => ({ value: tag, label: tag }))}
            placeholder="选择或输入标签"
            searchable
            styles={{
              input: {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white'
              }
            }}
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !description || !llmConfigId}
          className="w-full gradient-btn-teal h-12 text-base font-medium"
        >
          {isGenerating ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>生成中，请稍候...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>生成角色卡</span>
            </div>
          )}
        </Button>
      </Stack>

      {/* 生成结果预览 */}
      {generatedCharacter && (
        <div className="glass-card p-6 rounded-xl border border-teal-500/30 bg-teal-500/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-teal-400 flex items-center gap-2">
              <Check className="w-5 h-5" />
              生成成功
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">名称</p>
              <p className="text-lg font-semibold text-white">{generatedCharacter.name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">描述</p>
              <p className="text-gray-300">{generatedCharacter.description}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">个性</p>
              <p className="text-gray-300">{generatedCharacter.personality}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">开场白</p>
              <p className="text-gray-300 italic">"{generatedCharacter.firstMessage}"</p>
            </div>

            {generatedCharacter.tags && generatedCharacter.tags.length > 0 && (
              <div>
                <p className="text-sm text-gray-400 mb-2">标签</p>
                <div className="flex flex-wrap gap-2">
                  {generatedCharacter.tags.map((tag: string) => (
                    <Badge key={tag} variant="light" color="teal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-white/10">
              <Button
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex-1 gradient-btn-teal h-11"
              >
                {isPublishing ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>发布中...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>发布到社区</span>
                  </div>
                )}
              </Button>

              <Button
                onClick={() => {
                  setGeneratedCharacter(null)
                  setDescription('')
                }}
                variant="outline"
                className="glass-light border-white/20"
              >
                重新生成
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

