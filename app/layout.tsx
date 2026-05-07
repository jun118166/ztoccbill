import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Excel订单导入系统',
  description: '多模板Excel自动导入下单录单系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-900">
        {children}
      </body>
    </html>
  )
}
