import express from 'express';
import sequelize from '#configs/db.js'; // 确保路径正确

const { Room_history } = sequelize.models; // 确保这是正确的模型名

const router = express.Router();

// 处理加入最爱请求
router.post('/', async (req, res) => {
    const { room_id, member_id, img, room_name, room_intro, room_type, game1, game2, game3, location, event_date } = req.body;

    try {
        // 将接收到的游戏数据保存到数据库
        const newFavorite = await Room_history.create({
            room_id,
            member_id,
            img,
            room_name,
            room_intro,
            room_type,
            game1,
            game2,
            game3,
            location,
            event_date,
        });

        // 成功后返回新创建的记录
        res.status(200).json({ message: '加入房間成功', favorite: newFavorite });
    } catch (error) {
        console.error('加入房間时发生错误:', error);
        res.status(500).json({ message: '加入房間失败' });
    }
});

// 获取所有已加入最爱的房间信息
router.get('/', async (req, res) => {
    try {
        // 从数据库中获取所有 Room_heart 数据
        const favorites = await Room_history.findAll();

        if (favorites.length === 0) {
            return res.status(404).json({ message: '没有找到任何房间' });
        }

        // 返回所有最爱房间信息
        res.status(200).json(favorites);
    } catch (error) {
        console.error('获取房间时发生错误:', error);
        res.status(500).json({ message: '获取房间失败' });
    }
});

export default router;
