import { NextResponse } from 'next/server'
import { createOrder, getOrders, initTables } from '@/lib/orders'
import { ParsedRow } from '@/lib/types'

export async function GET(request: Request) {
  try {
    await initTables()
    
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    
    const { orders, total } = await getOrders(page, limit)
    
    return NextResponse.json({ orders, total })
  } catch (error) {
    console.error('获取订单失败:', error)
    return NextResponse.json({ error: '获取订单失败' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await initTables()
    
    const { rows } = await request.json() as { rows: ParsedRow[] }
    
    const results = []
    for (const row of rows) {
      const order = await createOrder(row)
      results.push(order)
    }
    
    return NextResponse.json({ success: true, count: results.length })
  } catch (error) {
    console.error('创建订单失败:', error)
    return NextResponse.json({ error: '创建订单失败' }, { status: 500 })
  }
}
