import express from 'express'
const router = express.Router()
// 專用處理sql字串的工具，主要format與escape，防止sql injection
// import sqlString from 'sqlstring'

// 檢查空物件
// import { isEmpty } from '../utils/tool.js'

import { findOne, insertOne, count } from '../models/base.js'

router.post('/', async function (req, res, next) {
  //get providerData
  const providerData = req.body

  console.log(JSON.stringify(providerData))

  // 檢查從react來的資料
  if (!providerData.providerId || !providerData.uid) {
    return res.json({ message: 'fail', code: '400' })
  }

  // 以下流程:
  // 1. 先查詢資料庫是否有同google_uid的資料
  // 2-1. 有存在 -> 執行登入工作
  // 2-2. 不存在 -> 建立一個新會員資料(無帳號與密碼)，只有google來的資料 -> 執行登入工作

  const isFound = await count('users', { google_uid: providerData.uid })

  if (isFound) {
    // 有存在 -> 執行登入工作

    const user = await findOne('users', { google_uid: providerData.uid })

    // 如果沒必要，member的password資料不應該，也不需要回應給瀏覽器
    delete user.password

    // 啟用session(這裡是用session cookie機制)
    req.session.userId = user.id

    return res.json({ message: 'success', code: '200', user })
  } else {
    // 3. 不存在 -> 建立一個新會員資料(無帳號與密碼)，只有google來的資料 -> 執行登入工作
    const newUser = {
      name: providerData.displayName,
      email: providerData.email,
      google_uid: providerData.uid,
      photo_url: providerData.photoURL,
    }

    await insertOne('users', newUser)

    const user = await findOne('users', { google_uid: providerData.uid })

    // 如果沒必要，member的password資料不應該，也不需要回應給瀏覽器
    delete user.password

    // 啟用session(這裡是用session cookie機制)
    req.session.userId = user.id

    return res.json({ message: 'success', code: '200', user })
  }
  //   // select db
  //   // 先查詢資料庫是否有同username的資料
  //   const sql = 'SELECT * FROM user WHERE google_uid =? LIMIT 1'

  //   const formatSql = sqlString.format(sql, [providerData.uid])

  //   try {
  //     // insert new row to db
  //     const [rows, fields] = await promisePool.query(formatSql)

  //     console.log(rows)

  //     // 有找到時，登入
  //     if (rows.length > 0) {
  //       const { id, name, username, email } = rows[0]

  //       // 啟用session
  //       req.session.userId = id

  //       return res.json({
  //         message: 'success',
  //         code: '200',
  //         user: { id, name, username, email },
  //       })

  //       //沒找到時，建立新的user
  //     } else {
  //       const user = {
  //         name: providerData.displayName,
  //         email: providerData.email,
  //         google_uid: providerData.uid,
  //         photo_url: providerData.photoURL,
  //         // providerData: JSON.stringify(providerData),
  //       }

  //       // 產生sql字串
  //       const set = []
  //       let setSql = ''
  //       let insertSql = ''

  //       for (const [key, value] of Object.entries(user)) {
  //         if (value) {
  //           // sqlString.escape是為了防止SQL Injection
  //           set.push(`${key} = ${sqlString.escape(value)}`)
  //         }
  //       }

  //       // 檢查
  //       if (!set.length) {
  //         return res.json({ message: 'fail', code: '400' })
  //       }

  //       setSql = ` SET ` + set.join(`, `)

  //       insertSql = `INSERT INTO user ${setSql}`

  //       console.log(insertSql)

  //       const [result] = await promisePool.query(insertSql)

  //       // 建立完成，讓會員登入
  //       if (result.insertId) {
  //         // 先查詢資料庫，剛新增的會員資料
  //         const sql = 'SELECT * FROM user WHERE id =? LIMIT 1'

  //         const formatSql = sqlString.format(sql, [result.insertId])

  //         const [rows, fields] = await promisePool.query(formatSql)

  //         console.log(rows)

  //         const { id, name, username, email } = rows[0]

  //         // 啟用session
  //         req.session.userId = id

  //         return res.json({
  //           message: 'success',
  //           code: '200',
  //           user: { id, name, username, email },
  //         })
  //       } else {
  //         return res.json({ message: 'fail', code: '400' })
  //       }
  //     }
  //   } catch (error) {
  //     console.log('db error occurred: ', error)
  //     return res.json({ message: 'error', code: '500' })
  //   }
})

export default router
