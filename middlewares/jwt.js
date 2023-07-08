import jsonwebtoken from 'jsonwebtoken'

// 存取`.env`設定檔案使用
import 'dotenv/config.js'

// 獲得加密用字串
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

// 中介軟體middleware，用於檢查是否在認証情況下
export default function authenticate(req, res, next) {
  //const token = req.headers['authorization']
  const token = req.cookies.accessToken
  console.log(token)

  // if no token
  if (!token) {
    return res.status(403).json({ message: 'Forbidden' })
  }

  if (token) {
    jsonwebtoken.verify(token, accessTokenSecret, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Forbidden' })
      }

      req.user = user
      next()
    })
  } else {
    return res.status(401).json({ message: 'Unauthorized' })
  }
}
