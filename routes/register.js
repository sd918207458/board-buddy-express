import express from 'express'
import { generateHash } from '#db-helpers/password-hash.js' // 密碼加密函數
import { Op } from 'sequelize'
import sequelize from '#configs/db.js' // 引入 Sequelize 實例

const router = express.Router()

const { Member_List } = sequelize.models // 從 sequelize.models 中取得 User 模型

// POST - 新增會員資料(註冊用)
router.post('/register', async function (req, res) {
  // 從請求中獲取註冊所需資料
  const { name, username, email, password } = req.body

  // 檢查來自前端的必要資料是否存在
  if (!name || !username || !email || !password) {
    return res.status(400).json({ status: 'error', message: '缺少必要資料' })
  }

  try {
    // 檢查是否已經有相同的 username 或 email
    const existingUser = await Member_List.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    })

    if (existingUser) {
      return res
        .status(400)
        .json({ status: 'error', message: '用戶名或電子郵件已被使用' })
    }

    // 加密密碼
    const passwordHash = await generateHash(password)

    // 創建新會員
    const newUser = await Member_List.create({
      name,
      username,
      email,
      password: passwordHash, // 保存加密後的密碼
    })

    // 註冊成功，返回成功信息
    return res.status(201).json({
      status: 'success',
      message: '註冊成功',
      data: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
      },
    })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ status: 'error', message: '伺服器錯誤，請稍後再試' })
  }
})

export default router
