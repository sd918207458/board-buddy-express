import express from 'express'
import sequelize from '#configs/db.js'
const { Friends } = sequelize.models // 确保这是正确的

const router = express.Router()

router.post('/', async (req, res) => {
  const { user_id, friend_id } = req.body
  // 输出 user_id 和 friend_id 到主控台
  console.log('接收到的请求数据:', { user_id, friend_id })
  
  try {
    const existingFriend = await Friends.findOne({
      where: { user_id, friend_id }
    })
    
    if (existingFriend) {
      return res.status(400).json({ message: '已经发送过好友请求或已经是好友' })
    }
    
    const newFriend = await Friends.create({
      user_id,
      friend_id,
      status: 'accepted'
    })
    
    res.status(200).json(newFriend)
  } catch (error) {
    console.error('Error sending friend request:', error) // 打印错误信息
    res.status(500).json({ message: '服务器错误，无法处理好友请求' })
  }
})

export default router
