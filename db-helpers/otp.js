// 資料庫查詢處理函式
// import { insertOne, findOne, updateById, removeById } from './base.js'
import { generateToken } from '#configs/otp.js'

// const otpTable = 'otp'
// const userTable = 'users'

// 資料庫使用
import { QueryTypes } from 'sequelize'
import sequelize from '#configs/db.js'
import { updateOrCreate } from '#db-helpers/db-tool.js'
const { User, Otp } = sequelize.models

// 預設 exp = 30 分鐘到期(對應的是otp資料表中的exp_timestamp)
const createOtp = async (email, exp = 30) => {
  // 方式二: 使用模型查詢
  // 檢查使用者email是否存在
  const user = await User.findOne({
    where: {
      email,
    },
    raw: true, // 只需要資料表中資料
  })

  if (!user) return {}

  // 檢查otp是否已經存在(失敗or逾時重傳)
  const foundOtp = await Otp.findOne({
    where: {
      email,
    },
    raw: true, // 只需要資料表中資料
  })

  // 有找到記錄，但因為在60s(秒)內不繼續產生新的otp
  if (foundOtp) {
    if (
      Number(new Date()) - (foundOtp.exp_timestamp - exp * 60 * 1000) <
      60 * 1000
    ) {
      console.log('錯誤: 60s(秒)內要求要重新產生otp')
      return {}
    } else {
      // 超過60s產生新的otp
      // 以使用者輸入的Email作為secret產生otp token
      const token = generateToken(email)

      // 到期時間 預設 exp = 30 分鐘到期
      const exp_timestamp = Number(new Date()) + exp * 60 * 1000

      // 修改Otp
      await Otp.update(
        { token, exp_timestamp },
        {
          where: {
            email,
          },
        }
      )

      return {
        ...foundOtp,
        exp_timestamp,
        token,
      }
    }
  }

  // 以下為或"沒找到記錄"或"沒產生過otp"

  // 以使用者輸入的Email作為secret產生otp token
  const token = generateToken(email)

  // 到期時間 預設 exp = 30 分鐘到期
  const exp_timestamp = Number(new Date()) + exp * 60 * 1000

  // 建立otp物件
  const newOtp = {
    user_id: user.id,
    email,
    token,
    exp_timestamp,
  }

  // 建立新記錄
  const otp = await Otp.create(newOtp, { raw: true })
  console.log(otp.dataValues)

  return otp.dataValues
}

// 內部用不導出: 尋找合法的(未過期的)otp記錄
// 有找到會回傳otp物件，沒找到會回傳空物件{}
// const findOneValidOtp = async (email, token) => {
//   // 回傳 {id, user_id, email, token, exp_timestamp}
//   const otp = await findOne(otpTable, { email, token })

//   // 沒找到資料
//   if (!otp.id) return {}

//   // 計算目前時間比對是否超過，到期的timestamp
//   if (+new Date() > otp.exp_timestamp) return {}

//   return otp
// }

// 內部用不導出: 刪除otp記錄(註: 在使用者成功更新密碼後)
// const removeOtpById = async (id) => {
//   return removeById(otpTable, id)
// }

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
  if (!foundOtp) return false

  // 計算目前時間比對是否超過，到期的timestamp
  if (+new Date() > foundOtp.exp_timestamp) return false

  // 修改密碼
  await User.update(
    { password },
    {
      where: {
        id: foundOtp.user_id,
      },
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
