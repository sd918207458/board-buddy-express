import express from 'express'
import authenticate from '#middlewares/authenticate.js'
import sequelize from '#configs/db.js'
import 'dotenv/config.js'

const callback_url = process.env.SHIP_711_STORE_CALLBACK_URL
const { Address } = sequelize.models

const router = express.Router()

// Helper function for error handling
const handleError = (res, error, message = '伺服器錯誤') => {
  console.error(message, error)
  return res.status(500).json({ message })
}

// Helper function to validate address based on delivery method
const validateAddress = (deliveryMethod, data) => {
  if (deliveryMethod === 'homeDelivery') {
    const { username, phone, city, street } = data
    if (!username || !phone || !city || !street) {
      return '缺少必要欄位：宅配地址的詳細資訊'
    }
  } else if (deliveryMethod === 'convenienceStore') {
    const { storeType } = data
    if (!storeType) {
      return '缺少必要欄位：超商取貨的商店類型'
    }
  } else {
    return '無效的配送方式'
  }
  return null
}

// POST /711 callback
router.post('/711', function (req, res) {
  let searchParams = new URLSearchParams(req.body)
  res.redirect(callback_url + '?' + searchParams.toString())
})

// Add new shipping address
router.post('/addresses', authenticate, async (req, res) => {
  console.log('接收到的資料:', req.body) // 確認 storeName 和 storeAddress 是否存在
  const memberId = req.user.member_id || req.user.id
  const {
    deliveryMethod,
    username,
    phone,
    city,
    area,
    street,
    detailed_address,
    isDefault,
    storeType,
    storeName, // 新增的字段
    storeAddress, // 新增的字段
  } = req.body

  // Validate based on delivery method
  const validationError = validateAddress(deliveryMethod, req.body)
  if (validationError) {
    return res.status(400).json({ message: validationError })
  }

  try {
    if (isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { member_id: memberId } }
      )
    }

    const newAddress = await Address.create({
      member_id: memberId,
      deliveryMethod,
      username,
      phone,
      city,
      area,
      street,
      detailed_address,
      isDefault,
      storeType,
      storeName, // 儲存 storeName
      storeAddress, // 儲存 storeAddress
    })

    return res.status(201).json({ message: '地址新增成功', data: newAddress })
  } catch (error) {
    console.error('新增地址失敗:', error)
    return handleError(res, error, '新增地址失敗')
  }
})

// Update shipping address
router.put('/addresses/:id', authenticate, async (req, res) => {
  const memberId = req.user.member_id || req.user.id
  const addressId = req.params.id
  const {
    deliveryMethod,
    username,
    phone,
    city,
    area,
    street,
    detailed_address,
    isDefault,
    storeType,
    storeName, // 新增的字段
    storeAddress, // 新增的字段
  } = req.body

  const validationError = validateAddress(deliveryMethod, req.body)
  if (validationError) {
    return res.status(400).json({ message: validationError })
  }

  try {
    const addressToUpdate = await Address.findOne({
      where: { address_id: addressId, member_id: memberId },
    })

    if (!addressToUpdate) {
      return res.status(404).json({ message: '地址不存在或無法存取' })
    }

    if (isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { member_id: memberId } }
      )
    }

    await addressToUpdate.update({
      deliveryMethod,
      username,
      phone,
      city,
      area,
      street,
      detailed_address,
      isDefault,
      storeType,
      storeName, // 更新 storeName
      storeAddress, // 更新 storeAddress
    })

    return res
      .status(200)
      .json({ message: '地址更新成功', data: addressToUpdate })
  } catch (error) {
    console.error('更新地址失敗:', error)
    return handleError(res, error, '更新地址失敗')
  }
})

// Delete shipping address
router.delete('/addresses/:id', authenticate, async (req, res) => {
  const memberId = req.user.member_id || req.user.id
  const addressId = req.params.id

  try {
    const addressToDelete = await Address.findOne({
      where: { address_id: addressId, member_id: memberId },
    })

    if (!addressToDelete) {
      return res.status(404).json({ message: '地址不存在或無法存取' })
    }

    await addressToDelete.destroy()
    return res.status(200).json({ message: '地址刪除成功' })
  } catch (error) {
    return handleError(res, error, '刪除地址失敗')
  }
})

// Set default shipping address
router.put('/addresses/:id/default', authenticate, async (req, res) => {
  const memberId = req.user.member_id || req.user.id
  const addressId = req.params.id

  try {
    await Address.update(
      { isDefault: false },
      { where: { member_id: memberId } }
    )

    const defaultAddress = await Address.findOne({
      where: { address_id: addressId, member_id: memberId },
    })

    if (!defaultAddress) {
      return res.status(404).json({ message: '地址不存在或無法存取' })
    }

    await defaultAddress.update({ isDefault: true })
    return res
      .status(200)
      .json({ message: '預設地址設定成功', data: defaultAddress })
  } catch (error) {
    return handleError(res, error, '設定預設地址失敗')
  }
})

// Get all addresses
router.get('/addresses', authenticate, async (req, res) => {
  const memberId = req.user.member_id || req.user.id

  try {
    const addresses = await Address.findAll({ where: { member_id: memberId } })
    return res.status(200).json({ data: addresses })
  } catch (error) {
    return handleError(res, error, '無法獲取地址')
  }
})

export default router
