import express from 'express'
const router = express.Router()

// 中介軟體，存取隱私會員資料用
import authenticate from '#middlewares/authenticate.js'

// 檢查空物件, 轉換req.params為數字
import { getIdParam } from '#db-helpers/db-tool.js'

// 資料庫使用
import { Op } from 'sequelize'
import sequelize from '#configs/db.js'
const { User } = sequelize.models

// 驗証加密密碼字串用
import { compareHash } from '#db-helpers/password-hash.js'

// 上傳檔案用使用multer
import path from 'path'
import multer from 'multer'

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

// GET - 取得當前用戶的資料
router.get('/check', authenticate, async (req, res) => {
  try {
    const userId = req.user.id // 從 req.user 取得解碼後的 user ID
    const user = await User.findByPk(userId, { raw: true })

    if (!user) {
      return res.status(404).json({ status: 'error', message: '使用者不存在' })
    }

    // 不回傳密碼
    delete user.password_hash

    return res.json({ status: 'success', data: { user } })
  } catch (error) {
    console.error('伺服器錯誤:', error.message)
    return res.status(500).json({ status: 'error', message: '伺服器錯誤' })
  }
})

// multer的設定值 - START
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    // 存放目錄
    callback(null, 'public/avatar/')
  },
  filename: function (req, file, callback) {
    // 使用原始檔案名稱
    const newFilename = file.originalname
    callback(null, newFilename) // 保留原始名稱
  },
})
const upload = multer({ storage: storage })
// multer的設定值 - END

// GET - 得到所有會員資料
router.get('/', async function (req, res) {
  const users = await User.findAll({ logging: console.log })
  return res.json({ status: 'success', data: { users } })
})

// GET - 得到單筆資料
router.get('/:id', authenticate, async function (req, res) {
  const member_id = getIdParam(req) // 從 URL 參數中獲取 member_id

  // 檢查是否為授權會員，只有授權會員可以存取自己的資料
  if (req.user.member_id !== member_id) {
    return res
      .status(403)
      .json({ status: 'error', message: '存取會員資料失敗' })
  }

  try {
    const user = await User.findByPk(member_id, {
      raw: true, // 只需要資料表中的資料
    })

    if (!user) {
      return res.status(404).json({ status: 'error', message: '會員不存在' })
    }

    // 不回傳密碼
    delete user.password_hash

    return res.status(200).json({ status: 'success', data: { user } })
  } catch (error) {
    console.error('獲取用戶資料失敗:', error.message)
    return res.status(500).json({ status: 'error', message: '伺服器錯誤' })
  }
})

// POST - 新增會員資料
router.post('/', async function (req, res) {
  const newUser = req.body

  // 檢查從前端來的資料哪些為必要
  if (
    !newUser.username ||
    !newUser.email ||
    !newUser.name ||
    !newUser.password
  ) {
    return res.json({ status: 'error', message: '缺少必要資料' })
  }

  const [user, created] = await User.findOrCreate({
    where: {
      [Op.or]: [{ username: newUser.username }, { email: newUser.email }],
    },
    defaults: {
      name: newUser.name,
      password: newUser.password,
      username: newUser.username,
      email: newUser.email,
    },
  })

  if (!created) {
    return res.json({ status: 'error', message: '建立會員失敗' })
  }

  return res.status(201).json({
    status: 'success',
    data: null,
  })
})

// POST - 上傳頭像
router.post(
  '/upload-avatar',
  authenticate,
  upload.single('avatar'),
  async function (req, res) {
    const member_id = req.user.member_id || req.user.id // 檢查 member_id 和 id

    if (!member_id) {
      return res.status(400).json({ message: '無效的使用者 ID' })
    }

    if (req.file) {
      const newAvatar = req.file.originalname

      const [affectedRows] = await User.update(
        { avatar: newAvatar },
        { where: { member_id } }
      )

      if (!affectedRows) {
        return res.json({
          status: 'error',
          message: '更新失敗或沒有資料被更新',
        })
      }

      const avatarUrl = `http://localhost:3005/avatar/${newAvatar}`

      return res.json({
        status: 'success',
        data: { avatar: avatarUrl },
      })
    } else {
      return res.json({ status: 'fail', data: null })
    }
  }
)

// PUT - 更新會員資料(密碼更新用)
router.put('/:id/password', authenticate, async function (req, res) {
  const member_id = getIdParam(req)

  if (req.user.member_id !== member_id) {
    return res.json({ status: 'error', message: '存取會員資料失敗' })
  }

  const userPassword = req.body

  if (!member_id || !userPassword.origin || !userPassword.new) {
    return res.json({ status: 'error', message: '缺少必要資料' })
  }

  const dbUser = await User.findByPk(member_id, { raw: true })

  if (!dbUser) {
    return res.json({ status: 'error', message: '使用者不存在' })
  }

  const isValid = await compareHash(userPassword.origin, dbUser.password)

  if (!isValid) {
    return res.json({ status: 'error', message: '密碼錯誤' })
  }

  const [affectedRows] = await User.update(
    { password: userPassword.new },
    {
      where: { member_id },
      individualHooks: true,
    }
  )

  if (!affectedRows) {
    return res.json({ status: 'error', message: '更新失敗' })
  }

  return res.json({ status: 'success', data: null })
})

// PUT - 更新會員資料
router.put('/update', authenticate, async (req, res) => {
  const userId = req.user.id

  const {
    username,
    emailAddress,
    phone,
    first_name,
    last_name,
    birthday,
    gender,
    avatar,
  } = req.body

  if (!username || !emailAddress || !phone) {
    return res.status(400).json({
      status: 'error',
      message: '缺少必要資料',
    })
  }

  try {
    const [updated] = await User.update(
      {
        username,
        email: emailAddress,
        phone_number: phone,
        first_name,
        last_name,
        date_of_birth: birthday,
        gender,
        avatar, // 更新頭像
      },
      { where: { member_id: userId } }
    )

    if (updated) {
      return res.json({ status: 'success', message: '資料已成功更新' })
    }

    return res.status(400).json({
      status: 'error',
      message: '更新失敗，資料未更改',
    })
  } catch (error) {
    console.error('伺服器錯誤:', error.message)
    return res.status(500).json({ status: 'error', message: '伺服器錯誤' })
  }
})

// DELETE - 刪除會員資料
router.delete('/:id', authenticate, async function (req, res) {
  const member_id = getIdParam(req)

  const affectedRows = await User.destroy({ where: { member_id } })

  if (!affectedRows) {
    return res.json({
      status: 'fail',
      message: 'Unable to delete.',
    })
  }

  return res.json({ status: 'success', data: null })
})

export default router
