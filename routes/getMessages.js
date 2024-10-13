import express from 'express'
import sequelize from '#configs/db.js'
import { Op } from 'sequelize'
const { Messages } = sequelize.models // 确保这是正确的

const router = express.Router()

router.post('/', async (req, res) => {
  console.log('收到请求:', req.body)
  const { userId, friendId } = req.body
  console.log('2222userId, friendId:', { userId, friendId })

  try {
    const messages = await Messages.findAll();
    console.log('所有消息:', messages); // 查看所有消息
    res.status(200).json({ messages });
  } catch (error) {
    console.error('获取消息失败:', error.message, error.stack)
    res.status(500).json({ message: '服务器错误，无法获取消息' })
  }
})

export default router
