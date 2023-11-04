import express from 'express'
const router = express.Router()

// 檢查空物件, 轉換req.params為數字
import { isEmpty } from '#utils/tool.js'
import { getIdParam } from '#db-helpers/db-tool.js'

// 資料庫使用
import sequelize from '#configs/db.js'
const { User } = sequelize.models
// 驗証加密密碼字串用
import { compareHash } from '#db-helpers/password-hash.js'

// 上傳檔案用使用multer
import path from 'path'
import multer from 'multer'

// multer的設定值 - START
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
// multer的設定值 - END

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

  // 檢查從前端來的資料哪些為必要(name, username...)
  if (
    !newUser.username ||
    !newUser.email ||
    !newUser.name ||
    !newUser.password
  ) {
    return res.json({ status: 'error', message: '缺少必要資料' })
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

  // 新增失敗 created=false 代表沒新增
  if (!created) {
    return res.json({ status: 'error', message: '建立會員失敗' })
  }

  // 成功建立會員的回應
  // 狀態`201`是建立資料的標準回應，
  // 如有必要可以加上`Location`會員建立的uri在回應標頭中，或是回應剛建立的資料
  // res.location(`/users/${user.id}`)
  return res.status(201).json({
    status: 'success',
    data: null,
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
  const loginUser = req.body

  // 檢查是否有從網址上得到id
  // 檢查從瀏覽器來的資料，如果為空物件則失敗
  if (!id || isEmpty(loginUser)) {
    return res.json({ status: 'error', message: '缺少必要資料' })
  }

  //檢查從前端來的資料哪些為必要(name, ...)
  if (!loginUser.email || !loginUser.name || !loginUser.password) {
    return res.json({ status: 'error', message: '缺少必要資料' })
  }

  // 查詢
  // const dbUser = await User.findOne({
  //   where: {
  //     id,
  //   },
  //   raw: true, // 只需要資料表中資料
  // })
  const dbUser = await User.findByPk(id, {
    raw: true, // 只需要資料表中資料
  })

  // user=null代表不存在
  if (!dbUser) {
    return res.json({ status: 'error', message: '使用者不存在' })
  }

  console.log(loginUser.password)
  console.log(dbUser)

  // 比較密碼hash與登入用的密碼字串正確性
  // isValid=true 代表正確
  const isValid = await compareHash(loginUser.password, dbUser.password)

  // isValid=false 代表密碼錯誤
  if (!isValid) {
    return res.json({ status: 'error', message: '密碼錯誤' })
  }

  // 更新時，略過password
  const newUser = { ...loginUser }
  delete newUser.password

  console.log(newUser)

  // 對資料庫執行update
  const [affectedRows] = await User.update(newUser, {
    where: {
      id,
    },
    //individualHooks: true, // 加密密碼字串用trigger the beforeUpdate hook
  })

  console.log(affectedRows)

  // 沒有更新到任何資料 -> 失敗
  if (!affectedRows) {
    return res.json({ status: 'error', message: '更新失敗' })
  }

  // 成功
  // 查出更新的資料
  const updatedUser = await User.findByPk(id, {
    raw: true, // 只需要資料表中資料
  })

  delete updatedUser.password
  console.log(updatedUser)
  // user的password資料不應該也不需要回應給瀏覽器

  // 回傳
  return res.json({ status: 'success', data: { user: updatedUser } })
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
