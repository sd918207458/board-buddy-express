import express from 'express'
import sequelize from '#configs/db.js'
import authenticate from '#middlewares/authenticate.js'

const router = express.Router()
const { PaymentMethod } = sequelize.models

// 新增付款方式的 API
router.post('/', authenticate, async (req, res) => {
  const {
    type,
    card_number,
    card_type,
    expiration_date,
    cardholder_name,
    onlinePaymentService,
  } = req.body
  const member_id = req.user.id

  try {
    // 信用卡付款邏輯
    if (type === 'creditCard') {
      if (!card_number || !card_type || !expiration_date || !cardholder_name) {
        return res.status(400).json({ message: '缺少信用卡信息' })
      }

      const maskedCardNumber = card_number.slice(-4)

      const newPaymentMethod = await PaymentMethod.create({
        member_id,
        card_number: maskedCardNumber,
        card_type,
        expiration_date,
        cardholder_name,
        payment_type: 'creditCard',
      })

      return res.status(201).json({ status: 'success', data: newPaymentMethod })
    }
    // 線上付款邏輯
    else if (type === 'onlinePayment') {
      if (!onlinePaymentService) {
        return res.status(400).json({ message: '缺少線上付款服務提供商' })
      }

      const newPaymentMethod = await PaymentMethod.create({
        member_id,
        payment_type: 'onlinePayment',
        online_payment_service: onlinePaymentService,
      })

      return res.status(201).json({ status: 'success', data: newPaymentMethod })
    }
    // 現金付款邏輯
    else if (type === 'cash') {
      const newPaymentMethod = await PaymentMethod.create({
        member_id,
        payment_type: 'cash',
      })

      return res.status(201).json({ status: 'success', data: newPaymentMethod })
    }
    // 其他未知付款方式
    else {
      return res.status(400).json({ message: '未知的付款方式' })
    }
  } catch (error) {
    console.error('新增付款方式失敗', error)
    return res.status(500).json({ message: '伺服器錯誤，請重試' })
  }
})

// 刪除付款方式的 API
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await PaymentMethod.destroy({ where: { payment_id: id } })

    if (!deleted) {
      return res.status(404).json({ message: '找不到付款方式' })
    }

    return res.status(200).json({
      status: 'success',
      message: '付款方式已成功刪除',
    })
  } catch (error) {
    console.error('刪除付款方式失敗', error)
    return res.status(500).json({ message: '伺服器錯誤，請重試' })
  }
})

// 設置預設付款方式的 API
router.put('/set-default/:id', authenticate, async (req, res) => {
  const { id } = req.params
  const member_id = req.user.id

  try {
    // 重設其他付款方式的 `is_default` 為 false
    await PaymentMethod.update({ is_default: false }, { where: { member_id } })

    // 設置當前付款方式為預設
    const [affectedRows] = await PaymentMethod.update(
      { is_default: true },
      { where: { payment_id: id, member_id } }
    )

    if (!affectedRows) {
      return res.status(400).json({ status: 'error', message: '更新失敗' })
    }

    return res.json({ status: 'success', message: '設置為預設付款方式' })
  } catch (error) {
    console.error('設置預設付款方式失敗:', error)
    return res.status(500).json({ status: 'error', message: '伺服器錯誤' })
  }
})

// 獲取所有付款方式
router.get('/', authenticate, async (req, res) => {
  const member_id = req.user.id
  try {
    const paymentMethods = await PaymentMethod.findAll({ where: { member_id } })
    if (paymentMethods.length === 0) {
      return res
        .status(404)
        .json({ status: 'error', message: '沒有找到付款方式' })
    }
    res.json({ status: 'success', data: paymentMethods })
  } catch (error) {
    console.error('獲取付款方式失敗:', error)
    res.status(500).json({ status: 'error', message: '伺服器錯誤' })
  }
})

// 獲取預設付款方式
router.get('/default', authenticate, async (req, res) => {
  const member_id = req.user.id
  try {
    const defaultPaymentMethod = await PaymentMethod.findOne({
      where: { member_id, is_default: true },
    })
    if (!defaultPaymentMethod) {
      return res
        .status(404)
        .json({ status: 'error', message: '未找到預設付款方式' })
    }
    res.json({ status: 'success', data: defaultPaymentMethod })
  } catch (error) {
    console.error('獲取預設付款方式失敗:', error)
    res.status(500).json({ status: 'error', message: '伺服器錯誤' })
  }
})

export default router
