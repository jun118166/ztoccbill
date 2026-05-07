'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { ImportPanel } from '@/components/ImportPanel'
import { OrderList } from '@/components/OrderList'
import './globals.css'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'import' | 'list'>('import')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="py-6">
        {activeTab === 'import' ? <ImportPanel /> : <OrderList />}
      </main>
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          Excel订单导入系统 - 支持多模板自动识别
        </div>
      </footer>
    </div>
  )
}
