import express from 'express';
import GameRoom from '../models/Game_rooms.js'; // 根据你的目录结构修改路径

const router = express.Router();

// 创建房间的 API 路由
router.post('/game-creatroom', async (req, res) => {
    const { room_name, room_intro, minperson, maxperson, creation_date, event_date, location, img, room_type, game1, game2, game3, roomrule, member_id } = req.body;

    try {
        // 验证 member_id 是否有效（假如你有用户表进行验证）
        if (member_id && !await validateMember(member_id)) {
            return res.status(400).json({ error: 'Invalid member ID' });
        }

        const newRoom = await GameRoom.create({
            room_name,
            room_intro,
            minperson,
            maxperson,
            creation_date: creation_date || new Date(), // 如果没有传递，则使用当前时间
            event_date,
            location,
            img,
            room_type,
            game1,
            game2,
            game3,
            roomrule,
            member_id: member_id || null,
        });

        res.status(201).json(newRoom);
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



export default router;
