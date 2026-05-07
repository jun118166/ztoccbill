import { useState, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { ParsedRow, SystemField, SYSTEM_FIELDS } from '@/lib/types';

interface DataTableProps {
  rows: ParsedRow[];
  onRowsChange: (rows: ParsedRow[]) => void;
}

export function DataTable({ rows, onRowsChange }: DataTableProps) {
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; field: SystemField; } | null>(null);

  const getFieldValue = (row: ParsedRow, field: SystemField): string => {
    const value = row.data[field];
    return value !== undefined ? String(value) : '';
  };

  const handleDeleteRow = (rowIndex: number) => {
    const newRows = rows.filter(row => row.rowIndex !== rowIndex);
    const renumberedRows = newRows.map((row, index) => ({ ...row, rowIndex: index + 2 }));
    onRowsChange(renumberedRows);
  };

  const handleCellChange = (rowIndex: number, field: SystemField, value: string) => {
    const newRows = [...rows];
    const row = newRows.find(r => r.rowIndex === rowIndex);
    if (row) {
      const fieldInfo = SYSTEM_FIELDS.find(f => f.field === field);
      if (fieldInfo?.type === 'number') {
        row.data[field] = value ? Number(value) : undefined;
      } else {
        row.data[field] = value;
      }
    }
    onRowsChange(newRows);
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      setEditingCell(null);
    }
  }, []);

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 shadow-xl shadow-blue-900/10 overflow-hidden">
      <div className="p-4 bg-gray-800/80 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">数据预览</h3>
          <div className="flex gap-4 text-sm">
            <span className="text-gray-300">总条数: <strong className="text-white">{rows.length}</strong></span>
          </div>
        </div>
      </div>

      <div className="overflow-auto max-h-[600px]">
        <table className="w-full border-collapse min-w-[1400px]">
          <thead>
            <tr className="bg-gradient-to-r from-gray-800 to-gray-900 sticky top-0 z-10">
              <th className="border border-gray-700 px-4 py-3 text-left text-sm font-medium w-16 text-gray-200">行号</th>
              {SYSTEM_FIELDS.map(field => (
                <th key={field.field} className="border border-gray-700 px-4 py-3 text-left text-sm font-medium text-gray-200 min-w-[140px]">
                  {field.label} {field.required ? <span className="text-red-400">*</span> : ''}
                </th>
              ))}
              <th className="border border-gray-700 px-4 py-3 text-center text-sm font-medium text-gray-200 w-24">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.rowIndex} className="border-b border-gray-700/50 hover:bg-blue-900/30">
                <td className="border-r border-gray-700 px-4 py-2 text-sm font-medium bg-gray-800 w-16 text-gray-300">{row.rowIndex}</td>
                {SYSTEM_FIELDS.map(field => {
                  const isEditing = editingCell?.rowIndex === row.rowIndex && editingCell?.field === field.field;
                  return (
                    <td key={field.field} className="px-4 py-2 border-r border-gray-700/50 last:border-r-0">
                      {isEditing ? (
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          value={getFieldValue(row, field.field)}
                          onChange={(e) => handleCellChange(row.rowIndex, field.field, e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoComplete="off"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingCell({ rowIndex: row.rowIndex, field: field.field })}
                          className="w-full px-2 py-1 text-left text-sm truncate text-gray-300 hover:bg-gray-700/50 rounded-lg"
                        >
                          {getFieldValue(row, field.field) || '点击编辑'}
                        </button>
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleDeleteRow(row.rowIndex)}
                    className="flex items-center justify-center w-full h-full p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-all"
                    title="删除此行"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
