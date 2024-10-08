import express from 'express';
import { getIdParam } from '#db-helpers/db-tool.js';
import sequelize from '#configs/db.js';
const { Room_add } = sequelize.models; // 确保这是正确的

const router = express.Router();

// 加入房间的路由
router.post('/', async (req, res) => {
    const { room_id, member_id } = req.body;

    // 验证必需字段
    if (!room_id) {
        return res.status(400).json({ status: 'error', message: '缺少必填字段 room_id' });
    }

    try {
        // 创建加入记录
        const roomAddEntry = await Room_add.create({
            room_id,
            member_id: member_id || null // member_id 可以为空
        });

        res.status(201).json({ status: 'success', data: roomAddEntry });
    } catch (error) {
        console.error('Error adding member to room:', error);
        res.status(500).json({ status: 'error', message: '加入房间时出错' });
    }
});

export default router;
