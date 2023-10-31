import jsonwebtoken from 'jsonwebtoken'

// 存取`.env`設定檔案使用
import 'dotenv/config.js'

// 獲得加密用字串
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

// 中介軟體middleware，用於檢查授權(authenticate)
export default function authenticate(req, res, next) {
  // const token = req.headers['authorization']
  const token = req.cookies.accessToken
  // console.log(token)

  // if no token
  if (!token) {
    return res.json({
      status: 'error',
      message: 'no access token',
    })
  }

  // verify的callback會帶有decoded payload(解密後的有效資料)，就是user的資料
  jsonwebtoken.verify(token, accessTokenSecret, (err, user) => {
    if (err) {
      return res.json({
        status: 'error',
        message: 'invalid access token',
      })
    }

    // 將user資料加到req中
    // FIXME: ?移除iat與exp屬性?
    req.user = user
    next()
  })
}
