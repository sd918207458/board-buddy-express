import express from 'express'
const router = express.Router()

import jsonwebtoken from 'jsonwebtoken'

import authenticate from '../middlewares/jwt.js'

import { verifyUser, getUser } from '../models/users.js'

// 存取`.env`設定檔案使用
import 'dotenv/config.js'

// 定義安全的私鑰字串
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

// users demo data
//const users = [{ id: 3, username: 'eddy', password: '33333', role: 'admin' }]

// request new access token(re-connected)
router.get('/renew-token', authenticate, (req, res) => {
  const user = req.user

  const accessToken = jsonwebtoken.sign(
    { id: user.id, username: user.username, role: user.role },
    accessTokenSecret,
    { expiresIn: '24h' }
  )

  // create a new accessToken
  res.cookie('accessToken', accessToken, { httpOnly: true })

  // pass access token to react state
  res.json({
    accessToken,
  })
})

router.get('/private', authenticate, (req, res) => {
  const user = req.user

  return res.json({ message: 'authorized', user })
})

router.get('/check-login', authenticate, (req, res) => {
  const user = req.user

  return res.json({ message: 'authorized', user })
})

router.post('/login', async (req, res) => {
  console.log(req.body)
  // read username and password from request body
  const { username, password } = req.body

  // 先查詢資料庫是否有同username/password的資料
  const isMember = await verifyUser({
    username,
    password,
  })

  console.log(isMember)

  if (!isMember) {
    return res.json({ message: 'fail', code: '400' })
  }

  // 會員存在，將會員的資料取出
  const member = await getUser({
    username,
    password,
  })

  console.log(member)

  // generate an access token
  const accessToken = jsonwebtoken.sign({ ...member }, accessTokenSecret, {
    expiresIn: '24h',
  })

  // now in cookie httpOnly
  res.cookie('accessToken', accessToken, { httpOnly: true })

  // pass access token to react state
  res.json({
    accessToken,
  })
})

router.post('/logout', authenticate, (req, res) => {
  // clear token Cookie
  res.clearCookie('accessToken', { httpOnly: true })

  res.json({ message: 'Logout successful' })
})

// check login
router.get('/check-login', authenticate, (req, res) => {
  const accessToken = req.cookies.accessToken
  res.json({ message: 'login', accessToken })
})

// module.exports = router
export default router
