// 資料庫查詢處理函式
import { insertOne, findOne, updateById, removeById } from './base.js'
//
import { generateToken } from '../config/otp.js'

const table = 'otp'
const userTable = 'users'

// 預設 exp = 30 mins 到期
const createOtp = async (email, exp = 30) => {
  // 檢查使用者email是否存在
  const user = await findOne(userTable, { email })

  console.log(user)

  if (!user.id) return {}

  // 以使用者輸入的Email作為secret產生otp token
  const token = generateToken(email)

  // 到期時間
  const exp_timestamp = +new Date() + exp * 60 * 1000

  const otp = {
    user_id: user.id,
    email,
    token,
    exp_timestamp,
  }

  const result = await insertOne(table, otp)

  return result.insertId ? { id: result.insertId, ...otp } : {}
}

const findOtp = async (email, token) => {
  // 回傳 {id, user_id, email, token, exp_timestamp}
  const otp = await findOne(table, { email, token })

  // 沒找到資料
  if (!otp.id) return {}

  // 計算目前時間比對是否超過，到期的timestamp
  if (+new Date() > otp.exp_timestamp) return {}

  return otp
}

// after update use password
const removeOtpById = async (id) => {
  return removeById(table, id)
}

const updatePassword = async (email, token, password) => {
  const otp = await findOtp(email, token)

  if (!otp.id) return false

  // 修改密碼
  const result = await updateById(userTable, { password }, otp.user_id)

  console.log(result)

  // 移除otp記錄
  const result2 = await removeOtpById(otp.id)

  console.log(result2)

  return true
}

export { createOtp, updatePassword }
