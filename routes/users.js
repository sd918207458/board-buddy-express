import express from 'express'
const router = express.Router()

// 檢查空物件, 轉換req.params為數字
import { isEmpty, getIdParam } from '#utils/tool.js'

// 上傳檔案用使用multer(另一方案是使用express-fileupload)
import multer from 'multer'
const upload = multer({ dest: 'public/' })

import {
  find,
  // findOne,
  findOneById,
  insertOne,
  count,
  updateById,
  removeById,
} from '../db-utils/base.js'

import sequelize from '#configs/db/index.js'
const { User } = sequelize.models

// 使用者資料表名稱
const dbTable = 'users'

// GET - 得到所有會員資料
router.get('/', async function (req, res) {
  const users = await User.findAll()
  // 處理如果沒找到資料

  // 標準回傳JSON
  return res.json({ status: 'success', data: { users } })
})

// GET - 得到單筆資料(注意，有動態參數時要寫在GET區段最後面)
router.get('/:id', async function (req, res) {
  // 轉為數字
  const id = getIdParam(req)
  const user = await User.findByPk(id)
  return res.json({ status: 'success', data: { user } })
})

// POST - 上傳檔案用，使用express-fileupload
router.post('/upload', async function (req, res, next) {
  // req.files 所有上傳來的檔案
  // req.body 其它的文字欄位資料…
  console.log(req.files, req.body)

  if (req.files) {
    console.log(req.files.avatar) // 上傳來的檔案(欄位名稱為avatar)
    return res.json({ message: 'success', code: '200' })
  } else {
    console.log('沒有上傳檔案')
    return res.json({ message: 'fail', code: '409' })
  }
})

// POST - 上傳檔案用，使用multer
// 注意: 使用nulter會和express-fileupload衝突，所以要先註解掉express-fileupload的使用再作測試
// 在app.js中的app.use(fileUpload())
router.post(
  '/upload2',
  upload.single('avatar'), // 上傳來的檔案(這是單個檔案，欄位名稱為avatar)
  async function (req, res, next) {
    // req.file 即上傳來的檔案(avatar這個檔案)
    // req.body 其它的文字欄位資料…
    console.log(req.file, req.body)

    if (req.file) {
      console.log(req.file)
      return res.json({ message: 'success', code: '200' })
    } else {
      console.log('沒有上傳檔案')
      return res.json({ message: 'fail', code: '409' })
    }
  }
)

// POST - 新增會員資料
router.post('/', async function (req, res, next) {
  // 從react傳來的資料(json格式)，id由資料庫自動產生
  // 資料範例
  // {
  //     "name":"金妮",
  //     "email":"ginny@test.com",
  //     "username":"ginny",
  //     "password":"12345"
  // }

  // user是從瀏覽器來的資料
  const user = req.body

  // 檢查從瀏覽器來的資料，如果為空物件則失敗
  if (isEmpty(user)) {
    return res.json({ message: 'fail', code: '400' })
  }

  // 這裡可以再檢查從react來的資料，哪些資料為必要(name, username...)
  //console.log(user)

  // 先查詢資料庫是否有同username與email的資料
  const userCount = await count(dbTable, {
    username: user.username,
    email: user.email,
  })

  // 檢查使用者是否存在，不存在count會回傳0
  if (userCount) {
    return res.json({ message: 'fail', code: '400' })
  }

  // 新增至資料庫
  const result = await insertOne(dbTable, user)

  // 不存在insertId -> 新增失敗
  if (!result.insertId) {
    return res.json({ message: 'fail', code: '400' })
  }

  // 成功加入資料庫的回應
  return res.json({
    message: 'success',
    code: '200',
    user: { ...user, id: result.insertId },
  })
})

// PUT - 更新會員資料
router.put('/:id', async function (req, res, next) {
  const userId = req.params.userId
  const user = req.body
  console.log(userId, user)

  // 檢查是否有從網址上得到userId
  // 檢查從瀏覽器來的資料，如果為空物件則失敗
  if (!userId || isEmpty(user)) {
    return res.json({ status: 'error', code: '400' })
  }

  // 這裡可以再檢查從react來的資料，哪些資料為必要(name, username...)
  // console.log(user)

  // 對資料庫執行update
  const result = await updateById(dbTable, user, userId)

  console.log(result)

  // 沒有更新到任何資料 -> 失敗
  if (!result.affectedRows) {
    return res.json({ message: 'fail', code: '400' })
  }

  // 成功
  return res.json({ message: 'success', code: '200' })
})

// PUT - 刪除會員資料
router.delete('/:id', async function (req, res, next) {
  const id = getIdParam(req)

  const affectedRows = await User.destroy({
    where: {
      id,
    },
  })

  // 沒有更新到任何資料 -> 失敗
  if (!affectedRows) {
    return res.json({
      status: 'fail',
      message: 'Unable to detele.',
    })
  }

  // 成功
  return res.json({ status: 'success', data: null })
})

export default router
