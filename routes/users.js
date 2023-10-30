import express from 'express'
const router = express.Router()

// 檢查空物件, 轉換req.params為數字
import { isEmpty } from '#utils/tool.js'
import { getIdParam } from '#utils/db-tool.js'

// 資料庫使用
import sequelize from '#configs/db/index.js'
const { User } = sequelize.models

// 上傳檔案用使用multer(另一方案是使用express-fileupload)
import path from 'path'
import multer from 'multer'

// multer的設定值
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    // 存放目錄
    callback(null, 'public/')
  },
  filename: function (req, file, callback) {
    // 新檔名由表單傳來的req.body.newFilename決定
    callback(null, req.body.newFilename + path.extname(file.originalname))
  },
})

const upload = multer({ storage: storage })

// GET - 得到所有會員資料
router.get('/', async function (req, res) {
  const users = await User.findAll({ logging: console.log })
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

// POST - 新增會員資料
router.post('/', async function (req, res) {
  // req.body資料範例
  // {
  //     "name":"金妮",
  //     "email":"ginny@test.com",
  //     "username":"ginny",
  //     "password":"12345"
  // }

  // 要新增的會員資料
  const newUser = req.body

  // 檢查從瀏覽器來的資料，如果為空物件則失敗
  if (isEmpty(newUser)) {
    return res.json({ status: 'fail', data: null })
  }

  // 檢查從前端來的資料哪些為必要(name, username...)
  if (
    !newUser.username ||
    !newUser.email ||
    !newUser.name ||
    !newUser.password
  ) {
    return res.json({ status: 'fail', data: null })
  }

  // 執行後user是建立的會員資料，created為布林值
  // where指的是不可以有相同的資料，如username與email不能有相同的
  // defaults用於建立新資料用
  const [user, created] = await User.findOrCreate({
    where: { username: newUser.username, email: newUser.email },
    defaults: {
      name: newUser.name,
      password: newUser.password,
    },
  })

  // 新增失敗 created=false代表沒新增
  if (!created) {
    return res.json({ status: 'fail', data: null })
  }

  // 成功建立會員的回應
  return res.json({
    status: 'success',
    data: { user },
  })
})

// POST - 可同時上傳與更新會員檔案用，使用multer(設定值在此檔案最上面)
router.post(
  '/upload',
  upload.single('avatar'), // 上傳來的檔案(這是單個檔案，表單欄位名稱為avatar)
  async function (req, res) {
    // req.file 即上傳來的檔案(avatar這個檔案)
    // req.body 其它的文字欄位資料…
    console.log(req.file, req.body)

    if (req.file) {
      return res.json({ status: 'success', data: null })
    } else {
      return res.json({ status: 'fail', data: null })
    }
  }
)

// PUT - 更新會員資料
router.put('/:id', async function (req, res) {
  const id = getIdParam(req)
  const newUser = req.body

  // 檢查是否有從網址上得到id
  // 檢查從瀏覽器來的資料，如果為空物件則失敗
  if (!id || isEmpty(newUser)) {
    return res.json({ status: 'fail', data: null })
  }

  //檢查從前端來的資料哪些為必要(name, username...)
  if (
    !newUser.username ||
    !newUser.email ||
    !newUser.name ||
    !newUser.password
  ) {
    return res.json({ status: 'fail', data: null })
  }

  // 對資料庫執行update
  const [affectedRows] = await User.update(newUser, {
    where: {
      id,
    },
  })

  console.log(affectedRows)

  // 沒有更新到任何資料 -> 失敗
  if (!affectedRows) {
    return res.json({ status: 'fail', data: null })
  }

  // 成功
  // 查出更新的資料
  const user = await User.findByPk(id)
  // 回傳
  return res.json({ status: 'success', data: { user } })
})

// DELETE - 刪除會員資料
router.delete('/:id', async function (req, res) {
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
