import express from 'express'
const router = express.Router()

import jsonwebtoken from 'jsonwebtoken'
// 中介軟體，存取隱私會員資料用
import authenticate from '#middlewares/authenticate.js'

// 存取`.env`設定檔案使用
import 'dotenv/config.js'

// 資料庫使用
import { QueryTypes } from 'sequelize'
import sequelize from '#configs/db.js'
const { User } = sequelize.models

// 驗証加密密碼字串用
import { compareHash } from '#db-helpers/password-hash.js'

// 定義安全的私鑰字串
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

// 檢查登入狀態用
router.get('/check', authenticate, async (req, res) => {
  try {
    console.log('Looking for user with ID:', req.user.id) // 打印 id 來調試

    // 查詢資料庫目前的資料
    const user = await User.findByPk(req.user.id, {
      raw: true, // 只需要資料表中資料
    })

    if (!user) {
      console.log('User not found')
      // 如果找不到該用戶，返回 404 錯誤
      return res.status(404).json({ status: 'error', message: '使用者不存在' })
    }

    // 不回傳密碼值
    delete user.password_hash

    return res.json({ status: 'success', data: { user } })
  } catch (error) {
    console.error('伺服器錯誤:', error)
    return res.status(500).json({ status: 'error', message: '伺服器錯誤' })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body // 使用 email 而不是 username

  // 檢查從前端來的資料是否齊全
  if (!email || !password) {
    return res.status(400).json({ status: 'fail', message: '缺少必要資料' })
  }

  try {
    // 查詢資料庫，檢查使用者是否存在 (改為使用 email)
    const user = await User.findOne({
      where: { email },
      raw: true, // 只需要資料表中的資料
    })

    if (!user) {
      // 如果使用者不存在，返回錯誤
      return res.status(401).json({ status: 'error', message: '使用者不存在' })
    }

    // 驗證密碼
    const isValid = await compareHash(password, user.password_hash)

    if (!isValid) {
      // 如果密碼驗證失敗，返回錯誤
      return res.status(401).json({ status: 'error', message: '密碼錯誤' })
    }

    // 存取令牌，只需要id和email即可
    const returnUser = {
      id: user.member_id, // 確保傳遞的是 member_id
      email: user.email,
    }

    const accessToken = jsonwebtoken.sign(returnUser, accessTokenSecret, {
      expiresIn: '3d',
    })

    // 將存取令牌存放於cookie中
    res.cookie('accessToken', accessToken, { httpOnly: true })

    // 傳送登入成功訊息
    return res.json({
      status: 'success',
      data: { accessToken },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ status: 'error', message: '伺服器錯誤' })
  }
})

router.post('/logout', authenticate, (req, res) => {
  // 清除cookie
  res.clearCookie('accessToken', { httpOnly: true })
  res.json({ status: 'success', data: null })
})

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' })
    }

    const newUser = await User.create({
      username,
      email,
      password_hash: password, // 這將由模型的 'beforeCreate' 鈎子自動加密
    })

    return res
      .status(201)
      .json({ message: 'User registered successfully', newUser })
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: `${error.errors[0].path} already exists`,
      })
    }

    console.error('Server Error:', error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
})

export default router
