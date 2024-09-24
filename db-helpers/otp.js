// 資料庫查詢處理函式
import { generateToken } from '#configs/otp.js'

// 資料庫使用
import { QueryTypes } from 'sequelize'
import sequelize from '#configs/db.js'
const { User, Otp } = sequelize.models

// 判斷token是否到期, true代表到期
// const hasExpired = (expTimestamp) => {
//   return Date.now() > expTimestamp
// }

// 判斷是否可以重設token, true代表可以重設
const shouldReset = (expTimestamp, exp, limit = 60) => {
  const createdTimestamp = expTimestamp - exp * 60 * 1000
  return Date.now() - createdTimestamp > limit * 1000
}

// exp = 是 30 分到期,  limit = 60 是 60秒內不產生新的token
const createOtp = async (email, exp = 30, limit = 60) => {
  // 查找使用者
  const user = await User.findOne({
    where: { email },
    raw: true, // 只需資料表數據
  })

  if (!user) {
    console.log('ERROR - 使用者帳號不存在')
    return {}
  }

  // 查找是否已有 OTP 記錄
  const foundOtp = await Otp.findOne({
    where: { email },
    raw: true, // 只需資料表數據
  })

  // 60 秒內不能產生新的 OTP
  if (foundOtp && !shouldReset(foundOtp.exp_timestamp, exp, limit)) {
    console.log('ERROR - 60 秒內要求重新產生 OTP')
    return {}
  }

  const token = generateToken(email)
  const exp_timestamp = Date.now() + exp * 60 * 1000

  if (foundOtp && shouldReset(foundOtp.exp_timestamp, exp, limit)) {
    // 更新 OTP
    await Otp.update({ token, exp_timestamp }, { where: { email } })
    return { ...foundOtp, exp_timestamp, token }
  }

  // 創建新的 OTP 記錄，使用 member_id 而不是 id
  const newOtp = {
    member_id: user.member_id, // 使用 user.member_id
    email,
    token,
    exp_timestamp,
  }

  const otp = await Otp.create(newOtp)
  return otp.dataValues
}

// 更新密碼
const updatePassword = async (email, token, password) => {
  // 檢查otp是否已經存在
  const foundOtp = await Otp.findOne({
    where: {
      email,
      token,
    },
    raw: true, // 只需要資料表中資料
  })

  // 沒找到回傳false
  if (!foundOtp) {
    console.log('ERROR - OTP Token資料不存在'.bgRed)
    return false
  }

  // 計算目前時間比對是否超過，到期的timestamp
  if (Date.now() > foundOtp.exp_timestamp) {
    console.log('ERROR - OTP Token已到期'.bgRed)
    return false
  }

  // 修改密碼
  await User.update(
    { password },
    {
      where: {
        id: foundOtp.user_id,
      },
      individualHooks: true, // 密碼進資料表前要加密 trigger the beforeUpdate hook
    }
  )

  // 移除otp記錄
  await Otp.destroy({
    where: {
      id: foundOtp.id,
    },
  })

  return true
}

export { createOtp, updatePassword }
