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

export async function getOrders(page: number = 1, limit: number = 20): Promise<{ orders: Order[]; total: number }> {
  const offset = (page - 1) * limit
  
  const orders = await sql`
    SELECT * FROM orders
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `
  
  const totalResult = await sql`
    SELECT COUNT(*) FROM orders
  `
  
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
