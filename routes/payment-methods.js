import express from 'express'
import sequelize from '#configs/db.js'
import authenticate from '#middlewares/authenticate.js'

const router = express.Router()
const { PaymentMethod } = sequelize.models

// 新增付款方式的 API
router.post('/', authenticate, async (req, res) => {
  try {
    const { card_number, card_type, expiration_date, cardholder_name } =
      req.body
    const member_id = req.user.member_id // 確保從 `req.user` 中獲得 `member_id`

    // 檢查必要資料是否存在
    if (!member_id) return res.status(400).json({ message: '會員 ID 缺少' })
    if (!card_number) return res.status(400).json({ message: '卡號缺少' })
    if (!card_type) return res.status(400).json({ message: '卡類型缺少' })
    if (!expiration_date) return res.status(400).json({ message: '到期日缺少' })
    if (!cardholder_name)
      return res.status(400).json({ message: '持卡人姓名缺少' })

    // 只保存卡號的最後四位
    const maskedCardNumber = card_number.slice(-4)

    // 創建新的付款方式
    const newPaymentMethod = await PaymentMethod.create({
      member_id,
      card_number: maskedCardNumber,
      card_type,
      expiration_date,
      cardholder_name,
    })

    return res.status(201).json({ status: 'success', data: newPaymentMethod })
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

// 編輯付款方式的 API
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params
    const { card_number, card_type, expiration_date, cardholder_name } =
      req.body

    // 只保存卡號的最後四位
    const maskedCardNumber = card_number.slice(-4)

    const [updated] = await PaymentMethod.update(
      {
        card_number: maskedCardNumber,
        card_type,
        expiration_date,
        cardholder_name,
      },
      { where: { payment_id: id } }
    )

    if (!updated) {
      return res.status(404).json({ message: '找不到付款方式' })
    }

    const updatedPaymentMethod = await PaymentMethod.findOne({
      where: { payment_id: id },
    })

    return res.status(200).json({
      status: 'success',
      data: updatedPaymentMethod,
    })
  } catch (error) {
    console.error('更新付款方式失敗', error)
    return res.status(500).json({ message: '伺服器錯誤，請重試' })
  }
})

// 設置預設付款方式的 API
router.put('/set-default/:id', authenticate, async (req, res) => {
  const { id } = req.params
  const member_id = req.user.member_id

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

// 獲取預設付款方式的 API
router.get('/default', authenticate, async (req, res) => {
  try {
    const member_id = req.user.member_id

    const defaultPaymentMethod = await PaymentMethod.findOne({
      where: { member_id, is_default: true },
    })

    if (!defaultPaymentMethod) {
      return res
        .status(404)
        .json({ status: 'error', message: '未找到預設付款方式' })
    }

    return res.json({ status: 'success', data: defaultPaymentMethod })
  } catch (error) {
    console.error('獲取預設付款方式失敗:', error)
    return res.status(500).json({ status: 'error', message: '伺服器錯誤' })
  }
})

export default router
