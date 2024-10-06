import express from 'express'
const router = express.Router()

// 檢查空物件, 轉換 req.params 為數字
import { getIdParam } from '#db-helpers/db-tool.js'

// 資料庫使用
import sequelize from '#configs/db.js'
const { Request } = sequelize.models // 引入 Request 模型

// 處理退換貨請求的 API

// GET - 獲取所有退換貨申請
router.get('/', async (req, res) => {
  const requests = await Request.findAll({ logging: console.log })
  return res.json({ status: 'success', data: { requests } })
})

// GET - 根據 ID 獲取單筆退換貨申請
router.get('/:id', async (req, res) => {
  const request_id = getIdParam(req)

  const request = await Request.findByPk(request_id)

  if (!request) {
    return res.status(404).json({ status: 'error', message: '申請不存在' })
  }

  return res.json({ status: 'success', data: { request } })
})

// POST - 創建退換貨申請
router.post('/create', async (req, res) => {
  try {
    const {
      order_id,
      member_id,
      order_date,
      product_name,
      product_model,
      product_quantity,
      reason,
    } = req.body

    // 創建新的退貨申請
    const newRequest = await Request.create({
      order_id,
      member_id,
      order_date,
      product_name,
      product_model,
      product_quantity,
      reason,
      status: 'requested',
    })

    res.status(201).json({
      message: '退換貨申請已成功提交！',
      data: newRequest,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: '提交失敗，請稍後再試。' })
  }
})

// PUT - 更新退換貨申請狀態
router.put('/:id/status', async (req, res) => {
  const request_id = getIdParam(req)
  const { status } = req.body

  const [affectedRows] = await Request.update(
    { status },
    { where: { request_id } }
  )

  if (!affectedRows) {
    return res.json({ status: 'error', message: '更新失敗或沒有資料被更新' })
  }

  return res.json({ status: 'success', message: '申請狀態已成功更新' })
})

// DELETE - 刪除退換貨申請
router.delete('/:id', async (req, res) => {
  const request_id = getIdParam(req)

  const affectedRows = await Request.destroy({ where: { request_id } })

  if (!affectedRows) {
    return res.json({ status: 'error', message: '刪除失敗，申請不存在' })
  }

  return res.json({ status: 'success', message: '申請已成功刪除' })
})

export default router
