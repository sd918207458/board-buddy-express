import express from 'express'
import multer from 'multer'
import path from 'path'
import sequelize from '#configs/db.js'
const { memberlist } = sequelize.models

const router = express.Router()

// 設置儲存路徑與檔名
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/') // 指定圖片儲存的資料夾
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)) // 使用時間戳 + 原始副檔名
  },
})

const upload = multer({ storage })

// 上傳圖片API
router.post('/upload-avatar', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: '沒有選擇檔案' })
    }

    const profile_picture_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
    const memberId = req.memberlist.id

    await memberlist.update(
      { profile_picture_url: profile_picture_url },
      { where: { id: memberId } }
    )

    res.json({ status: 'success', profile_picture_url })
  } catch (error) {
    console.error('上傳錯誤:', error)
    res.status(500).json({ status: 'error', message: '上傳失敗' })
  }
})

export default router
