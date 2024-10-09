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

// 創建新的產品遊戲 (POST /api/productsGame)
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
      details: error.message || 'Unknown error',
      validationErrors: error.errors || null,
    })
  }
})

// 獲取所有產品遊戲 (GET /api/productsGame)
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
      details: error.message || 'Unknown error',
      validationErrors: error.errors || null,
    })
  }
})

// 根據選擇的遊戲類型呈現相對應的遊戲 (GET /api/productsGame/types)
router.get('/types', async (req, res) => {
  const { product_type } = req.query // 從查詢參數中提取 product_type

  try {
    // 如果 product_type 存在，過濾該類型的遊戲
    if (product_type) {
      const products = await Product_Game.findAll({
        where: {
          product_type: {
            [Op.eq]: product_type, // 過濾條件，匹配 product_type
          },
        },
        attributes: ['product_id', 'product_name', 'product_type'], // 獲取所需的所有欄位
      })

      // 返回完整的遊戲資料，而不僅僅是名稱
      res.status(200).json({
        status: 'success',
        data: {
          [product_type]: products, // 返回遊戲數據，包括 id 和其他必要信息
        },
      })
    } else {
      // 如果沒有提供 product_type，返回錯誤
      res.status(400).json({
        status: 'error',
        message: 'Please provide a valid product_type',
      })
    }
  } catch (error) {
    console.error('Error fetching games:', error)
    res.status(500).json({
      status: 'error',
      message: 'Server error, unable to fetch games',
      details: error.message || 'Unknown error',
    })
  }
})

// 獲取所有產品遊戲的類型 (GET /api/productsGame/typesList)
router.get('/typesList', async (req, res) => {
  try {
    const types = await Product_Game.findAll({
      attributes: ['product_type'],
      group: ['product_type'], // 按照 product_type 分組，獲取唯一的遊戲類型
    })

    const gameTypes = types.map((type) => type.product_type)
    res.status(200).json({
      status: 'success',
      data: gameTypes,
    })
  } catch (error) {
    console.error('Error fetching game types:', error)
    res.status(500).json({
      status: 'error',
      message: 'Server error, unable to fetch game types',
      details: error.message || 'Unknown error',
    })
  }
})

// 根據 ID 獲取單個產品遊戲 (GET /api/productsGame/:id)
router.get('/:id', async (req, res) => {
  function getIdParam(req) {
    const id = req.params.id
    if (!/^\d+$/.test(id)) {
      // 只允許數字 ID
      throw new TypeError(`Invalid ':id' param: "${id}"`)
    }
    return parseInt(id, 10)
  }

  try {
    const id = getIdParam(req) // 使用 getIdParam 來獲取並驗證 ID
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
      details: error.message || 'Unknown error',
      validationErrors: error.errors || null,
    })
  }
})

// 根據 ID 更新產品遊戲 (PUT /api/productsGame/:id)
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
      details: error.message || 'Unknown error',
      validationErrors: error.errors || null,
    })
  }
})

// 根據 ID 刪除產品遊戲 (DELETE /api/productsGame/:id)
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
      details: error.message || 'Unknown error',
      validationErrors: error.errors || null,
    })
  }
})

export default router
