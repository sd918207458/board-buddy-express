import express from 'express'
const router = express.Router()

import { readJsonFile } from '../utils/json-tool.js'

import {
  getProducts,
  getProductById,
  createBulkProducts,
  cleanAll,
} from '../models/products.js'

// 清除資料庫後，以範例json資料直接插入到資料庫
router.get('/insert-bulk', async (req, res, next) => {
  // 讀入範例資料
  const data = await readJsonFile('/data/json/product/products.json')
  // 清除目前所有資料
  const result1 = await cleanAll()
  // 範例json資料直接插入到資料庫
  const result2 = await createBulkProducts(data.products)

  res.json({ result: result2 })
})

// 獲得單筆資料
router.get('/:pid', async (req, res, next) => {
  console.log(req.params)

  // 讀入範例資料
  const product = await getProductById(req.params.pid)

  if (product) {
    return res.json({ ...product })
  } else {
    return res.json({})
  }
})

// 獲得所有資料
router.get('/', async (req, res, next) => {
  // 讀入範例資料
  const products = await getProducts()
  res.json({ products })
})

export default router
