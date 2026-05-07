# Excel订单导入系统

基于 Next.js + React + TypeScript 开发的多模板Excel自动导入下单录单系统。

## 功能特性

- 支持 xls/xlsx 文件解析，兼容1000条以上数据
- 多模板适配：自动识别不同列名/列顺序的Excel
- 手动字段映射功能，支持模板记忆
- 在线预览与编辑，支持Tab键切换单元格
- 实时数据校验，错误单元格标红显示
- 订单提交与数据库存储
- 订单列表查询与管理

## 技术栈

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS 3
- xlsx (Excel处理)
- Neon PostgreSQL (数据库)
- Lucide React (图标)

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置数据库

1. 在 [Neon](https://neon.tech/) 创建数据库
2. 复制 `.env.example` 为 `.env`
3. 设置 `DATABASE_URL` 为你的 Neon 数据库连接字符串

### 初始化数据库

```bash
npx tsx lib/orders.ts
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 使用说明

1. **上传文件**：拖拽或点击上传Excel文件
2. **字段映射**：系统自动识别字段映射，可手动调整
3. **保存模板**：输入模板名称保存映射配置，下次导入自动复用
4. **预览数据**：查看导入的数据，支持直接编辑
5. **提交订单**：验证无误后提交订单数据

## API 接口

- `GET /api/orders` - 查询订单列表
- `POST /api/orders` - 批量创建订单
- `GET /api/orders/:id` - 查询单个订单
- `DELETE /api/orders/:id` - 删除订单

## 支持的字段

| 系统字段 | 标签 | 必填 | 类型 |
|---------|------|------|------|
| sender_name | 寄件人姓名 | 是 | 字符串 |
| sender_phone | 寄件人电话 | 是 | 字符串(手机号格式) |
| sender_address | 寄件人地址 | 是 | 字符串 |
| receiver_name | 收件人姓名 | 是 | 字符串 |
| receiver_phone | 收件人电话 | 是 | 字符串(手机号格式) |
| receiver_address | 收件人地址 | 是 | 字符串 |
| weight | 重量(kg) | 是 | 数字(正数) |
| quantity | 件数 | 是 | 数字(正整数) |
| temperature | 温度要求 | 否 | 枚举(常温/冷藏/冷冻) |
| notes | 备注 | 否 | 字符串 |
