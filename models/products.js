// 資料庫查詢處理函式
import { find, findOneById, insertMany, cleanTable, count } from './base.js'

// 定義資料庫表格名稱
const table = 'products'

// 所需的資料處理函式
const getProducts = async () => {
  const { rows } = await find(table)
  return rows
}

const getProductsWithQS = async (where = {}, order = {}, limit = 0) => {
  const { rows } = await find(table, where, order, limit)
  return rows
}

const countWithQS = async (where = {}) => {
  return await count(table, where)
}

const getProductById = async (id) => await findOneById(table, id)

const createBulkProducts = async (users) => await insertMany(table, users)

// 其它用途
const cleanAll = async () => await cleanTable(table)

export {
  getProducts,
  getProductsWithQS,
  getProductById,
  createBulkProducts,
  cleanAll,
  countWithQS,
}
