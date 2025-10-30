import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'

interface ModelNotSetModalProps {
  open: boolean
  onClose: () => void
}

export function ModelNotSetModal({ open, onClose }: ModelNotSetModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>请先设置模型</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-gray-300 space-y-4">
          <p>
            在使用导出/删除/重生成等功能前，请先在设置中配置一个可用的 AI 模型（提供商、模型名称、API Key 或本地模型）。
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="tavern-button-secondary">稍后再说</Button>
            <Button onClick={() => { onClose(); try { window.dispatchEvent(new CustomEvent('open-settings')) } catch {} }} className="tavern-button">
              <Settings className="w-4 h-4 mr-2" />
              去设置
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ModelNotSetModal


