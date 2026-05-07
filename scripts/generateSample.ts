const XLSX = require('xlsx')

const sampleData = [
  {
    '寄件人姓名': '张三',
    '寄件人电话': '13812345678',
    '寄件人地址': '北京市朝阳区xxx街道xxx号',
    '收件人姓名': '李四',
    '收件人电话': '13987654321',
    '收件人地址': '上海市浦东新区xxx路xxx号',
    '重量': 5.5,
    '件数': 2,
    '温度要求': '冷藏',
    '备注': '易碎品，请小心轻放'
  },
  {
    '寄件人姓名': '王五',
    '寄件人电话': '13711112222',
    '寄件人地址': '广州市天河区xxx大道xxx号',
    '收件人姓名': '赵六',
    '收件人电话': '13633334444',
    '收件人地址': '深圳市南山区xxx路xxx号',
    '重量': 10.2,
    '件数': 5,
    '温度要求': '常温',
    '备注': ''
  },
  {
    '寄件人姓名': '孙七',
    '寄件人电话': '13555556666',
    '寄件人地址': '成都市锦江区xxx街xxx号',
    '收件人姓名': '周八',
    '收件人电话': '13477778888',
    '收件人地址': '杭州市西湖区xxx路xxx号',
    '重量': 3.8,
    '件数': 1,
    '温度要求': '冷冻',
    '备注': '生鲜食品'
  }
]

const worksheet = XLSX.utils.json_to_sheet(sampleData)
const workbook = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(workbook, worksheet, '订单数据')

XLSX.writeFile(workbook, 'sample_orders.xlsx')
console.log('示例Excel文件已生成: sample_orders.xlsx')
