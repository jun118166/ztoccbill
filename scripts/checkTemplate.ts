const XLSX = require('xlsx')
const fs = require('fs')
const path = require('path')

const templateDir = '../exceltemplate'

fs.readdirSync(templateDir).forEach(file => {
  if (file.endsWith('.xlsx')) {
    const filePath = path.join(__dirname, templateDir, file)
    console.log(`\n=== ${file} ===`)
    
    try {
      const workbook = XLSX.readFile(filePath)
      console.log(`Sheet数量: ${workbook.SheetNames.length}`)
      
      workbook.SheetNames.forEach(sheetName => {
        console.log(`\nSheet: ${sheetName}`)
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        const headers = worksheet ? Object.keys(XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] || {}) : []
        
        console.log(`表头: ${headers.join(', ')}`)
        console.log(`数据行数: ${jsonData.length}`)
        
        if (jsonData.length > 0) {
          console.log(`第一行数据:`, JSON.stringify(jsonData[0], null, 2))
        }
      })
    } catch (error) {
      console.error(`读取失败: ${error.message}`)
    }
  }
})
