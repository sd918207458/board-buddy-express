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

// multer的設定值 - START
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    // 存放目錄
    callback(null, 'public/avatar/')
  },
  filename: function (req, file, callback) {
    // 經授權後，req.user帶有會員的member_id
    const newFilename = req.user.member_id // 使用 member_id 作為檔名
    callback(null, newFilename + path.extname(file.originalname))
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
  // 手動映射 req.user.id 為 req.user.member_id
  if (req.user && req.user.id) {
    req.user.member_id = req.user.id
  }

  const member_id = getIdParam(req)

  // 檢查是否為授權會員，只有授權會員可以存取自己的資料
  if (req.user.member_id !== member_id) {
    return res.json({ status: 'error', message: '存取會員資料失敗' })
  }

  const user = await User.findByPk(member_id, {
    raw: true, // 只需要資料表中資料
  })

  // 不回傳密碼
  delete user.password

  return res.json({ status: 'success', data: { user } })
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
    if (req.user && req.user.id) {
      req.user.member_id = req.user.id
    }

    if (!req.user.member_id) {
      return res.status(400).json({ message: '無效的使用者 ID' })
    }

    if (req.file) {
      const member_id = req.user.member_id
      const newAvatar = `${member_id}${path.extname(req.file.originalname)}` // 使用 member_id 作為檔名

      // 更新資料庫中的 avatar 欄位
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

      // 返回圖片的完整URL
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
  // 手動映射 req.user.id 為 req.user.member_id
  if (req.user && req.user.id) {
    req.user.member_id = req.user.id
  }

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

// PUT - 更新會員資料(排除更新密碼)
router.put('/update', authenticate, async function (req, res) {
  const member_id = req.user.member_id

  if (!member_id) {
    return res.json({ status: 'error', message: '無效的用戶ID' })
  }

  const user = req.body

  if (!user.username || !user.emailAddress || !user.phone) {
    return res.json({ status: 'error', message: '缺少必要資料' })
  }

  const [affectedRows] = await User.update(
    {
      username: user.username,
      email: user.emailAddress,
      phone_number: user.phone,
      first_name: user.first_name,
      last_name: user.last_name,
      date_of_birth: user.birthday,
      gender: user.gender,
      favorite_games: user.gameType,
      preferred_play_times: user.playTime,
      avatar: user.avatar, // 更新頭像
    },
    { where: { member_id } }
  )

  if (!affectedRows) {
    return res.json({ status: 'error', message: '更新失敗或沒有資料被更新' })
  }

  return res.json({ status: 'success', message: '資料已成功更新' })
})

// DELETE - 刪除會員資料
router.delete('/:id', async function (req, res) {
  // 手動映射 req.user.id 為 req.user.member_id
  if (req.user && req.user.id) {
    req.user.member_id = req.user.id
  }

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
