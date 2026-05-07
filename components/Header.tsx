import { FileUp, List } from 'lucide-react'

interface HeaderProps {
  activeTab: 'import' | 'list'
  onTabChange: (tab: 'import' | 'list') => void
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[95vw] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <FileUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                订单批量导入系统
              </h1>
              <p className="text-sm text-gray-500">多模板自动识别 · 智能字段映射</p>
            </div>
          </div>
          <nav className="flex gap-2 bg-gray-50 rounded-xl p-1 border border-gray-200">
            <button
              onClick={() => onTabChange('import')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'import'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FileUp className="w-4 h-4" />
              导入订单
            </button>
            <button
              onClick={() => onTabChange('list')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'list'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
              订单列表
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
