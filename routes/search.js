// routes/gameRooms.js
import express from 'express';
import { getIdParam } from '#db-helpers/db-tool.js';
import sequelize from '#configs/db.js';
const { Game_rooms } = sequelize.models; // 确保这是正确的

const router = express.Router();

// 获取所有游戏房间数据的路由
router.get('/', async (req, res) => {
  try {
    const gameRooms = await Game_rooms.findAll();
    res.json(gameRooms);
  } catch (error) {
    console.error('Error fetching game rooms:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router
