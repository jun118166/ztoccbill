import { NextResponse } from 'next/server'
import { getOrderById, deleteOrder } from '@/lib/orders'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const order = await getOrderById(params.id)
    
    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 })
    }
    
    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: '获取订单失败' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await deleteOrder(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: '删除订单失败' }, { status: 500 })
  }
}
