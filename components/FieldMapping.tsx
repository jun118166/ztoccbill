import { Save } from 'lucide-react'
import { useMemo, useState } from 'react'
import { FieldMapping as FieldMappingType, SYSTEM_FIELDS } from '@/lib/types'

interface FieldMappingProps {
  headers: string[]
  mappings: FieldMappingType[]
}

export function FieldMapping({ headers, mappings }: FieldMappingProps) {
  const [templateName, setTemplateName] = useState('')

  const mappedExcelColumns = useMemo(
    () => new Set(mappings.map(mapping => mapping.excelColumn)),
    [mappings]
  )

  const unmappedHeaders = useMemo(
    () => headers.filter(header => !mappedExcelColumns.has(header)),
    [headers, mappedExcelColumns]
  )

  const missingSystemFields = useMemo(
    () => SYSTEM_FIELDS.filter(
      field => !mappings.some(mapping => mapping.systemField === field.field)
    ),
    [mappings]
  )

  const saveTemplate = () => {
    if (!templateName.trim()) return

    localStorage.setItem(`template_${templateName}`, JSON.stringify(mappings))
    alert(`模板 "${templateName}" 已保存`)
    setTemplateName('')
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">字段映射</h3>
          <p className="text-sm text-gray-500 mt-1">
            系统已根据 Excel 列名自动匹配字段，无需人工添加。
          </p>
        </div>
        <div className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 border border-blue-200">
          已识别 {mappings.length} / {SYSTEM_FIELDS.length}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="输入模板名称保存"
            className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />
          <button
            onClick={saveTemplate}
            disabled={!templateName.trim() || mappings.length === 0}
            className="px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-500 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shadow-lg shadow-green-500/30"
          >
            <Save className="w-4 h-4" />
            保存模板
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Excel列名</th>
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">系统字段</th>
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">状态</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((mapping) => {
              const fieldInfo = SYSTEM_FIELDS.find(field => field.field === mapping.systemField)

              return (
                <tr key={`${mapping.excelColumn}-${mapping.systemField}`} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="border-r border-gray-100 px-4 py-2 text-sm text-gray-900">
                    {mapping.excelColumn}
                  </td>
                  <td className="border-r border-gray-100 px-4 py-2 text-sm text-gray-900">
                    {fieldInfo?.label || mapping.systemField}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-green-700 border border-green-200">
                      已自动匹配
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {mappings.length === 0 && (
        <div className="text-center text-amber-600 py-8">
          未识别到可用字段映射，请检查 Excel 表头命名。
        </div>
      )}

      {(missingSystemFields.length > 0 || unmappedHeaders.length > 0) && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h4 className="text-sm font-medium text-amber-800 mb-2">未匹配的系统字段</h4>
            <div className="flex flex-wrap gap-2">
              {missingSystemFields.map(field => (
                <span
                  key={field.field}
                  className={`rounded-full px-2 py-1 text-xs ${
                    field.required
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {field.label}
                  {field.required ? '（必填）' : '（选填）'}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">未使用的 Excel 列</h4>
            <div className="flex flex-wrap gap-2">
              {unmappedHeaders.length > 0 ? (
                unmappedHeaders.map(header => (
                  <span
                    key={header}
                    className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 border border-gray-200"
                  >
                    {header}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">全部列均已使用</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
