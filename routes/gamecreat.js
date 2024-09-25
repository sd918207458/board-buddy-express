import express from 'express';
import { getIdParam } from '#db-helpers/db-tool.js';
import sequelize from '#configs/db.js';
const { Game_rooms } = sequelize.models; // 确保这是正确的

const router = express.Router();

// 获取所有游戏房间
router.get('/', async (req, res) => {
    try {
        const rooms = await Game_rooms.findAll({ raw: true });
        res.json({ status: 'success', data: rooms });
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ status: 'error', message: '无法获取房间数据' });
    }
});

// 获取单个游戏房间
router.get('/:id', async (req, res) => {
    const id = getIdParam(req);

    try {
        const room = await Game_rooms.findByPk(id, { raw: true });
        if (!room) {
            return res.status(404).json({ status: 'error', message: '房间未找到' });
        }
        res.json({ status: 'success', data: room });
    } catch (error) {
        console.error('Error fetching room:', error);
        res.status(500).json({ status: 'error', message: '无法获取房间数据' });
    }
});

// 创建新的游戏房间
router.post('/', async (req, res) => {
    const { room_name, room_intro, minperson, maxperson, event_date, location, img, room_type, member_id } = req.body;

    // 验证必需字段
    if (!room_name || !minperson || !maxperson || !event_date) {
        return res.status(400).json({ status: 'error', message: '缺少必填字段' });
    }

    try {
        const newRoom = await Game_rooms.create({
            room_name,
            room_intro,
            minperson,
            maxperson,
            creation_date: new Date(),
            event_date,
            location,
            img,
            room_type,
            member_id: member_id || null,
        });

        res.status(201).json({ status: 'success', data: newRoom });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// 更新游戏房间
router.put('/:id', async (req, res) => {
    const id = getIdParam(req);
    const updates = req.body;

    try {
        const [updated] = await Game_rooms.update(updates, { where: { room_id: id } });
        if (!updated) {
            return res.status(404).json({ status: 'error', message: '房间未找到' });
        }
        res.json({ status: 'success', message: '房间更新成功' });
    } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({ status: 'error', message: '内部服务器错误' });
    }
});

// 删除游戏房间
router.delete('/:id', async (req, res) => {
    const id = getIdParam(req);

    try {
        const deleted = await Game_rooms.destroy({ where: { room_id: id } });
        if (!deleted) {
            return res.status(404).json({ status: 'error', message: '房间未找到' });
        }
        res.json({ status: 'success', message: '房间删除成功' });
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ status: 'error', message: '内部服务器错误' });
    }
});

export default router;
