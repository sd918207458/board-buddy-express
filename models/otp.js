// 資料庫查詢處理函式
import { find, count, insertOne, findOne } from './base.js'
//
import { generateToken, verifyToken } from '../config/otp.js'

const table = 'otp'

const getOtp = (email) => generateToken(email)
const createOtp = async (email) => {
  const token = generateToken(email)
  const otp = {
    user_id,
    email,
    expire,
    token,
  }

  await insertOne(table)
}
const verifyOtp = async ({ token, email }) => {
  const sql = `SELECT * FROM ${table} WHERE expiry_datetime > CURRENT_TIMESTAMP`

  //Boolean(await count(table, { token, email }))
}
