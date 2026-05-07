import { useState, useEffect } from 'react'
import { List, ChevronLeft, ChevronRight, Trash2, Eye } from 'lucide-react'
import { Order } from '@/lib/types'
import { Toast } from './Toast'
import { ToastMessage } from '@/lib/types'

export function OrderList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const addToast = (type: ToastMessage['type'], message: string) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, type, message }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const fetchOrders = async (pageNum: number = 1) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/orders?page=${pageNum}&limit=20`)
      const result = await response.json()
      setOrders(result.orders || [])
      setTotal(result.total || 0)
      setPage(pageNum)
    } catch (error) {
      addToast('error', '获取订单列表失败')
      setOrders([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(page)
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个订单吗？')) return

    try {
      const response = await fetch(`/api/orders/${id}`, { method: 'DELETE' })
      if (response.ok) {
        addToast('success', '订单删除成功')
        fetchOrders(page)
      } else {
        addToast('error', '删除失败')
      }
    } catch (error) {
      addToast('error', '网络错误')
    }
  }

  const handlePrevPage = () => {
    if (page > 1) {
      fetchOrders(page - 1)
    }
  }

  const handleNextPage = () => {
    if (page * 20 < total) {
      fetchOrders(page + 1)
    }
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleString('zh-CN')
  }

  return (
    <div className="max-w-[95vw] mx-auto p-4">
      <Toast messages={toasts} onRemove={removeToast} />

      <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 shadow-xl shadow-blue-900/10 p-6 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
            <List className="w-6 h-6 text-blue-400" />
            已导入订单列表
          </h2>
          <span className="text-sm text-gray-400">共 {total} 条记录</span>
        </div>
      </div>

      {loading ? (
        <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 shadow-xl shadow-blue-900/10 p-12 text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">加载中...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 shadow-xl shadow-blue-900/10 p-12 text-center">
          <List className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">暂无订单记录</p>
        </div>
      ) : (
        <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 shadow-xl shadow-blue-900/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-800 to-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">订单编号</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">寄件人</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">收件人</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">重量/件数</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">温度</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">创建时间</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">操作</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-t border-gray-700 hover:bg-blue-900/20">
                    <td className="px-4 py-3 text-sm text-blue-400 font-mono">{order.id.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="text-gray-200">{order.sender_name}</div>
                      <div className="text-gray-400 text-xs">{order.sender_phone}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="text-gray-200">{order.receiver_name}</div>
                      <div className="text-gray-400 text-xs">{order.receiver_phone}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {order.weight}kg / {order.quantity}件
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        order.temperature === '冷藏' ? 'bg-blue-900/50 text-blue-300 border border-blue-700' :
                        order.temperature === '冷冻' ? 'bg-purple-900/50 text-purple-300 border border-purple-700' :
                        'bg-green-900/50 text-green-300 border border-green-700'
                      }`}>
                        {order.temperature}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-blue-400 hover:text-blue-300"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="text-red-400 hover:text-red-300"
                          title="删除订单"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 bg-gray-800/80 border-t border-gray-700 flex items-center justify-between">
            <span className="text-sm text-gray-400">
              第 {page} 页，共 {Math.ceil(total / 20)} 页
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextPage}
                disabled={page * 20 >= total}
                className="p-1.5 rounded-lg hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedOrder(null)}>
          <div className="bg-gray-800/95 backdrop-blur rounded-xl border border-gray-700 shadow-2xl shadow-blue-900/30 p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">订单详情</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">订单编号</span>
                <span className="font-mono text-blue-400">{selectedOrder.id}</span>
              </div>
              <div className="border-t border-gray-700 pt-3">
                <div className="font-medium text-gray-200 mb-2">寄件人信息</div>
                <div className="flex justify-between">
                  <span className="text-gray-400">姓名</span>
                  <span className="text-gray-200">{selectedOrder.sender_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">电话</span>
                  <span className="text-gray-200">{selectedOrder.sender_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">地址</span>
                  <span className="text-gray-200">{selectedOrder.sender_address}</span>
                </div>
              </div>
              <div className="border-t border-gray-700 pt-3">
                <div className="font-medium text-gray-200 mb-2">收件人信息</div>
                <div className="flex justify-between">
                  <span className="text-gray-400">姓名</span>
                  <span className="text-gray-200">{selectedOrder.receiver_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">电话</span>
                  <span className="text-gray-200">{selectedOrder.receiver_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">地址</span>
                  <span className="text-gray-200">{selectedOrder.receiver_address}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">重量</span>
                <span className="text-gray-200">{selectedOrder.weight}kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">件数</span>
                <span className="text-gray-200">{selectedOrder.quantity}件</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">温度要求</span>
                <span className="text-gray-200">{selectedOrder.temperature}</span>
              </div>
              {selectedOrder.notes && (
                <div className="flex justify-between">
                  <span className="text-gray-400">备注</span>
                  <span className="text-gray-200">{selectedOrder.notes}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">创建时间</span>
                <span className="text-gray-200">{formatDate(selectedOrder.created_at)}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-6 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-blue-500/30"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
