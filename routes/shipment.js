import express from 'express'
import authenticate from '#middlewares/authenticate.js'
import sequelize from '#configs/db.js' // 從 sequelize 中獲取資料庫
const { Address } = sequelize.models // 確保 Address 模型正確設置

const router = express.Router()

// 新增送貨地址
router.post('/addresses', authenticate, async (req, res) => {
  try {
    const {
      username,
      phone,
      city,
      area,
      street,
      detailedAddress,
      isDefault,
      deliveryMethod,
      storeType,
      storeName,
    } = req.body

    // 驗證必要字段
    if (!username || !phone || !city || !street) {
      return res.status(400).json({ message: '缺少必要欄位' })
    }

    // 創建新的地址
    const newAddress = await Address.create({
      member_id: req.user.id,
      username,
      phone,
      city,
      area,
      street,
      detailedAddress,
      isDefault,
      deliveryMethod,
      storeType,
      storeName,
    })

    return res.status(201).json({
      message: '地址新增成功',
      data: newAddress,
    })
  } catch (error) {
    console.error('新增地址失敗:', error)
    return res.status(500).json({ message: '伺服器錯誤，無法新增地址' })
  }
})

// 更新送貨地址
router.put('/addresses/:id', authenticate, async (req, res) => {
  try {
    const {
      username,
      phone,
      city,
      area,
      street,
      detailedAddress,
      isDefault,
      deliveryMethod,
      storeType,
      storeName,
    } = req.body
    const addressId = req.params.id

    const addressToUpdate = await Address.findOne({
      where: { id: addressId, member_id: req.user.id },
    })

    if (!addressToUpdate) {
      return res.status(404).json({ message: '地址不存在或無法存取' })
    }

    // 只更新提供的字段
    await addressToUpdate.update({
      ...(username && { username }),
      ...(phone && { phone }),
      ...(city && { city }),
      ...(area && { area }),
      ...(street && { street }),
      ...(detailedAddress && { detailedAddress }),
      ...(isDefault !== undefined && { isDefault }),
      ...(deliveryMethod && { deliveryMethod }),
      ...(storeType && { storeType }),
      ...(storeName && { storeName }),
    })

    return res.status(200).json({
      message: '地址更新成功',
      data: addressToUpdate,
    })
  } catch (error) {
    console.error('更新地址失敗:', error)
    return res.status(500).json({ message: '伺服器錯誤，無法更新地址' })
  }
})

// 刪除送貨地址
router.delete('/addresses/:id', authenticate, async (req, res) => {
  try {
    const addressId = req.params.id

    const addressToDelete = await Address.findOne({
      where: { id: addressId, member_id: req.user.id },
    })

    if (!addressToDelete) {
      return res.status(404).json({ message: '地址不存在或無法存取' })
    }

    await addressToDelete.destroy()
    return res.status(200).json({ message: '地址刪除成功' })
  } catch (error) {
    console.error('刪除地址失敗:', error)
    return res.status(500).json({ message: '伺服器錯誤，無法刪除地址' })
  }
})

// 設定預設送貨地址
router.put('/addresses/:id/default', authenticate, async (req, res) => {
  try {
    const addressId = req.params.id

    // 獲取當前的預設地址
    const currentDefaultAddress = await Address.findOne({
      where: { member_id: req.user.id, isDefault: true },
    })

    // 如果當前預設地址與要更新的地址不同，則進行更新
    if (currentDefaultAddress && currentDefaultAddress.id !== addressId) {
      await currentDefaultAddress.update({ isDefault: false })
    }

    const defaultAddress = await Address.findOne({
      where: { id: addressId, member_id: req.user.id },
    })

    if (!defaultAddress) {
      return res.status(404).json({ message: '地址不存在或無法存取' })
    }

    await defaultAddress.update({ isDefault: true })
    return res.status(200).json({
      message: '預設地址設定成功',
      data: defaultAddress,
    })
  } catch (error) {
    console.error('設定預設地址失敗:', error)
    return res.status(500).json({ message: '伺服器錯誤，無法設置預設地址' })
  }
})

// 獲取所有地址
router.get('/addresses', authenticate, async (req, res) => {
  try {
    const addresses = await Address.findAll({
      where: { member_id: req.user.id },
    })

    return res.status(200).json({ data: addresses })
  } catch (error) {
    console.error('獲取地址失敗:', error)
    return res.status(500).json({ message: '伺服器錯誤，無法獲取地址' })
  }
})

export default router
