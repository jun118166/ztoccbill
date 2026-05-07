export interface Order {
  id: string
  sender_name: string
  sender_phone: string
  sender_address: string
  receiver_name: string
  receiver_phone: string
  receiver_address: string
  weight: number
  quantity: number
  temperature: string
  notes: string
  external_order_no: string
  created_at: Date
}

export interface ExcelRow {
  [key: string]: string | number | boolean | undefined
}

export interface FieldMapping {
  excelColumn: string
  systemField: SystemField
}

export type SystemField = 
  | 'sender_name'
  | 'sender_phone'
  | 'sender_address'
  | 'receiver_name'
  | 'receiver_phone'
  | 'receiver_address'
  | 'weight'
  | 'quantity'
  | 'temperature'
  | 'notes'
  | 'external_order_no'

export interface SystemFieldInfo {
  field: SystemField
  label: string
  required: boolean
  type: 'string' | 'number' | 'enum'
  enumValues?: string[]
  pattern?: RegExp
}

export interface ParsedRow {
  rowIndex: number
  data: Partial<Record<SystemField, string | number>>
  errors: FieldError[]
}

export interface FieldError {
  field: SystemField
  message: string
}

export interface TemplateMapping {
  id: string
  name: string
  mappings: FieldMapping[]
  created_at: Date
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

export const SYSTEM_FIELDS: SystemFieldInfo[] = [
  { field: 'sender_name', label: '寄件人姓名', required: true, type: 'string' },
  { field: 'sender_phone', label: '寄件人电话', required: true, type: 'string', pattern: /^1[3-9]\d{9}$/ },
  { field: 'sender_address', label: '寄件人地址', required: true, type: 'string' },
  { field: 'receiver_name', label: '收件人姓名', required: true, type: 'string' },
  { field: 'receiver_phone', label: '收件人电话', required: true, type: 'string', pattern: /^1[3-9]\d{9}$/ },
  { field: 'receiver_address', label: '收件人地址', required: true, type: 'string' },
  { field: 'weight', label: '重量(kg)', required: true, type: 'number' },
  { field: 'quantity', label: '件数', required: true, type: 'number' },
  { field: 'temperature', label: '温度要求', required: false, type: 'enum', enumValues: ['常温', '冷藏', '冷冻'] },
  { field: 'notes', label: '备注', required: false, type: 'string' },
  { field: 'external_order_no', label: '外部订单号', required: false, type: 'string' },
]

export const TEMPERATURE_OPTIONS = ['常温', '冷藏', '冷冻']
