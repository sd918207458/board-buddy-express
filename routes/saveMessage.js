import express from 'express';
import sequelize from '#configs/db.js';
const { Messages } = sequelize.models; // 确保这是正确的

const router = express.Router();

router.post('/', async (req, res) => {
  const { userId, friendId, message } = req.body;

  // 打印接收到的数据
  console.log('Received data:', { userId, friendId, message });

  try {
    const newMessage1 = await Messages.create({
      sender_id: userId,
      receiver_id: friendId,
      content: message,
      timestamp: new Date(), // 添加时间戳
    });

    // const newMessage2 = await Messages.create({
    //   sender_id: friendId,
    //   receiver_id: userId,
    //   content: message,
    //   timestamp: new Date(), // 添加时间戳
    // });
    
    res.status(200).json(newMessage1);
  } catch (error) {
    console.error('保存消息失败:', error);
    res.status(500).json({ message: '服务器错误，无法保存消息', error: error.message });
  }
});

export default router;