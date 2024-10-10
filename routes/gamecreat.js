import express from 'express';
import { getIdParam } from '#db-helpers/db-tool.js';
import sequelize from '#configs/db.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Game_rooms } = sequelize.models;
const router = express.Router();

// multer的設定值
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'public/room/');
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname);
    },
});
const upload = multer({ storage });

// POST - 上傳頭像
router.post('/upload-room', upload.single('img'), async (req, res) => {
    const { room_id } = req.body;
    if (!room_id) {
        return res.status(400).json({ status: 'error', message: '缺少 room_id' });
    }

    if (req.file) {
        const newAvatar = req.file.originalname;
        const [affectedRows] = await Game_rooms.update(
            { img: newAvatar },
            { where: { room_id } }
        );

        if (!affectedRows) {
            return res.status(404).json({ status: 'error', message: '更新失败或没有数据被更新' });
        }

        const avatarUrl = `http://localhost:3005/room/${newAvatar}`;
        return res.json({ status: 'success', data: { img: avatarUrl } });
    } else {
        return res.status(400).json({ status: 'fail', message: '文件上传失败' });
    }
});

// 获取所有游戏房间
router.get('/', async (req, res) => {
    try {
        const rooms = await Game_rooms.findAll();
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
router.post('/', upload.single('img'), async (req, res) => {
    const { room_name, room_intro, minperson, maxperson, event_date, location, room_type, member_id, type1, type2, type3, roomrule, game1, game2, game3 } = req.body;

    // 验证必需字段
    if (!room_name || !minperson || !maxperson || !event_date || !room_type) {
        return res.status(400).json({ status: 'error', message: '缺少必填字段' });
    }

    const img = req.file ? req.file.filename : null;

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
            type1,
            type2,
            type3,
            game1,
            game2,
            game3,
            roomrule
        });

        res.status(201).json({ status: 'success', data: newRoom });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ status: 'error', message: '创建房间时发生错误' });
    }
});

// 更新游戏房间
router.put('/:id', upload.single('img'), async (req, res) => {
    const id = getIdParam(req);
    const updates = req.body;

    if (req.file) {
        updates.img = req.file.filename;
    }

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
