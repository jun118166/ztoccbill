import { sql } from './db'
import { Order, ParsedRow, SystemField } from './types'

export async function initTables() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_name TEXT NOT NULL,
        sender_phone TEXT NOT NULL,
        sender_address TEXT NOT NULL,
        receiver_name TEXT NOT NULL,
        receiver_phone TEXT NOT NULL,
        receiver_address TEXT NOT NULL,
        weight NUMERIC NOT NULL,
        quantity INTEGER NOT NULL,
        temperature TEXT DEFAULT '常温',
        notes TEXT DEFAULT '',
        external_order_no TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    await sql`
      CREATE TABLE IF NOT EXISTS templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        mappings JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
  } catch (error) {
    console.error('Table initialization error:', error)
  }
}

export async function createOrder(row: ParsedRow): Promise<Order> {
  const result = await sql`
    INSERT INTO orders (
      sender_name,
      sender_phone,
      sender_address,
      receiver_name,
      receiver_phone,
      receiver_address,
      weight,
      quantity,
      temperature,
      notes,
      external_order_no
    ) VALUES (
      ${String(row.data.sender_name || '')},
      ${String(row.data.sender_phone || '')},
      ${String(row.data.sender_address || '')},
      ${String(row.data.receiver_name || '')},
      ${String(row.data.receiver_phone || '')},
      ${String(row.data.receiver_address || '')},
      ${Number(row.data.weight || 0)},
      ${Number(row.data.quantity || 0)},
      ${String(row.data.temperature || '常温')},
      ${String(row.data.notes || '')},
      ${String(row.data.external_order_no || '')}
    ) RETURNING *
  `
  
  return result[0] as Order
}

export async function getOrders(
  page: number = 1, 
  limit: number = 20,
  filters: {
    externalOrderNo?: string
    receiverName?: string
    startDate?: string
    endDate?: string
  } = {}
): Promise<{ orders: Order[]; total: number }> {
  const offset = (page - 1) * limit
  
  if (!filters.externalOrderNo && !filters.receiverName && !filters.startDate && !filters.endDate) {
    const orders = await sql`
      SELECT * FROM orders
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    
    const totalResult = await sql`SELECT COUNT(*) FROM orders`
    
    return {
      orders: orders as Order[],
      total: Number(totalResult[0].count)
    }
  }
  
  let orders, totalResult
  
  if (filters.externalOrderNo && !filters.receiverName && !filters.startDate && !filters.endDate) {
    orders = await sql`
      SELECT * FROM orders
      WHERE external_order_no ILIKE ${'%' + filters.externalOrderNo + '%'}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    totalResult = await sql`SELECT COUNT(*) FROM orders WHERE external_order_no ILIKE ${'%' + filters.externalOrderNo + '%'}`
  } else if (!filters.externalOrderNo && filters.receiverName && !filters.startDate && !filters.endDate) {
    orders = await sql`
      SELECT * FROM orders
      WHERE receiver_name ILIKE ${'%' + filters.receiverName + '%'}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    totalResult = await sql`SELECT COUNT(*) FROM orders WHERE receiver_name ILIKE ${'%' + filters.receiverName + '%'}`
  } else if (!filters.externalOrderNo && !filters.receiverName && filters.startDate && !filters.endDate) {
    const startDate = new Date(filters.startDate).toISOString()
    orders = await sql`
      SELECT * FROM orders
      WHERE created_at >= ${startDate}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    totalResult = await sql`SELECT COUNT(*) FROM orders WHERE created_at >= ${startDate}`
  } else if (!filters.externalOrderNo && !filters.receiverName && !filters.startDate && filters.endDate) {
    const endDate = new Date(filters.endDate).toISOString()
    orders = await sql`
      SELECT * FROM orders
      WHERE created_at <= ${endDate}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    totalResult = await sql`SELECT COUNT(*) FROM orders WHERE created_at <= ${endDate}`
  } else if (filters.externalOrderNo && filters.receiverName && !filters.startDate && !filters.endDate) {
    orders = await sql`
      SELECT * FROM orders
      WHERE external_order_no ILIKE ${'%' + filters.externalOrderNo + '%'}
        AND receiver_name ILIKE ${'%' + filters.receiverName + '%'}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    totalResult = await sql`SELECT COUNT(*) FROM orders WHERE external_order_no ILIKE ${'%' + filters.externalOrderNo + '%'} AND receiver_name ILIKE ${'%' + filters.receiverName + '%'}`
  } else if (!filters.externalOrderNo && !filters.receiverName && filters.startDate && filters.endDate) {
    const startDate = new Date(filters.startDate).toISOString()
    const endDate = new Date(filters.endDate).toISOString()
    orders = await sql`
      SELECT * FROM orders
      WHERE created_at >= ${startDate} AND created_at <= ${endDate}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    totalResult = await sql`SELECT COUNT(*) FROM orders WHERE created_at >= ${startDate} AND created_at <= ${endDate}`
  } else {
    const externalOrderNo = filters.externalOrderNo ? `%${filters.externalOrderNo}%` : ''
    const receiverName = filters.receiverName ? `%${filters.receiverName}%` : ''
    const startDate = filters.startDate ? new Date(filters.startDate).toISOString() : '1970-01-01T00:00:00.000Z'
    const endDate = filters.endDate ? new Date(filters.endDate).toISOString() : '2100-01-01T00:00:00.000Z'
    
    orders = await sql`
      SELECT * FROM orders
      WHERE 
        (${filters.externalOrderNo ? 1 : 0} = 0 OR external_order_no ILIKE ${externalOrderNo})
        AND (${filters.receiverName ? 1 : 0} = 0 OR receiver_name ILIKE ${receiverName})
        AND (${filters.startDate ? 1 : 0} = 0 OR created_at >= ${startDate})
        AND (${filters.endDate ? 1 : 0} = 0 OR created_at <= ${endDate})
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    totalResult = await sql`
      SELECT COUNT(*) FROM orders
      WHERE 
        (${filters.externalOrderNo ? 1 : 0} = 0 OR external_order_no ILIKE ${externalOrderNo})
        AND (${filters.receiverName ? 1 : 0} = 0 OR receiver_name ILIKE ${receiverName})
        AND (${filters.startDate ? 1 : 0} = 0 OR created_at >= ${startDate})
        AND (${filters.endDate ? 1 : 0} = 0 OR created_at <= ${endDate})
    `
  }
  
  return {
    orders: orders as Order[],
    total: Number(totalResult[0].count)
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  const result = await sql`
    SELECT * FROM orders WHERE id = ${id}
  `
  
  return (result[0] as Order) || null
}

export async function deleteOrder(id: string): Promise<void> {
  await sql`
    DELETE FROM orders WHERE id = ${id}
  `
}

export async function initDatabase(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      sender_name TEXT NOT NULL,
      sender_phone TEXT NOT NULL,
      sender_address TEXT NOT NULL,
      receiver_name TEXT NOT NULL,
      receiver_phone TEXT NOT NULL,
      receiver_address TEXT NOT NULL,
      weight NUMERIC NOT NULL,
      quantity INTEGER NOT NULL,
      temperature TEXT DEFAULT '常温',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
  
  await sql`
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      mappings JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
}
