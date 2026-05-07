import * as XLSX from 'xlsx'
import { ExcelRow, SystemField, SYSTEM_FIELDS, FieldMapping, ParsedRow, FieldError } from './types'

const FIELD_ALIASES: Record<SystemField, string[]> = {
  sender_name: ['寄件人姓名', '寄件人', '发件人姓名', '发件人', '寄件姓名', '发货人', '寄件人名称', '发件人名称', '发件姓名', '发件名称', '寄件方', '发件方', '寄件人姓名 ', '寄件人 ', '发件人姓名 ', '发件人 ', 'sender', 'sender_name', 'senderName', 'from_name', 'fromName', 'shipper', 'shipper_name', 'Shipper', 'From', 'FROM_NAME'],
  sender_phone: ['寄件人电话', '寄件人手机', '发件人电话', '发件人手机', '寄件电话', '发货人电话', '寄件人联系电话', '发件人联系电话', '寄件人手机号', '发件人手机号', '寄件电话 ', '寄件人电话 ', '发件人电话 ', 'sender_phone', 'senderPhone', 'sender_tel', 'from_phone', 'fromPhone', 'shipper_phone', 'shipperPhone', 'shipper_tel', 'SenderTel', 'SenderPhone', 'FromPhone', 'FROM_PHONE', 'SHPR_PHONE', '发货电话'],
  sender_address: ['寄件人地址', '寄件地址', '发件人地址', '发货地址', '寄件地址详情', '发件地址详情', '寄件人详细地址', '发件人详细地址', '寄件地址 ', '寄件人地址 ', '发件人地址 ', 'sender_address', 'senderAddress', 'from_address', 'fromAddress', 'shipper_address', 'shipperAddress', 'SenderAddress', 'FromAddress', 'FROM_ADDRESS', 'SHPR_ADDRESS', '发货地址'],
  receiver_name: ['收件人姓名', '收件人', '收货人姓名', '收货人', '收件姓名', '收件人名称', '收货人名称', '收件方', '收货方', '收件人姓名 ', '收件人 ', '收货人姓名 ', '收货人 ', 'receiver', 'receiver_name', 'receiverName', 'to_name', 'toName', 'consignee', 'consignee_name', 'Receiver', 'To', 'TO_NAME', 'CNEE_NAME'],
  receiver_phone: ['收件人电话', '收件人手机', '收货人电话', '收货人手机', '收件电话', '收件人联系电话', '收货人联系电话', '收件人手机号', '收货人手机号', '收件电话 ', '收件人电话 ', '收货人电话 ', 'receiver_phone', 'receiverPhone', 'receiver_tel', 'to_phone', 'toPhone', 'consignee_phone', 'consigneePhone', 'consignee_tel', 'ReceiverTel', 'ReceiverPhone', 'ToPhone', 'TO_PHONE', 'CNEE_PHONE', '收货电话'],
  receiver_address: ['收件人地址', '收件地址', '收货人地址', '收货地址', '收件地址详情', '收货地址详情', '收件人详细地址', '收货人详细地址', '收件地址 ', '收件人地址 ', '收货人地址 ', 'receiver_address', 'receiverAddress', 'to_address', 'toAddress', 'consignee_address', 'consigneeAddress', 'delivery_address', 'ReceiverAddress', 'ToAddress', 'TO_ADDRESS', 'CNEE_ADDRESS', 'DELIVERY_ADDRESS', '收货地址'],
  weight: ['重量', '重量(kg)', '重量kg', '货品重量', '货物重量', '包裹重量', '货物净重', '毛重', '净重', '重量 ', '重量(kg) ', 'weight', 'weight_kg', 'weightkg', 'goods_weight', 'pkg_weight', 'GROSS_WEIGHT', 'NET_WEIGHT', 'WEIGHT_KG', 'WT'],
  quantity: ['件数', '数量', '货品数量', '货物数量', '个数', '包裹数量', '箱数', '总件数', '总数量', '件数 ', '数量 ', 'quantity', 'qty', 'pieces', 'amount', 'number', 'pcs', 'PKG_COUNT', 'QTY', 'NUMBER_OF_PIECES'],
  temperature: ['温度要求', '温度', '温控要求', '冷藏要求', '冷冻要求', '温控类型', '温度类型', '温度设置', '温区', '温层', '温度要求 ', '温度 ', '温层 ', 'temperature', 'temp', 'temp_requirement', 'temperature_requirement', 'TEMP_TYPE', 'TEMPERATURE', 'COLD_CHAIN'],
  notes: ['备注', '备注信息', '说明', '备注内容', '特殊要求', '备注说明', '附加说明', '备注栏', '备注 ', '备注信息 ', 'notes', 'note', 'remark', 'remarks', 'comments', 'comment', 'REMARKS', 'NOTES', 'SPECIAL_INSTRUCTIONS', '附言'],
  external_order_no: ['外部订单号', '外部编码', 'Ref Code', '客户单号', '外部单号', '订单编号', '订单号', '客户订单号', '客户编码', '外部订单号 ', '外部编码 ', 'Ref Code ', '客户单号 ', 'external_order_no', 'externalOrderNo', 'ref_code', 'refCode', 'customer_order_no', 'customerOrderNo', 'order_ref', 'ORDER_REF', 'REF_CODE', 'EXTERNAL_ORDER_NO', '外部订单号'],
}

function findHeaderRow(rawData: unknown[][]): number {
  let bestRowIndex = 0
  let bestMatchCount = 0
  
  const allAliases = Object.values(FIELD_ALIASES).flat()
  
  for (let i = 0; i < Math.min(rawData.length, 5); i++) {
    const row = rawData[i]
    if (!row || row.length === 0) continue
    
    let matchCount = 0
    for (const cell of row) {
      const cellStr = String(cell ?? '').toLowerCase().trim().replace(/\s+/g, '')
      if (cellStr) {
        for (const alias of allAliases) {
          const aliasClean = alias.toLowerCase().trim().replace(/\s+/g, '')
          if (cellStr.includes(aliasClean) || aliasClean.includes(cellStr)) {
            matchCount++
            break
          }
        }
      }
    }
    
    if (matchCount > bestMatchCount) {
      bestMatchCount = matchCount
      bestRowIndex = i
    }
  }
  
  return bestRowIndex
}

function analyzeSheet(sheet: XLSX.WorkSheet): { headerRowIndex: number; matchCount: number; rawData: unknown[][] } {
  const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][]
  
  if (!rawData || rawData.length === 0) {
    return { headerRowIndex: -1, matchCount: 0, rawData }
  }
  
  const headerRowIndex = findHeaderRow(rawData)
  const headerRow = rawData[headerRowIndex]
  
  if (!headerRow) {
    return { headerRowIndex: -1, matchCount: 0, rawData }
  }
  
  const allAliases = Object.values(FIELD_ALIASES).flat()
  let matchCount = 0
  
  for (const cell of headerRow) {
    const cellStr = String(cell ?? '').toLowerCase().trim().replace(/\s+/g, '')
    if (cellStr) {
      for (const alias of allAliases) {
        const aliasClean = alias.toLowerCase().trim().replace(/\s+/g, '')
        if (cellStr.includes(aliasClean) || aliasClean.includes(cellStr)) {
          matchCount++
          break
        }
      }
    }
  }
  
  return { headerRowIndex, matchCount, rawData }
}

export function parseExcel(file: File): Promise<{ headers: string[]; rows: ExcelRow[]; sheetName: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result as ArrayBuffer
        const workbook = XLSX.read(data, { type: 'array' })
        
        if (workbook.SheetNames.length === 0) {
          reject(new Error('Excel文件没有工作表'))
          return
        }
        
        let bestSheetIndex = 0
        let bestMatchCount = -1
        let bestHeaderRowIndex = 0
        let bestRawData: unknown[][] = []
        
        for (let i = 0; i < workbook.SheetNames.length; i++) {
          const sheet = workbook.Sheets[workbook.SheetNames[i]]
          const { headerRowIndex, matchCount, rawData } = analyzeSheet(sheet)
          
          if (matchCount > bestMatchCount) {
            bestMatchCount = matchCount
            bestSheetIndex = i
            bestHeaderRowIndex = headerRowIndex
            bestRawData = rawData
          }
        }
        
        const selectedSheetName = workbook.SheetNames[bestSheetIndex]
        
        if (!bestRawData || bestRawData.length === 0) {
          reject(new Error('Excel文件为空或没有数据'))
          return
        }
        
        const headerRow = bestRawData[bestHeaderRowIndex]
        const headers = headerRow.map((h: unknown, index: number) => {
          const header = String(h ?? `列${index + 1}`).trim()
          return header || `列${index + 1}`
        })
        
        const dataRows = bestRawData.slice(bestHeaderRowIndex + 1) as unknown[][]
        const rows: ExcelRow[] = dataRows.map((row) => {
          const rowObj: ExcelRow = {}
          row.forEach((value, index) => {
            const header = headers[index]
            rowObj[header] = value as string | number | boolean | undefined
          })
          return rowObj
        }).filter(row => Object.values(row).some(v => v !== undefined && v !== null && String(v).trim() !== ''))
        
        resolve({ headers, rows, sheetName: selectedSheetName })
      } catch (error) {
        reject(new Error('Excel解析失败，请确保文件格式正确'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

const FALLBACK_POSITION_MAPPING: Record<number, SystemField> = {
  0: 'sender_name',
  1: 'sender_phone',
  2: 'sender_address',
  3: 'receiver_name',
  4: 'receiver_phone',
  5: 'receiver_address',
  6: 'weight',
  7: 'quantity',
  8: 'temperature',
  9: 'notes',
  10: 'external_order_no',
}

export function autoDetectMappings(headers: string[]): FieldMapping[] {
  const mappings: FieldMapping[] = []
  const usedHeaders = new Set<string>()
  
  for (const systemField of SYSTEM_FIELDS) {
    const matchedHeader = headers.find(header => {
      if (usedHeaders.has(header)) return false
      
      const headerClean = header.toLowerCase().trim().replace(/\s+/g, '').replace(/[()（）]/g, '')
      return FIELD_ALIASES[systemField.field].some(alias => {
        const aliasClean = alias.toLowerCase().trim().replace(/\s+/g, '').replace(/[()（）]/g, '')
        return headerClean.includes(aliasClean) || aliasClean.includes(headerClean)
      })
    })
    
    if (matchedHeader) {
      mappings.push({
        excelColumn: matchedHeader,
        systemField: systemField.field
      })
      usedHeaders.add(matchedHeader)
    }
  }
  
  if (mappings.length === 0 && headers.length > 0) {
    for (let i = 0; i < headers.length && i < 10; i++) {
      const header = headers[i]
      if (usedHeaders.has(header)) continue
      
      const systemField = FALLBACK_POSITION_MAPPING[i]
      if (systemField) {
        mappings.push({
          excelColumn: header,
          systemField
        })
        usedHeaders.add(header)
      }
    }
  }
  
  return mappings
}

export function applyMappings(rows: ExcelRow[], mappings: FieldMapping[]): ParsedRow[] {
  return rows.map((row, index) => {
    const data: Partial<Record<SystemField, string | number>> = {}
    const errors: FieldError[] = []
    
    for (const mapping of mappings) {
      const rawValue = row[mapping.excelColumn]
      if (rawValue !== undefined && rawValue !== null) {
        const fieldInfo = SYSTEM_FIELDS.find(f => f.field === mapping.systemField)
        
        if (fieldInfo?.type === 'number') {
          const numValue = Number(rawValue)
          if (!isNaN(numValue)) {
            data[mapping.systemField] = numValue
          } else {
            errors.push({
              field: mapping.systemField,
              message: `必须是数字类型`
            })
          }
        } else {
          data[mapping.systemField] = String(rawValue).trim()
        }
      }
    }
    
    return { rowIndex: index + 2, data, errors }
  })
}

export function validateRow(row: ParsedRow): FieldError[] {
  const errors: FieldError[] = [...row.errors]
  
  for (const fieldInfo of SYSTEM_FIELDS) {
    const value = row.data[fieldInfo.field]
    
    if (fieldInfo.required && (!value || String(value).trim() === '')) {
      errors.push({
        field: fieldInfo.field,
        message: `${fieldInfo.label}不能为空`
      })
      continue
    }
    
    if (!value) continue
    
    if (fieldInfo.pattern && typeof value === 'string') {
      if (!fieldInfo.pattern.test(value)) {
        errors.push({
          field: fieldInfo.field,
          message: `${fieldInfo.label}格式不正确`
        })
      }
    }
    
    if (fieldInfo.type === 'number') {
      const numValue = typeof value === 'number' ? value : Number(value)
      if (isNaN(numValue) || numValue <= 0) {
        errors.push({
          field: fieldInfo.field,
          message: `${fieldInfo.label}必须是正整数`
        })
      }
    }
    
    if (fieldInfo.type === 'enum' && fieldInfo.enumValues) {
      if (!fieldInfo.enumValues.includes(String(value))) {
        errors.push({
          field: fieldInfo.field,
          message: `${fieldInfo.label}必须是: ${fieldInfo.enumValues.join('/')}`
        })
      }
    }
  }
  
  return errors
}

export function exportToExcel(rows: ParsedRow[], filename: string = '订单数据.xlsx') {
  const headers = SYSTEM_FIELDS.map(f => f.label)
  const data = rows.map(row => {
    return SYSTEM_FIELDS.map(field => {
      const value = row.data[field.field]
      return value !== undefined ? value : ''
    })
  })
  
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '订单数据')
  
  XLSX.writeFile(workbook, filename)
}
