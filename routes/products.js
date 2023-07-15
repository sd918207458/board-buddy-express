import express from 'express'
const router = express.Router()

import { readJsonFile } from '../utils/json-tool.js'

import {
  getProducts,
  getProductsWithQS,
  getProductById,
  createBulkProducts,
  cleanAll,
  countWithQS,
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

// 獲得所有資料，加入分頁與搜尋字串功能，單一資料表處理
// user?page=1&keyword=xxxx&cat_ids=1,2&orderby=id&prepage=10
router.get('/', async (req, res, next) => {
  // 獲取網頁的搜尋字串
  const { page, keyword, cat_ids, orderby, prepage } = req.query

  // 建立資料庫搜尋條件

  // 讀入範例資料
  const total = await countWithQS()
  const products = await getProductsWithQS()

  // {
  //   total: 100,
  //   perpage: 10,
  //   page: 1,
  //   data:[
  //     {id:123, name:'',...},
  //     {id:123, name:'',...}
  //   ]
  // }

  res.json({ products })
})

export default router
