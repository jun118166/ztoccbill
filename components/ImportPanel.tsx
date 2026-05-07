import { useCallback, useMemo, useState } from 'react'
import { Download, FileText, RefreshCw, Send, Upload } from 'lucide-react'
import { applyMappings, autoDetectMappings, exportToExcel, parseExcel, validateRow } from '@/lib/excelParser'
import { DataTable } from './DataTable'
import { FieldMapping } from './FieldMapping'
import { ProgressBar } from './ProgressBar'
import { Toast } from './Toast'
import { ExcelRow, FieldMapping as FieldMappingType, ParsedRow, SYSTEM_FIELDS, ToastMessage } from '@/lib/types'

export function ImportPanel() {
  const [file, setFile] = useState<File | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<ExcelRow[]>([])
  const [mappings, setMappings] = useState<FieldMappingType[]>([])
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitProgress, setSubmitProgress] = useState({ current: 0, total: 0 })
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload')

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, type, message }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const missingRequiredMappings = useMemo(
    () =>
      SYSTEM_FIELDS.filter(
        field => field.required && !mappings.some(mapping => mapping.systemField === field.field)
      ),
    [mappings]
  )

  const resetState = () => {
    setFile(null)
    setHeaders([])
    setRawRows([])
    setMappings([])
    setParsedRows([])
    setStep('upload')
  }

  const validateExcelFile = (selectedFile: File) => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase()
    if (ext !== 'xls' && ext !== 'xlsx') {
      addToast('error', '请选择 Excel 文件（.xls 或 .xlsx）')
      return false
    }

    return true
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile || !validateExcelFile(selectedFile)) return
    setFile(selectedFile)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (!droppedFile || !validateExcelFile(droppedFile)) return
    setFile(droppedFile)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleParse = async () => {
    if (!file) return

    setIsParsing(true)
    try {
      const { headers: parsedHeaders, rows } = await parseExcel(file)

      if (rows.length === 0) {
        addToast('error', 'Excel 文件为空')
        return
      }

      const detectedMappings = autoDetectMappings(parsedHeaders)
      const mappedRows = applyMappings(rows, detectedMappings)

      setHeaders(parsedHeaders)
      setRawRows(rows)
      setMappings(detectedMappings)
      setParsedRows(mappedRows)
      setStep('mapping')

      if (detectedMappings.length === 0) {
        addToast('error', '未识别到任何字段映射，请检查 Excel 表头')
      } else if (
        SYSTEM_FIELDS.some(
          field =>
            field.required &&
            !detectedMappings.some(mapping => mapping.systemField === field.field)
        )
      ) {
        addToast('info', '已完成自动映射，但仍有必填字段未匹配，请检查表头命名')
      } else {
        addToast('success', 'Excel 解析成功，字段已自动映射')
      }
    } catch (error) {
      addToast('error', (error as Error).message)
    } finally {
      setIsParsing(false)
    }
  }

  const handlePreview = () => {
    if (mappings.length === 0) {
      addToast('error', '未识别到任何字段映射，请检查 Excel 表头')
      return
    }

    if (missingRequiredMappings.length > 0) {
      addToast(
        'error',
        `以下必填字段未自动匹配：${missingRequiredMappings.map(field => field.label).join('、')}`
      )
      return
    }

    setStep('preview')
  }

  const handleSubmit = async () => {
    const validRows = parsedRows.filter(row => validateRow(row).length === 0)

    if (validRows.length === 0) {
      addToast('error', '没有可提交的有效订单数据')
      return
    }

    setIsSubmitting(true)
    setSubmitProgress({ current: 0, total: validRows.length })

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: validRows })
      })

      const result = await response.json()

      if (response.ok) {
        addToast('success', `成功提交 ${result.count} 条订单`)
        resetState()
      } else {
        addToast('error', result.error || '提交失败')
      }
    } catch {
      addToast('error', '网络错误，提交失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExport = () => {
    exportToExcel(parsedRows)
    addToast('success', '数据已导出')
  }

  const hasErrors = parsedRows.some(row => validateRow(row).length > 0)

  return (
    <div className="max-w-[95vw] mx-auto p-4">
      <Toast messages={toasts} onRemove={removeToast} />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Excel订单导入
        </h2>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setStep('upload')}
            className={`px-5 py-2.5 rounded-lg transition-all ${
              step === 'upload'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            1. 上传文件
          </button>
          <button
            onClick={() => step !== 'upload' && setStep('mapping')}
            disabled={step === 'upload'}
            className={`px-5 py-2.5 rounded-lg transition-all ${
              step === 'mapping'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50`}
          >
            2. 字段映射
          </button>
          <button
            onClick={() => step === 'preview' && setStep('preview')}
            disabled={step !== 'preview'}
            className={`px-5 py-2.5 rounded-lg transition-all ${
              step === 'preview'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50`}
          >
            3. 数据预览
          </button>
        </div>
      </div>

      {step === 'upload' && (
        <div
          className="bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 transition-all p-12 text-center cursor-pointer shadow-sm"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input
            id="file-upload"
            type="file"
            accept=".xls,.xlsx"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="w-16 h-16 mx-auto text-blue-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {file ? `已选择：${file.name}` : '拖拽 Excel 文件到此处或点击上传'}
          </h3>
          <p className="text-sm text-gray-500">支持 .xls 和 .xlsx 格式</p>

          <a
            href="/api/download-template"
            download="template1-standard.xlsx"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-4 py-2 mt-4 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
          >
            <Download className="w-4 h-4" />
            下载标准模板
          </a>

          {file && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleParse()
              }}
              disabled={isParsing}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all flex items-center gap-2 mx-auto disabled:opacity-50 shadow-lg shadow-blue-500/30"
            >
              {isParsing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  解析中...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  开始解析
                </>
              )}
            </button>
          )}
        </div>
      )}

      {step === 'mapping' && (
        <div className="space-y-6">
          <FieldMapping headers={headers} mappings={mappings} />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setStep('upload')}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
            >
              返回
            </button>
            <button
              onClick={handlePreview}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-500 hover:to-cyan-500 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30"
            >
              <FileText className="w-4 h-4" />
              预览数据
            </button>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-6">
          <DataTable rows={parsedRows} onRowsChange={setParsedRows} />

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-4 text-sm text-gray-700">
                <span>总条数：{parsedRows.length}</span>
                {hasErrors && <span className="text-red-500">存在错误，请修正后再提交</span>}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('mapping')}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                >
                  返回映射
                </button>
                <button
                  onClick={handleExport}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-500 hover:to-emerald-500 transition-all flex items-center gap-2 shadow-lg shadow-green-500/30"
                >
                  <Download className="w-4 h-4" />
                  导出Excel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={hasErrors || isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-500 hover:to-cyan-500 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/30"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      提交中...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      提交订单
                    </>
                  )}
                </button>
              </div>
            </div>

            {isSubmitting && (
              <div className="mt-4">
                <ProgressBar
                  current={submitProgress.current}
                  total={submitProgress.total}
                  label="提交进度"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
