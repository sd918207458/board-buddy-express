import express from 'express'
const router = express.Router()

import { findOne, insertOne, count } from '../models/base.js'
// line-login模組
import line_login from '../services/line-login.js'

// 存取`.env`設定檔案使用
import 'dotenv/config.js'

// 定義安全的私鑰字串
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
// line login usage
const channel_id = process.env.LINE_CHANNEL_ID
const channel_secret = process.env.LINE_CHANNEL_SECRET
const callback_url = process.env.LINE_LOGIN_CALLBACK_URL

const login = new line_login({
  channel_id,
  channel_secret,
  // react line page callback url
  // 注意: LINE_LOGIN_CALLBACK_URL 是前端(react/next)路由
  // 必需要與 LINE developer 的 "Callback URL" 設定一致
  callback_url,
  scope: 'openid profile',
  prompt: 'consent',
  bot_prompt: 'normal',
})

// TODO: 測試用，目前無功能
// router.get('/profile', (req, res, next) => {
//   const access_token = ''
//   const profile = login.get_user_profile(access_token)
//   console.log(profile)
//   return res.json({ message: 'success' })
// })

// 此api路由為產生登入網址，之後前端自己導向line網站進行登入
router.get('/login', login.authJson())

// 此api路由為登入後，會導回前端(react/next)對應路由頁面，之後作後繼判斷處理
router.get(
  '/callback',
  login.callback(
    // 登入成功的回調函式 Success callback
    async (req, res, next, token_response) => {
      console.log(token_response)

      // 以下流程:
      // 1. 先查詢資料庫是否有同line_uid的資料
      // 2-1. 有存在 -> 執行登入工作
      // 2-2. 不存在 -> 建立一個新會員資料(無帳號與密碼)，只有google來的資料 -> 執行登入工作
      const isFound = await count('users', {
        line_uid: token_response.id_token.sub,
      })

      if (isFound) {
        // 有存在 -> 執行登入工作
        const user = await findOne('users', {
          line_uid: token_response.id_token.sub,
        })

        // 如果沒必要，member的password資料不應該，也不需要回應給瀏覽器
        delete user.password

        // 啟用session(這裡是用session cookie機制)
        req.session.userId = user.id

        return res.json({ message: 'success', code: '200', user })
      } else {
        // 3. 不存在 -> 建立一個新會員資料(無帳號與密碼)，只有google來的資料 -> 執行登入工作
        const newUser = {
          name: token_response.id_token.name,
          email: '',
          line_uid: token_response.id_token.sub,
          photo_url: token_response.id_token.picture,
        }

        await insertOne('users', newUser)

        const user = await findOne('users', {
          line_uid: token_response.id_token.sub,
        })

        // 如果沒必要，member的password資料不應該，也不需要回應給瀏覽器
        delete user.password

        // 啟用session(這裡是用session cookie機制)
        req.session.userId = user.id

        return res.json({ message: 'success', code: '200', user })
      }
    },
    // 登入失敗的回調函式 Failure callback
    (req, res, next, error) => {
      console.log('line login fail')

      return res.json({ message: 'fail', error })
    }
  )
)

export default router
