import express from 'express'
import sequelize from '#configs/db.js'
const { User } = sequelize.models // 确保这是正确的

const router = express.Router()

// POST - 搜索用户
router.post('/', async (req, res) => {
  const { username } = req.body
  console.log('Received username:', username) // 输出请求的用户名

  try {
    const users = await User.findAll({ raw: true })
    console.log('Found users:', users) // 输出找到的用户
    res.json({ status: 'success', data: users })
  } catch (error) {
    console.error('搜索用户时出错', error)
    res.status(500).json({ status: 'error', message: '搜索失败' })
  }
})

// // POST - 发送好友请求
// router.post('/sendFriendRequest', authenticate, async (req, res) => {
//   const { userId } = req.body

//   try {
//     await FriendRequest.create({
//       requesterId: req.user.member_id, // 从请求中获取发起者 ID
//       recipientId: userId,
//       status: 'pending',
//     })

//     return res.json({ status: 'success', message: '好友请求已发送' }) // 包装响应
//   } catch (error) {
//     console.error('发送好友请求时出错', error)
//     return res.status(500).json({ status: 'error', message: '发送请求失败' }) // 返回错误信息
//   }
// })

// // GET - 获取好友请求列表
// router.get('/friend-requests', authenticate, async (req, res) => {
//   try {
//     const requests = await FriendRequest.findAll({
//       where: {
//         recipientId: req.user.member_id,
//         status: 'pending',
//       },
//       include: [{ model: User, attributes: ['member_id', 'username', 'avatar'] }], // 包含请求者的信息
//     })

//     return res.json({ status: 'success', data: requests }) // 包装响应
//   } catch (error) {
//     console.error('获取好友请求时出错', error)
//     return res.status(500).json({ status: 'error', message: '获取请求失败' }) // 返回错误信息
//   }
// })

// // PUT - 接受好友请求
// router.put('/acceptFriendRequest/:id', authenticate, async (req, res) => {
//   const requestId = req.params.id

//   try {
//     const request = await FriendRequest.findByPk(requestId)

//     if (!request || request.recipientId !== req.user.member_id) {
//       return res.status(404).json({ status: 'error', message: '请求不存在或您没有权限' })
//     }

//     request.status = 'accepted'
//     await request.save()

//     return res.json({ status: 'success', message: '好友请求已接受' }) // 包装响应
//   } catch (error) {
//     console.error('接受好友请求时出错', error)
//     return res.status(500).json({ status: 'error', message: '接受请求失败' }) // 返回错误信息
//   }
// })

// // DELETE - 拒绝好友请求
// router.delete('/declineFriendRequest/:id', authenticate, async (req, res) => {
//   const requestId = req.params.id

//   try {
//     const request = await FriendRequest.findByPk(requestId)

//     if (!request || request.recipientId !== req.user.member_id) {
//       return res.status(404).json({ status: 'error', message: '请求不存在或您没有权限' })
//     }

//     await request.destroy()

//     return res.json({ status: 'success', message: '好友请求已拒绝' }) // 包装响应
//   } catch (error) {
//     console.error('拒绝好友请求时出错', error)
//     return res.status(500).json({ status: 'error', message: '拒绝请求失败' }) // 返回错误信息
//   }
// })

export default router
