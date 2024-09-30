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

// 發送OTP驗證碼
router.post('/otp', async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) throw new Error('缺少必要資料')

    const otp = await createOtp(email)
    if (!otp.token) throw new Error('Email錯誤或期間內重覆要求')

    // 寄送email
    const mailOptions = {
      from: `"support"<${process.env.SMTP_TO_EMAIL}>`,
      to: email,
      subject: '重設密碼要求的電子郵件驗証碼',
      text: mailText(otp.token),
    }

    transporter.sendMail(mailOptions, (err, response) => {
      if (err) {
        console.error('郵件發送失敗:', err)
        return res.status(500).json({
          status: 'error',
          message: '發送電子郵件失敗',
          error: err.message, // 包含錯誤訊息
          stack: err.stack, // 堆疊信息
        })
      } else {
        return res.json({ status: 'success', data: null })
      }
    })
  } catch (error) {
    console.error('OTP錯誤:', error)
    return res.status(500).json({
      status: 'error',
      message: error.message,
      stack: error.stack,
    })
  }
})

// 重設密碼用
router.post('/reset', async (req, res) => {
  const { email, token, password } = req.body

  if (!token || !email || !password) {
    return res.status(400).json({
      status: 'error',
      message: '缺少必要資料: token, email 或 password 缺失',
    })
  }

  try {
    // 使用外部的 updatePassword 函數進行密碼重設
    const result = await updatePassword(email, token, password)

    if (!result) {
      throw new Error('修改密碼失敗，可能原因是OTP已到期或無效')
    }

    // 成功
    return res.json({ status: 'success', data: null })
  } catch (error) {
    console.error('重設密碼失敗:', error)
    return res.status(500).json({
      status: 'error',
      message: '伺服器錯誤，無法重設密碼',
      error: error.message, // 提供詳細錯誤訊息
      stack: error.stack, // 包含錯誤的堆疊訊息
    })
  }
})

export default router
