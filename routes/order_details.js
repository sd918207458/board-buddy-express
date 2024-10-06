// routes/orderDetails.js
import express from 'express'
const router = express.Router()
import authenticate from '#middlewares/authenticate.js'
import sequelize from '#configs/db.js'
const { OrderDetails, Orders } = sequelize.models // 引入相關模型

// 根據訂單 ID 獲取訂單詳情
router.get('/:order_id', authenticate, async (req, res) => {
  try {
    const orderId = req.params.order_id

    // 確認訂單是否屬於當前用戶
    const order = await Orders.findOne({
      where: { order_id: orderId, member_id: req.user.id },
    })

    if (!order) {
      return res.status(404).json({ message: '訂單不存在或無法訪問' })
    }

    // 獲取訂單的詳細資料
    const orderDetails = await OrderDetails.findAll({
      where: { order_id: orderId },
    })

    return res.status(200).json({ orderDetails })
  } catch (error) {
    console.error('獲取訂單詳情失敗:', error)
    return res.status(500).json({ message: '伺服器錯誤' })
  }
})

export default router
