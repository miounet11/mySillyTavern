/**
 * Retry Dialog Component
 * 显示超时或错误后的重试对话框
 */

'use client'

import { AlertTriangle, RotateCcw, X, Wifi, Server, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RetryDialogProps {
  isOpen: boolean
  errorType: 'timeout' | 'network' | 'server' | 'cancelled'
  errorMessage: string
  retryCount: number
  maxRetries: number
  onRetry: () => void
  onCancel: () => void
}

export default function RetryDialog({
  isOpen,
  errorType,
  errorMessage,
  retryCount,
  maxRetries,
  onRetry,
  onCancel,
}: RetryDialogProps) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (errorType) {
      case 'timeout':
        return <Clock className="w-12 h-12 text-amber-400" />
      case 'network':
        return <Wifi className="w-12 h-12 text-red-400" />
      case 'server':
        return <Server className="w-12 h-12 text-red-400" />
      default:
        return <AlertTriangle className="w-12 h-12 text-gray-400" />
    }
  }

  const getTitle = () => {
    switch (errorType) {
      case 'timeout':
        return '请求超时'
      case 'network':
        return '网络错误'
      case 'server':
        return '服务器错误'
      case 'cancelled':
        return '已取消'
      default:
        return '发生错误'
    }
  }

  const getDescription = () => {
    if (errorType === 'timeout') {
      return 'AI模型响应时间较长，请求已超时。您可以重试或取消本次生成。'
    }
    return errorMessage
  }

  const canRetry = retryCount < maxRetries && errorType !== 'cancelled'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-scale-in">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-4">
            {getIcon()}
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">{getTitle()}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            {getDescription()}
          </p>
        </div>

        {/* Retry Info */}
        {canRetry && retryCount > 0 && (
          <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300 text-center">
              已重试 {retryCount} 次，最多可重试 {maxRetries} 次
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {canRetry ? (
            <>
              <Button
                onClick={onCancel}
                variant="outline"
                className="flex-1 bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 border-gray-600 rounded-lg transition-all duration-200"
              >
                <X className="w-4 h-4 mr-2" />
                取消
              </Button>
              <Button
                onClick={onRetry}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                重试 {retryCount > 0 && `(${retryCount + 1}/${maxRetries})`}
              </Button>
            </>
          ) : (
            <Button
              onClick={onCancel}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg transition-all duration-200"
            >
              关闭
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}



