import express from 'express'
const router = express.Router()

// 中介軟體，用來驗證用戶是否已經登錄
import authenticate from '#middlewares/authenticate.js'

// 將 req.params 的 ID 轉換為數字
import { getIdParam } from '#db-helpers/db-tool.js'

// 資料庫模組和 Sequelize
import { Op } from 'sequelize'
import sequelize from '#configs/db.js'
const { Product_Game } = sequelize.models

// 創建新的產品遊戲 (POST /api/product_games)
router.post('/', async (req, res) => {
  try {
    const newProductGame = await Product_Game.create(req.body)
    res.status(201).json({
      status: 'success',
      data: newProductGame,
    })
  } catch (error) {
    console.error('Error creating product:', error)
    res.status(500).json({
      status: 'error',
      message: 'Server error, unable to create product',
    })
  }
})

// 獲取所有產品遊戲 (GET /api/product_games)
router.get('/', async (req, res) => {
  try {
    const productGames = await Product_Game.findAll()
    res.status(200).json({
      status: 'success',
      data: productGames,
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({
      status: 'error',
      message: 'Server error, unable to fetch products',
    })
  }
})

// 根據 ID 獲取單個產品遊戲 (GET /api/product_games/:id)
router.get('/:id', async (req, res) => {
  const id = getIdParam(req)
  try {
    const productGame = await Product_Game.findByPk(id)
    if (!productGame) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      })
    }
    res.status(200).json({
      status: 'success',
      data: productGame,
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({
      status: 'error',
      message: 'Server error, unable to fetch product',
    })
  }
})

// 根據 ID 更新產品遊戲 (PUT /api/product_games/:id)
router.put('/:id', async (req, res) => {
  const id = getIdParam(req)
  try {
    const productGame = await Product_Game.findByPk(id)
    if (!productGame) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      })
    }

    await productGame.update(req.body)
    res.status(200).json({
      status: 'success',
      data: productGame,
    })
  } catch (error) {
    console.error('Error updating product:', error)
    res.status(500).json({
      status: 'error',
      message: 'Server error, unable to update product',
    })
  }
})

// 根據 ID 刪除產品遊戲 (DELETE /api/product_games/:id)
router.delete('/:id', async (req, res) => {
  const id = getIdParam(req)
  try {
    const productGame = await Product_Game.findByPk(id)
    if (!productGame) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      })
    }

    await productGame.destroy()
    res.status(204).json({
      status: 'success',
      data: null,
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    res.status(500).json({
      status: 'error',
      message: 'Server error, unable to delete product',
    })
  }
})

export default router
