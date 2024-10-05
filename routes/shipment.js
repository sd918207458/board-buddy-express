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
// POST
router.post('/711', function (req, res, next) {
  //console.log(req.body)
  let searchParams = new URLSearchParams(req.body)
  res.redirect(callback_url + '?' + searchParams.toString())
})
// Add new shipping address
router.post('/addresses', authenticate, async (req, res) => {
  const memberId = req.user.member_id || req.user.id
  const {
    username,
    phone,
    city,
    area,
    street,
    detailed_address,
    isDefault,
    storeType,
    storeName, // Store Name selected by user
    storeAddress, // Store Address selected by user
  } = req.body

  if (!username || !phone || !city || !street) {
    return res.status(400).json({ message: '缺少必要欄位' })
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
      username,
      phone,
      city,
      area,
      street,
      detailed_address,
      isDefault,
      storeType, // 7-11
      storeName, // Store Name selected by user
      storeAddress, // Store Address selected by user
    })

    return res.status(201).json({ message: '地址新增成功', data: newAddress })
  } catch (error) {
    return handleError(res, error, '新增地址失敗')
  }
})

// Update shipping address
router.put('/addresses/:id', authenticate, async (req, res) => {
  const memberId = req.user.member_id || req.user.id
  const addressId = req.params.id
  const {
    username,
    phone,
    city,
    area,
    street,
    detailed_address,
    isDefault,
    storeType,
    storeName,
    storeAddress,
  } = req.body

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
      username,
      phone,
      city,
      area,
      street,
      detailed_address,
      isDefault,
      storeType,
      storeName,
      storeAddress,
    })

    return res
      .status(200)
      .json({ message: '地址更新成功', data: addressToUpdate })
  } catch (error) {
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
