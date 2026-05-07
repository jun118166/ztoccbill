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
            flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
            ${message.type === 'success' ? 'bg-white text-green-700 border border-green-200' : ''}
            ${message.type === 'error' ? 'bg-white text-red-700 border border-red-200' : ''}
            ${message.type === 'info' ? 'bg-white text-blue-700 border border-blue-200' : ''}
          `}
        >
          {message.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {message.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
          {message.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
          <span className="flex-1">{message.message}</span>
          <button
            onClick={() => onRemove(message.id)}
            className="hover:opacity-70 text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
