import express from 'express'
const router = express.Router()

import authenticate from '#middlewares/authenticate.js'
import sequelize from '#configs/db.js' // 從 sequelize 中獲取資料庫
const { Address } = sequelize.models // 確保 Address 模型正確設置

// 存取`.env`設定檔案使用
import 'dotenv/config.js'

const callback_url = process.env.SHIP_711_STORE_CALLBACK_URL

// 註: 本路由與資料庫無關，單純轉向使用

// POST
router.post('/711', function (req, res, next) {
  //console.log(req.body)
  res.redirect(callback_url + '?' + new URLSearchParams(req.body).toString())
})

// 測試路由用
// router.get('/', function (req, res, next) {
//   res.render('index', { title: 'shipment route is OK' })
// })

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

    if (!username || !phone || !city || !street) {
      return res.status(400).json({ message: '缺少必要欄位' })
    }

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

    await addressToUpdate.update({
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

    // 將所有地址的 `isDefault` 設為 `false`
    await Address.update(
      { isDefault: false },
      { where: { member_id: req.user.id } }
    )

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
