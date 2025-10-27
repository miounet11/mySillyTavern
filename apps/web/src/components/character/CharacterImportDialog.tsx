import { useState } from 'react'
import { X, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

  if (!isOpen) return null

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (!f) return
    handleFile(f)
  }

  const handleFile = async (f: File) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[640px] rounded-xl border border-gray-700 bg-gray-900 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-gray-200">导入角色</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center bg-gray-800/40"
          >
            <div className="flex flex-col items-center gap-2 text-gray-300">
              <Upload className="w-6 h-6" />
              <p className="text-sm">拖拽文件至此，或</p>
              <label className="tavern-button-secondary inline-flex items-center gap-2 cursor-pointer">
                <input type="file" accept=".json,.png" className="hidden" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
                选择文件
              </label>
              <p className="text-xs text-gray-500">支持 Tavern 卡片 JSON 或 PNG</p>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-400">{error}</div>
          )}

          {isLoading && <div className="text-sm text-gray-400">解析中…</div>}

          {preview && (
            <div className="rounded-lg border border-gray-700 p-4 bg-gray-800/40">
              <h4 className="text-xs text-gray-400 mb-2">预览映射</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-500">名称</div>
                  <div className="text-gray-200">{preview.mapping.name}</div>
                </div>
                <div>
                  <div className="text-gray-500">问候</div>
                  <div className="text-gray-200 line-clamp-3">{preview.normalized.greeting || '-'}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-gray-500">场景</div>
                  <div className="text-gray-200 whitespace-pre-wrap">{preview.normalized.scenario || '-'}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-gray-500">人物设定</div>
                  <div className="text-gray-200 whitespace-pre-wrap">{preview.normalized.personality || '-'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-800 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="tavern-button-secondary">取消</Button>
          <Button onClick={handleImport} disabled={!file || isLoading} className="tavern-button">导入</Button>
        </div>
      </div>
    </div>
  )
}


