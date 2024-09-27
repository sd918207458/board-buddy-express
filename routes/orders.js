import express from 'express'
const router = express.Router()
import sequelize from '#configs/db.js'
const { Order } = sequelize.models
import { Op } from 'sequelize'

// GET 獲得所有訂單資料，加入分頁與搜尋字串功能
router.get('/:activeTab', async (req, res) => {
  const {
    page = 1,
    perpage = 10,
    sort = 'order_date', // 修改排序欄位，使用 'order_date'
    order = 'asc',
    price_gte = 0,
    price_lte = 100000,
  } = req.query
  const { activeTab } = req.params

  // 檢查並生成各條件的 where 從句
  let conditions = {}
  if (activeTab !== 'all') {
    conditions.order_status = activeTab
  }
  if (price_gte) {
    conditions.amount = { [Op.gte]: Number(price_gte) }
  }
  if (price_lte) {
    conditions.amount = { ...conditions.amount, [Op.lte]: Number(price_lte) }
  }

  const offset = (Number(page) - 1) * Number(perpage)
  const limit = Number(perpage)
  const orderDirection = order || 'ASC'
  const orderClause = sort ? [[sort, orderDirection]] : [['order_id', 'ASC']]

  try {
    const { count, rows } = await Order.findAndCountAll({
      where: conditions,
      offset,
      limit,
      order: orderClause,
    })

    const pageCount = Math.ceil(count / Number(perpage)) || 0
    return res.json({
      status: 'success',
      data: {
        total: count,
        pageCount,
        page,
        perpage,
        orders: rows,
      },
    })
  } catch (e) {
    console.error('Error fetching orders: ', e.message, e.stack)
    return res.status(500).json({
      status: 'error',
      message: '無法查詢到訂單資料，查詢字串可能有誤',
      error: e.message,
    })
  }
})

// 獲得單筆訂單資料
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id)

  try {
    const order = await Order.findByPk(id)
    if (order) {
      return res.json({ status: 'success', data: { order } })
    }
    return res.status(404).json({ status: 'error', message: '訂單不存在' })
  } catch (e) {
    return res.status(500).json({
      status: 'error',
      message: '無法查詢到訂單',
      error: e.message,
    })
  }
})

export default router
