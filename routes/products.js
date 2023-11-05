import express from 'express'
const router = express.Router()

// 檢查空物件, 轉換req.params為數字
import {
  getIdParam,
  getFindInSet,
  getBetween,
  getOrder,
  getWhere,
} from '#db-helpers/db-tool.js'

// 資料庫使用
import sequelize from '#configs/db.js'
const { Product } = sequelize.models
import { QueryTypes } from 'sequelize'

// import { readJsonFile } from '#utils/tool.js'
router.get('/qs-swr-total', async (req, res, next) => {
  // 獲取網頁的搜尋字串
  const {
    page,
    keyword,
    brand_ids,
    cat_ids,
    colors,
    tags,
    sizes,
    orderby,
    perpage,
    price_range,
  } = req.query

  // TODO: 這裡可以檢查各query string正確性或給預設值，檢查不足可能會產生查詢錯誤

  // 建立資料庫搜尋條件
  const conditions = []

  // 關鍵字，keyword 使用 `name LIKE '%keyword%'`
  conditions[0] = keyword ? `name LIKE '%${keyword}%'` : ''

  // 品牌，brand_ids 使用 `brand_id IN (4,5,6,7)`
  conditions[1] = brand_ids ? `brand_id IN (${brand_ids})` : ''

  // 分類，cat_ids 使用 `cat_id IN (1, 2, 3, 4, 5)`
  conditions[2] = cat_ids ? `cat_id IN (${cat_ids})` : ''

  // 顏色: FIND_IN_SET(1, color) OR FIND_IN_SET(2, color)
  conditions[3] = getFindInSet(colors, 'color')

  // 標籤: FIND_IN_SET(3, tag) OR FIND_IN_SET(2, tag)
  conditions[4] = getFindInSet(tags, 'tag')

  // 尺寸: FIND_IN_SET(3, size) OR FIND_IN_SET(2, size)
  conditions[5] = getFindInSet(sizes, 'size')

  // 價格
  conditions[6] = getBetween(price_range, 'price', 1500, 10000)

  // 各條件為AND相接(不存在時不加入where從句中)
  const where = getWhere(conditions, 'AND')

  // 排序用，預設使用id, asc
  const order = getOrder(orderby)

  // 分頁用
  // page預設為1，perpage預設為10
  const perpageNow = Number(perpage) || 10
  const pageNow = Number(page) || 1
  const limit = perpageNow
  // page=1 offset=0; page=2 offset= perpage * 1; ...
  const offset = (pageNow - 1) * perpageNow

  const sqlProducts = `SELECT * FROM product ${where} ${order} LIMIT ${limit} OFFSET ${offset}`
  const sqlCount = `SELECT COUNT(*) AS count FROM product ${where}`

  //console.log(sqlProducts.bgWhite)

  // const products = await sequelize.query(sqlProducts, {
  //   type: QueryTypes.SELECT, //執行為SELECT
  //   raw: true, // 只需要資料表中資料
  // })

  const data = await sequelize.query(sqlCount, {
    type: QueryTypes.SELECT, //執行為SELECT
    raw: true, // 只需要資料表中資料
    plain: true, // 只需一筆資料
  })

  // 查詢
  // const total = await countWithQS(where)
  // const products = await getProductsWithQS(where, order, limit, offset)

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
    total: data.count,
  }

  res.json(result)
})
router.get('/qs-swr', async (req, res, next) => {
  // 獲取網頁的搜尋字串
  const {
    page,
    keyword,
    brand_ids,
    cat_ids,
    colors,
    tags,
    sizes,
    orderby,
    perpage,
    price_range,
  } = req.query

  // TODO: 這裡可以檢查各query string正確性或給預設值，檢查不足可能會產生查詢錯誤

  // 建立資料庫搜尋條件
  const conditions = []

  // 關鍵字，keyword 使用 `name LIKE '%keyword%'`
  conditions[0] = keyword ? `name LIKE '%${keyword}%'` : ''

  // 品牌，brand_ids 使用 `brand_id IN (4,5,6,7)`
  conditions[1] = brand_ids ? `brand_id IN (${brand_ids})` : ''

  // 分類，cat_ids 使用 `cat_id IN (1, 2, 3, 4, 5)`
  conditions[2] = cat_ids ? `cat_id IN (${cat_ids})` : ''

  // 顏色: FIND_IN_SET(1, color) OR FIND_IN_SET(2, color)
  conditions[3] = getFindInSet(colors, 'color')

  // 標籤: FIND_IN_SET(3, tag) OR FIND_IN_SET(2, tag)
  conditions[4] = getFindInSet(tags, 'tag')

  // 尺寸: FIND_IN_SET(3, size) OR FIND_IN_SET(2, size)
  conditions[5] = getFindInSet(sizes, 'size')

  // 價格
  conditions[6] = getBetween(price_range, 'price', 1500, 10000)

  // 各條件為AND相接(不存在時不加入where從句中)
  const where = getWhere(conditions, 'AND')

  // 排序用，預設使用id, asc
  const order = getOrder(orderby)

  // 分頁用
  // page預設為1，perpage預設為10
  const perpageNow = Number(perpage) || 10
  const pageNow = Number(page) || 1
  const limit = perpageNow
  // page=1 offset=0; page=2 offset= perpage * 1; ...
  const offset = (pageNow - 1) * perpageNow

  const sqlProducts = `SELECT * FROM product ${where} ${order} LIMIT ${limit} OFFSET ${offset}`
  const sqlCount = `SELECT COUNT(*) AS count FROM product ${where}`

  console.log(sqlProducts.bgWhite)

  const products = await sequelize.query(sqlProducts, {
    type: QueryTypes.SELECT, //執行為SELECT
    raw: true, // 只需要資料表中資料
  })

  const data = await sequelize.query(sqlCount, {
    type: QueryTypes.SELECT, //執行為SELECT
    raw: true, // 只需要資料表中資料
    plain: true, // 只需一筆資料
  })

  // 查詢
  // const total = await countWithQS(where)
  // const products = await getProductsWithQS(where, order, limit, offset)

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
    total: data.count,
    perpage: Number(perpage),
    page: Number(page),
    data: products,
  }

  res.json(products)
})

// 獲得所有資料，加入分頁與搜尋字串功能，單一資料表處理
// products/qs?page=1&keyword=Ele&brand_ids=1&cat_ids=4,5,6,7,8&sizes=1,2&tags=3,4&colors=1,2&orderby=id,asc&perpage=10&price_range=1500,10000
router.get('/qs', async (req, res, next) => {
  // 獲取網頁的搜尋字串
  const {
    page,
    keyword,
    brand_ids,
    cat_ids,
    colors,
    tags,
    sizes,
    orderby,
    perpage,
    price_range,
  } = req.query

  // TODO: 這裡可以檢查各query string正確性或給預設值，檢查不足可能會產生查詢錯誤

  // 建立資料庫搜尋條件
  const conditions = []

  // 關鍵字，keyword 使用 `name LIKE '%keyword%'`
  conditions[0] = keyword ? `name LIKE '%${keyword}%'` : ''

  // 品牌，brand_ids 使用 `brand_id IN (4,5,6,7)`
  conditions[1] = brand_ids ? `brand_id IN (${brand_ids})` : ''

  // 分類，cat_ids 使用 `cat_id IN (1, 2, 3, 4, 5)`
  conditions[2] = cat_ids ? `cat_id IN (${cat_ids})` : ''

  // 顏色: FIND_IN_SET(1, color) OR FIND_IN_SET(2, color)
  conditions[3] = getFindInSet(colors, 'color')

  // 標籤: FIND_IN_SET(3, tag) OR FIND_IN_SET(2, tag)
  conditions[4] = getFindInSet(tags, 'tag')

  // 尺寸: FIND_IN_SET(3, size) OR FIND_IN_SET(2, size)
  conditions[5] = getFindInSet(sizes, 'size')

  // 價格
  conditions[6] = getBetween(price_range, 'price', 1500, 10000)

  // 各條件為AND相接(不存在時不加入where從句中)
  const where = getWhere(conditions, 'AND')

  // 排序用，預設使用id, asc
  const order = getOrder(orderby)

  // 分頁用
  // page預設為1，perpage預設為10
  const perpageNow = Number(perpage) || 10
  const pageNow = Number(page) || 1
  const limit = perpageNow
  // page=1 offset=0; page=2 offset= perpage * 1; ...
  const offset = (pageNow - 1) * perpageNow

  const sqlProducts = `SELECT * FROM product ${where} ${order} LIMIT ${limit} OFFSET ${offset}`
  const sqlCount = `SELECT COUNT(*) AS count FROM product ${where}`

  console.log(sqlProducts.bgWhite)

  const products = await sequelize.query(sqlProducts, {
    type: QueryTypes.SELECT, //執行為SELECT
    raw: true, // 只需要資料表中資料
  })

  const data = await sequelize.query(sqlCount, {
    type: QueryTypes.SELECT, //執行為SELECT
    raw: true, // 只需要資料表中資料
    plain: true, // 只需一筆資料
  })

  // 查詢
  // const total = await countWithQS(where)
  // const products = await getProductsWithQS(where, order, limit, offset)

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
    total: data.count,
    perpage: Number(perpage),
    page: Number(page),
    data: products,
  }

  res.json(result)
})

// 獲得單筆資料
router.get('/:id', async (req, res, next) => {
  // 轉為數字
  const id = getIdParam(req)

  const product = await Product.findByPk(id, {
    raw: true, // 只需要資料表中資料
  })

  return res.json({ status: 'success', data: { product } })
})

// 獲得所有資料
router.get('/', async (req, res, next) => {
  // 讀入範例資料
  const products = await Product.findAll({ raw: true })
  res.json({ status: 'success', data: { products } })
})

export default router
