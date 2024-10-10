import express from 'express'
import sequelize from '#configs/db.js'
const { Friends, User } = sequelize.models // 确保这两个模型存在并已正确导入

const router = express.Router()

// 获取好友列表
router.post('/', async (req, res) => {
  const { user_id } = req.body // 从请求中获取 user_id
  console.log('Received user_id:', user_id) // 输出请求的 user_id

  try {
    // 1. 从 Friends 表中查找所有 user_id 匹配的记录
    const friends = await Friends.findAll({
      attributes: ['friend_id'], // 只获取 friend_id
      where: { user_id: user_id },
    })

    // 2. 提取 friend_id 的数组
    const friendIds = friends.map(friend => friend.friend_id)
    console.log("提取的 friend_id 数组:", friendIds) // 输出提取的 friend_id

    // 确认 friendIds 数组是否为空，或是否包含正确的 ID
    if (friendIds.length === 0) {
      return res.status(404).json({ status: 'error', message: '没有找到好友' })
    }

    // 3. 使用 friend_id 数组，在 User 表中查找对应的用户信息
    const friendDetails = await User.findAll({
      where: { member_id: friendIds }, // 确保使用 member_id 查询
      attributes: ['member_id', 'username', 'avatar'], // 获取用户详细信息
      raw: true,
    })

    // 4. 返回找到的好友详细信息
    if (friendDetails.length === 0) {
      return res.status(404).json({ status: 'error', message: '没有找到好友' })
    }

    res.json({ status: 'success', data: friendDetails }) // 返回好友详细信息
  } catch (error) {
    console.error('获取好友数据失败:', error.message) // 输出错误消息
    console.error('错误详情:', error) // 输出完整的错误信息，包括堆栈
    res.status(500).json({ status: 'error', message: '服务器错误，获取好友数据失败' })
  }
})

export default router
