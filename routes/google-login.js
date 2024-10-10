import express from 'express'
const router = express.Router()

import sequelize from '#configs/db.js'
const { User } = sequelize.models

import jsonwebtoken from 'jsonwebtoken'
import 'dotenv/config.js'

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

router.post('/', async function (req, res, next) {
  try {
    // Log received body data for debugging
    console.log('Received request body:', JSON.stringify(req.body))

    // 檢查從 React 發來的資料
    if (!req.body.providerId || !req.body.uid) {
      return res.status(400).json({
        status: 'error',
        message: '缺少 Google 登入資料，請檢查 providerId 和 uid 是否正確',
      })
    }

    const { displayName, email, uid, photoURL } = req.body
    const google_uid = uid

    // Log the extracted fields
    console.log(
      `Extracted data - displayName: ${displayName}, email: ${email}, uid: ${uid}, photoURL: ${photoURL}`
    )

    // 1. 查詢資料庫是否有同 google_uid 的資料
    const total = await User.count({
      where: {
        google_uid,
      },
    })

    // 確認資料庫查詢的結果
    console.log(
      `Database check result - existing users with google_uid: ${total}`
    )

    // 要加到 access token 中回傳給前端的資料
    let returnUser = {
      id: 0,
      username: '',
      google_uid: '',
      line_uid: '',
    }

    if (total > 0) {
      // 2-1. 有存在 -> 從資料庫查詢會員資料
      const dbUser = await User.findOne({
        where: {
          google_uid,
        },
        raw: true, // 只需要資料表中資料
      })

      // 確認資料庫查詢的會員資料
      if (!dbUser) {
        return res.status(500).json({
          status: 'error',
          message: '發生錯誤：無法找到已存在的會員資料，請檢查資料庫',
        })
      }

      console.log(`Found user in database: ${JSON.stringify(dbUser)}`)

      // 回傳給前端的資料
      returnUser = {
        id: dbUser.member_id,
        username: dbUser.username,
        google_uid: dbUser.google_uid,
        line_uid: dbUser.line_uid || '', // 保持一致
      }
    } else {
      // 2-2. 不存在 -> 建立一個新會員資料
      const user = {
        username: displayName || null, // Google 登錄可能沒有 displayName
        email: email,
        google_uid,
        photo_url: photoURL || null,
      }

      console.log(`Creating new user with data: ${JSON.stringify(user)}`)

      try {
        // 新增會員資料
        const newUser = await User.create(user)

        // 確認新會員的創建結果
        console.log(`New user created: ${JSON.stringify(newUser)}`)

        returnUser = {
          id: newUser.member_id,
          username: newUser.username, // 修正：確保返回的 username
          google_uid: newUser.google_uid,
          line_uid: newUser.line_uid || '',
        }
      } catch (error) {
        console.error('Error creating new user:', error)
        return res.status(500).json({
          status: 'error',
          message: '創建新會員時發生錯誤，請檢查資料庫或資料格式',
          error: error.message,
        })
      }
    }

    // 產生存取令牌(access token)，其中包含會員資料
    try {
      const accessToken = jsonwebtoken.sign(returnUser, accessTokenSecret, {
        expiresIn: '3d',
      })

      // 使用 httpOnly cookie 來儲存 access token
      res.cookie('accessToken', accessToken, { httpOnly: true })

      // 傳送 access token 回應
      return res.json({
        status: 'success',
        data: {
          accessToken,
        },
      })
    } catch (tokenError) {
      console.error('Error generating access token:', tokenError)
      return res.status(500).json({
        status: 'error',
        message: '產生存取令牌時發生錯誤，請檢查加密邏輯',
        error: tokenError.message,
      })
    }
  } catch (err) {
    // 捕獲所有未知錯誤
    console.error('Unexpected error:', err)
    return res.status(500).json({
      status: 'error',
      message: '伺服器發生未知錯誤，請聯繫管理員',
      error: err.message,
    })
  }
})

export default router
