import express from 'express'
const router = express.Router()

import { readJsonFile } from '../utils/json-tool.js'

import {
  getProducts,
  getProductsWithQS,
  getProductById,
  countWithQS,
} from '../models/products.js'
// 專用處理sql字串的工具，主要format與escape，防止sql injection
import sqlString from 'sqlstring'

// 獲得所有資料，加入分頁與搜尋字串功能，單一資料表處理
// products/qs?page=1&keyword=xxxx&cat_ids=1,2&size=1,2&tag=3,4&color=1,2,3&orderby=id,asc&prepage=10
router.get('/qs', async (req, res, next) => {
  // 獲取網頁的搜尋字串
  const { page, keyword, cat_ids, colors, tags, sizes, orderby, perpage } =
    req.query

  // TODO: 這裡可以檢查各query string正確性或給預設值

  // 建立資料庫搜尋條件
  const conditions = []

  // 關鍵字 keyword 使用 `name LIKE '%keyword%'`
  conditions[0] = keyword
    ? `name LIKE ${sqlString.escape('%' + keyword + '%')}`
    : ''

  // 分類，cat_id 使用 `cat_id IN (1, 2, 3, 4, 5)`
  conditions[1] = cat_ids ? `cat_id IN (${cat_ids})` : ''

  //  顏色: FIND_IN_SET(1, color) OR FIND_IN_SET(2, color)
  const color_ids = colors ? colors.split(',') : []
  conditions[2] = color_ids
    .map((v) => `FIND_IN_SET(${Number(v)}, color)`)
    .join(' OR ')

  //  標籤: FIND_IN_SET(3, tag) OR FIND_IN_SET(2, tag)
  const tag_ids = tags ? tags.split(',') : []
  conditions[3] = tag_ids
    .map((v) => `FIND_IN_SET(${Number(v)}, tag)`)
    .join(' OR ')

  //  尺寸: FIND_IN_SET(3, size) OR FIND_IN_SET(2, size)
  const size_ids = sizes ? sizes.split(',') : []
  conditions[4] = size_ids
    .map((v) => `FIND_IN_SET(${Number(v)}, size)`)
    .join(' OR ')

  //各條件為AND相接(不存在時不加入where從句中)
  const conditionsValues = conditions.filter((v) => v)

  // 各條件需要先包含在`()`中，因各自內查詢是OR, 與其它的是AND
  const where =
    conditionsValues.length > 0
      ? `WHERE ` + conditionsValues.map((v) => `( ${v} )`).join(' AND ')
      : ''

  // 分頁用
  const limit = perpage ? perpage : 0

  // page=1 offset=0 ; page=2 offset= perpage * 1; ...
  const offset = (page - 1) * perpage

  // 排序用，預設使用id, asc
  const order = orderby
    ? { [orderby.split(',')[0]]: orderby.split(',')[1] }
    : { id: 'asc' }

  // 查詢
  const total = await countWithQS(where)
  const products = await getProductsWithQS(where, order, limit, offset)

  // json回傳範例
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
