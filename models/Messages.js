import { DataTypes } from 'sequelize';

export default function (sequelize) {
  return sequelize.define(
    'Messages',
    {
      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      receiver_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.ENUM('sent', 'delivered', 'read'),
        defaultValue: 'sent',
      },
    },
    {
      tableName: 'msg',
      timestamps: false, // 因为 timestamp 是由数据库自动管理的
    }
  );
}
