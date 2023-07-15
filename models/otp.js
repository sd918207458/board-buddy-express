// 資料庫查詢處理函式
import { insertOne, findOne, updateById } from './base.js'
//
import { generateToken } from '../config/otp.js'

const table = 'otp'
const userTable = 'users'

const createOtp = async (email) => {
  // 檢查使用者email是否存在
  const user = findOne(table, { email })

  if (!user.id) return

  // 以使用者輸入的Email作為secret產生otp token
  const token = generateToken(email)

  // 30分鐘後到期
  const exp_timestamp = +new Date() + 30 * 60 * 1000

  const otp = {
    user_id: user.id,
    email,
    exp_timestamp,
    token,
  }

  await insertOne(table, otp)
}

const findOtp = async (email, token) => {
  // 回傳 {id, user_id, email, token, exp_timestamp}
  const otp = findOne(table, { email, token })

  // 沒找到資料
  if (!otp.id) return {}

  // 計算目前時間比對是否超過，到期的timestamp
  if (+new Date() > otp.exp_timestamp) return {}

  return otp
}

const updatePassword = async (email, token, password) => {
  const otp = await findOtp(email, token)

  if (!otp.id) return false

  // 修改密碼
  const rows = await updateById(userTable, { password }, otp.user_id)

  return true
}

export { createOtp, updatePassword }
