import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    const templatePath = join(process.cwd(), 'exceltemplate', 'template1-standard.xlsx')
    const fileBuffer = readFileSync(templatePath)
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Disposition': 'attachment; filename="template1-standard.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
  } catch (error) {
    console.error('下载模板失败:', error)
    return NextResponse.json({ error: '模板文件不存在' }, { status: 404 })
  }
}
