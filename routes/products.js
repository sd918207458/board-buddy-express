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
// 專用處理sql字串的工具，主要format與escape，防止sql injection
import sqlString from 'sqlstring'

// 清除資料庫後，以範例json資料直接插入到資料庫
router.get('/insert-bulk', async (req, res, next) => {
  // 讀入範例資料
  const data = await readJsonFile('/data/json/product/products.json')
  // 清除目前所有資料
  await cleanAll()
  // 範例json資料直接插入到資料庫
  const result2 = await createBulkProducts(data.products)

  res.json({ result: result2 })
})

// 獲得所有資料，加入分頁與搜尋字串功能，單一資料表處理
// products/qs?page=1&keyword=xxxx&cat_ids=1,2&orderby=id,asc&prepage=10
router.get('/qs', async (req, res, next) => {
  // 獲取網頁的搜尋字串
  const { page, keyword, cat_ids, orderby, perpage } = req.query

  // 建立資料庫搜尋條件
  // cat_id 使用 WHERE cat_id IN (1, 2, 3, 4, 5)
  // keyword 使用  WHERE name LIKE '%keyword%'
  const conditions = []

  conditions[0] = keyword
    ? `name LIKE ${sqlString.escape('%' + keyword + '%')}`
    : ''
  conditions[1] = cat_ids ? `cat_id IN (${cat_ids})` : ''

  //各條件為AND相接(不存在時不加入where從句中)
  const conditionsHasValue = conditions.filter((v) => v)
  const where =
    conditionsHasValue.length > 0
      ? `WHERE ` + conditionsHasValue.join(' AND ')
      : ''

  const limit = perpage ? perpage : 0

  // page=1 offset=0 ; page=2 offset= perpage * 1; ...
  const offset = (page - 1) * perpage

  // 排序用
  const order = orderby
    ? { [orderby.split(',')[0]]: orderby.split(',')[1] }
    : {}

  // 讀入範例資料
  const total = await countWithQS(where)
  const products = await getProductsWithQS(where, order, limit, offset)

  // json回傳
  //
  // {
  //   total: 100,
  //   perpage: 10,
  //   page: 1,
  //   data:[
  //     {id:123, name:'',...},
  //     {id:123, name:'',...}
  //   ]
  // }

  const result = {
    total,
    perpage: Number(perpage),
    page: Number(page),
    data: products,
  }

  res.json(result)
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
