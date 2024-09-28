import express from 'express'
import authenticate from '#middlewares/authenticate.js'
import sequelize from '#configs/db.js'
import { getIdParam } from '#db-helpers/db-tool.js'

const router = express.Router()
const { Favorite } = sequelize.models

// 獲取所有收藏的商品和店家
router.get('/', authenticate, async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      attributes: ['pid', 'type'],
      where: {
        uid: req.user.id,
      },
      raw: true, // 只需要資料
    })

    if (favorites.length === 0) {
      return res
        .status(404)
        .json({ status: 'error', message: '沒有找到收藏項目' })
    }

    res.json({ status: 'success', data: favorites })
  } catch (error) {
    console.error('獲取收藏失敗:', error)
    res.status(500).json({ status: 'error', message: '伺服器錯誤' })
  }
})

// 新增收藏商品或店家
router.put('/:id/:type', authenticate, async (req, res) => {
  try {
    const pid = getIdParam(req)
    const type = req.params.type // 'product' 或 'store'
    const uid = req.user.id

    if (type !== 'product' && type !== 'store') {
      return res.status(400).json({ status: 'error', message: '無效的類型' })
    }

    const existFav = await Favorite.findOne({ where: { pid, uid, type } })
    if (existFav) {
      return res
        .status(409)
        .json({ status: 'error', message: '該項目已存在於收藏列表中' })
    }

    const newFav = await Favorite.create({ pid, uid, type })
    res.status(201).json({ status: 'success', data: newFav })
  } catch (error) {
    console.error('新增收藏失敗:', error)
    res.status(500).json({ status: 'error', message: '伺服器錯誤' })
  }
})

// 獲取所有收藏的商品
router.get('/products', authenticate, async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      attributes: ['pid'],
      where: {
        uid: req.user.id,
        type: 'product',
      },
      raw: true,
    })

    if (favorites.length === 0) {
      return res
        .status(404)
        .json({ status: 'error', message: '沒有收藏的商品' })
    }

    res.json({ status: 'success', data: favorites.map((fav) => fav.pid) })
  } catch (error) {
    console.error('獲取收藏的商品失敗:', error)
    res.status(500).json({ status: 'error', message: '伺服器錯誤' })
  }
})

// 獲取所有收藏的店家
router.get('/stores', authenticate, async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      attributes: ['pid'],
      where: {
        uid: req.user.id,
        type: 'store',
      },
      raw: true,
    })

    if (favorites.length === 0) {
      return res
        .status(404)
        .json({ status: 'error', message: '沒有收藏的店家' })
    }

    res.json({ status: 'success', data: favorites.map((fav) => fav.pid) })
  } catch (error) {
    console.error('獲取收藏的店家失敗:', error)
    res.status(500).json({ status: 'error', message: '伺服器錯誤' })
  }
})

// 刪除收藏的商品或店家
router.delete('/:id/:type', authenticate, async (req, res) => {
  try {
    const pid = getIdParam(req)
    const type = req.params.type // 'product' 或 'store'
    const uid = req.user.id

    const affectedRows = await Favorite.destroy({
      where: {
        pid,
        uid,
        type,
      },
    })

    if (!affectedRows) {
      return res.status(404).json({
        status: 'error',
        message: '該收藏項目不存在或已被刪除',
      })
    }

    res.json({ status: 'success', message: '收藏項目已成功刪除' })
  } catch (error) {
    console.error('刪除收藏失敗:', error)
    res.status(500).json({ status: 'error', message: '伺服器錯誤' })
  }
})

export default router
