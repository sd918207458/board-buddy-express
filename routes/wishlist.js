import express from 'express'
import authenticate from '#middlewares/authenticate.js'
import sequelize from '#configs/db.js'
const router = express.Router()
const { Wishlist, Product_Game, User } = sequelize.models

const handleError = (res, error, message = '伺服器錯誤') => {
  console.error(message, error)
  return res.status(500).json({ message })
}

// 獲取所有收藏的商品和店家
router.get('/', authenticate, async (req, res) => {
  try {
    // 查看用戶的資料，確認 authenticate 中間件是否正確地傳遞了用戶信息
    console.log('User information from req.user: ', req.user)

    // 檢查是否有 member_id 或 id
    if (!req.user || (!req.user.member_id && !req.user.id)) {
      console.error('No valid user ID found in req.user')
      return res.status(400).json({ message: '用戶資料無效，無法查詢收藏' })
    }

    // 打印查詢條件以進一步檢查
    const queryConditions = { member_id: req.user.member_id || req.user.id }
    console.log('Query conditions: ', queryConditions)

    // 查詢 Wishlist
    const favorites = await Wishlist.findAll({
      attributes: ['product_id'],
      where: queryConditions,
      include: [
        {
          model: Product_Game,
          attributes: ['product_id', 'name', 'image', 'description'],
          as: 'product',
          required: false, // 防止產品不存在的情況
        },
        {
          model: User,
          attributes: ['member_id', 'username'],
          as: 'user',
          required: false,
        },
      ],
    })

    // 確認查詢結果
    console.log('Fetched favorites: ', favorites)

    // 如果查詢結果為空，返回 404
    if (!favorites.length) {
      console.log('No favorites found for user: ', req.user)
      return res.status(404).json({ message: '沒有找到任何收藏產品' })
    }

    // 如果有找到收藏產品，回傳結果
    res.status(200).json({ data: favorites })
  } catch (error) {
    // 顯示具體的錯誤訊息，進一步調試
    console.error('Error fetching favorites: ', error.message)
    return handleError(res, error, '獲取收藏失敗')
  }
})

// 新增收藏商品
router.post('/:productId', authenticate, async (req, res) => {
  const productId = req.params.productId
  const memberId = req.user.member_id || req.user.id

  try {
    const product = await Product_Game.findOne({
      where: { product_id: productId },
    })
    if (!product) {
      return res.status(404).json({ message: '產品不存在' })
    }

    const exists = await Wishlist.findOne({
      where: { member_id: memberId, product_id: productId },
    })

    if (exists) {
      return res.status(409).json({ message: '該產品已在願望清單中' })
    }

    const newWishlistItem = await Wishlist.create({
      member_id: memberId,
      product_id: productId,
    })

    res.status(201).json({ message: '成功加入願望清單', data: newWishlistItem })
  } catch (error) {
    return handleError(res, error, '加入願望清單失敗')
  }
})

// 刪除收藏商品
router.delete('/:productId', authenticate, async (req, res) => {
  const productId = req.params.productId
  const memberId = req.user.member_id || req.user.id

  try {
    const item = await Wishlist.findOne({
      where: { member_id: memberId, product_id: productId },
    })

    if (!item) {
      return res.status(404).json({ message: '該產品不在願望清單中' })
    }

    await item.destroy()
    return res.status(200).json({ message: '已從願望清單中移除' })
  } catch (error) {
    return handleError(res, error, '移除願望清單失敗')
  }
})

// 獲取所有收藏的商品
router.get('/products', authenticate, async (req, res) => {
  const memberId = req.user.member_id || req.user.id

  try {
    const favorites = await Wishlist.findAll({
      where: { member_id: memberId },
      include: [
        {
          model: Product_Game,
          attributes: ['product_id', 'name', 'image', 'description'],
          as: 'product',
        },
      ],
    })

    if (!favorites.length) {
      return res.status(404).json({ message: '沒有收藏的商品' })
    }

    res.status(200).json({ data: favorites.map((fav) => fav.product) })
  } catch (error) {
    return handleError(res, error, '無法獲取收藏商品')
  }
})

export default router
