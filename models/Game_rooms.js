import { DataTypes } from 'sequelize'

export default async function (sequelize) {
  return sequelize.define(
    'Game_Rooms',
    {
      room_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      room_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      room_intro: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      minperson: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      maxperson: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      creation_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      event_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      img: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      room_type: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      game1: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      game2: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      game3: {
        type: DataTypes.STRING(255),
        allowNull: true,
        charset: 'utf8mb4', // 设置字符集
        collate: 'utf8mb4_0900_ai_ci', // 设置排序规则
      },
      roomrule: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
    },
    {
      tableName: 'game_rooms', // 直接提供資料表名稱
      timestamps: true, // 使用時間戳
      paranoid: false, // 軟性刪除
      underscored: true, // 所有自動建立欄位，使用snake_case命名
      createdAt: 'created_at', // 建立的時間戳
      updatedAt: 'updated_at', // 更新的時間戳
    }
  )
}
