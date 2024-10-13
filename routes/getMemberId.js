import express from 'express'
import sequelize from '#configs/db.js'
const { User } = sequelize.models // 确保这是正确的

const router = express.Router()

// POST - 搜索用户
router.post('/', async (req, res) => {
    const { username } = req.body
    console.log('Received username:', username) // 输出请求的用户名

    try {
        // 查找特定用户
        const user = await User.findOne({ where: { username }, raw: true })
        
        if (user) {
            console.log('Found user:', user) // 输出找到的用户
            res.json({ status: 'success', member_id: user.member_id }) // 返回 member_id
        } else {
            console.log('用户未找到')
            res.status(404).json({ status: 'fail', message: '用户未找到' }) // 用户未找到
        }
    } catch (error) {
        console.error('搜索用户时出错', error)
        res.status(500).json({ status: 'error', message: '搜索失败' })
    }
})

export default router
