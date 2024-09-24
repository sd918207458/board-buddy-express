import express from 'express'
const router = express.Router()

import { createOtp, updatePassword } from '#db-helpers/otp.js'
import transporter from '#configs/mail.js'
import 'dotenv/config.js'

// 電子郵件文字訊息樣版
const mailText = (otpToken) => `親愛的網站會員 您好，
通知重設密碼所需要的驗証碼，
請輸入以下的6位數字，重設密碼頁面的"電子郵件驗証碼"欄位中。
請注意驗証碼將於寄送後30分鐘後到期，如有任何問題請洽網站客服人員:

${otpToken}

敬上

台灣 NextJS Inc. 網站`

// 創建OTP
router.post('/otp', async (req, res, next) => {
  const { email } = req.body

  if (!email) return res.json({ status: 'error', message: '缺少必要資料' })

  try {
    // 建立OTP資料表記錄，成功回傳OTP記錄物件，失敗為空物件{}
    const otp = await createOtp(email)

    if (!otp.token)
      return res.json({ status: 'error', message: 'Email錯誤或期間內重覆要求' })

    // 寄送email
    const mailOptions = {
      from: `"support"<${process.env.SMTP_TO_EMAIL}>`,
      to: email,
      subject: '重設密碼要求的電子郵件驗証碼',
      text: mailText(otp.token),
    }

    // 寄送email
    transporter.sendMail(mailOptions, (err, response) => {
      if (err) {
        // 失敗處理
        return res.json({ status: 'error', message: '發送電子郵件失敗' })
      } else {
        // 成功回覆的json
        return res.json({ status: 'success', data: null })
      }
    })
  } catch (error) {
    console.error(error)
    return res.json({ status: 'error', message: '系統錯誤' })
  }
})

// 重設密碼
router.post('/reset', async (req, res) => {
  const { email, token, password } = req.body

  if (!token || !email || !password) {
    return res.json({ status: 'error', message: '缺少必要資料' })
  }

  try {
    // updatePassword中驗証OTP的存在與合法性(是否有到期)
    const result = await updatePassword(email, token, password)

    if (!result) {
      return res.json({ status: 'error', message: '修改密碼失敗' })
    }

    // 成功
    return res.json({ status: 'success', data: null })
  } catch (error) {
    console.error(error)
    return res.json({ status: 'error', message: '系統錯誤' })
  }
})

export default router
