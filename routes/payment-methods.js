import express from 'express'
import authenticate from '#middlewares/authenticate.js'
import sequelize from '#configs/db.js'
const { PaymentMethod, Coupon } = sequelize.models

const router = express.Router()

// Helper function for error handling
const handleError = (res, error, message = '伺服器錯誤') => {
  console.error(message, error)
  return res.status(500).json({ message })
}

// 通用的資源未找到回應
const handleNotFound = (res, resource = '資源') => {
  return res.status(404).json({ message: `${resource} 找不到` })
}

// --- Payment Method Routes ---

// Add new payment method
router.post('/', authenticate, async (req, res) => {
  const { type, card_number, card_type, expiration_date } = req.body
  const member_id = req.user.member_id || req.user.id

  try {
    let newPaymentMethod
    if (type === 'creditCard') {
      if (!card_number || !card_type || !expiration_date) {
        return res.status(400).json({ message: '缺少信用卡信息' })
      }
      const maskedCardNumber = card_number.slice(-4)
      newPaymentMethod = await PaymentMethod.create({
        member_id,
        card_number: maskedCardNumber,
        card_type,
        expiration_date,
        payment_type: 'creditCard',
      })
    } else if (type === 'cash') {
      newPaymentMethod = await PaymentMethod.create({
        member_id,
        payment_type: 'cash',
      })
    } else {
      return res.status(400).json({ message: '未知的付款方式' })
    }

    return res.status(201).json({ status: 'success', data: newPaymentMethod })
  } catch (error) {
    return handleError(res, error, '新增付款方式失敗')
  }
})

// Delete payment method
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params

  try {
    const deleted = await PaymentMethod.destroy({ where: { payment_id: id } })

    if (!deleted) {
      return handleNotFound(res, '付款方式')
    }

    return res
      .status(200)
      .json({ status: 'success', message: '付款方式已成功刪除' })
  } catch (error) {
    return handleError(res, error, '刪除付款方式失敗')
  }
})

// Update payment method
router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params
  const {
    type,
    card_number,
    card_type,
    expiration_date,

    is_default,
  } = req.body
  const member_id = req.user.member_id || req.user.id

  console.log('Updating payment method with id:', id)
  console.log('Member ID:', member_id) // 檢查使用者的 member_id

  try {
    const paymentMethod = await PaymentMethod.findOne({
      where: { payment_id: id, member_id }, // 確保只找到當前使用者的付款方式
    })

    if (!paymentMethod) {
      console.log('Payment method not found for id:', id) // 如果沒找到
      return handleNotFound(res, '付款方式')
    }

    const updateData = { is_default }
    if (type === 'creditCard') {
      if (!card_number || !card_type || !expiration_date) {
        return res.status(400).json({ message: '缺少信用卡信息' })
      }
      if (!/^\d{16}$/.test(card_number)) {
        return res
          .status(400)
          .json({ message: '信用卡號碼格式錯誤，請輸入16位數字' })
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiration_date)) {
        return res
          .status(400)
          .json({ message: '到期日格式錯誤，請按照MM/YY格式' })
      }
      const maskedCardNumber = card_number.slice(-4)
      updateData.card_number = maskedCardNumber
      updateData.card_type = card_type
      updateData.expiration_date = expiration_date
      updateData.payment_type = 'creditCard'
    } else if (type === 'cash') {
      updateData.payment_type = 'cash'
    } else {
      return res.status(400).json({ message: '未知的付款方式' })
    }

    await paymentMethod.update(updateData)
    return res.json({ status: 'success', data: paymentMethod })
  } catch (error) {
    console.error('Error updating payment method:', error)
    return handleError(res, error, '更新付款方式失敗')
  }
})

// Set default payment method
router.put('/set-default/:id', authenticate, async (req, res) => {
  const { id } = req.params
  const member_id = req.user.member_id || req.user.id

  try {
    const currentDefault = await PaymentMethod.findOne({
      where: { member_id, is_default: true },
    })

    if (currentDefault && currentDefault.payment_id !== parseInt(id, 10)) {
      await currentDefault.update({ is_default: false })
    }

    const updated = await PaymentMethod.update(
      { is_default: true },
      { where: { payment_id: id, member_id } }
    )

    if (!updated) {
      return res.status(400).json({ status: 'error', message: '更新失敗' })
    }

    return res.json({ status: 'success', message: '設置為預設付款方式' })
  } catch (error) {
    return handleError(res, error, '設置預設付款方式失敗')
  }
})

// Get all payment methods
router.get('/', authenticate, async (req, res) => {
  const member_id = req.user.member_id || req.user.id

  console.log('Fetching payment methods for member ID:', member_id)

  try {
    const paymentMethods = await PaymentMethod.findAll({ where: { member_id } })
    if (paymentMethods.length === 0) {
      return handleNotFound(res, '付款方式')
    }
    return res.json({ status: 'success', data: paymentMethods })
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return handleError(res, error, '獲取付款方式失敗')
  }
})

// Get default payment method
router.get('/default', authenticate, async (req, res) => {
  const member_id = req.user.member_id || req.user.id

  console.log('Fetching default payment method for member ID:', member_id)

  try {
    const defaultPaymentMethod = await PaymentMethod.findOne({
      where: { member_id, is_default: true },
    })

    if (!defaultPaymentMethod) {
      return handleNotFound(res, '預設付款方式')
    }

    return res.json({ status: 'success', data: defaultPaymentMethod })
  } catch (error) {
    console.error('Error fetching default payment method:', error)
    return handleError(res, error, '獲取預設付款方式失敗')
  }
})

// Get all coupons for the user
router.get('/coupons', authenticate, async (req, res) => {
  const member_id = req.user.member_id

  try {
    const coupons = await Coupon.findAll({ where: { member_id } })
    return res.status(200).json({ status: 'success', data: coupons })
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching coupons' })
  }
})

export default router
