import { useEffect } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { ToastMessage } from '@/lib/types'

interface ToastProps {
  messages: ToastMessage[]
  onRemove: (id: string) => void
}

export function Toast({ messages, onRemove }: ToastProps) {
  useEffect(() => {
    messages.forEach(message => {
      const timer = setTimeout(() => {
        onRemove(message.id)
      }, 3000)
      return () => clearTimeout(timer)
    })
  }, [messages, onRemove])

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`
            toast-enter
            flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl backdrop-blur
            ${message.type === 'success' ? 'bg-green-900/80 text-green-200 border border-green-700 shadow-green-500/20' : ''}
            ${message.type === 'error' ? 'bg-red-900/80 text-red-200 border border-red-700 shadow-red-500/20' : ''}
            ${message.type === 'info' ? 'bg-blue-900/80 text-blue-200 border border-blue-700 shadow-blue-500/20' : ''}
          `}
        >
          {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {message.type === 'error' && <XCircle className="w-5 h-5" />}
          {message.type === 'info' && <Info className="w-5 h-5" />}
          <span className="flex-1">{message.message}</span>
          <button
            onClick={() => onRemove(message.id)}
            className="hover:opacity-70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
