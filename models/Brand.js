import { DataTypes } from 'sequelize'

export default async function (sequelize) {
  return sequelize.define(
    'Brand',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // 確保自動遞增
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // 確保品牌名稱唯一
      },
      img: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      info: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'brand', // 資料表名稱
      timestamps: true, // 使用時間戳
      paranoid: false, // 軟性刪除
      underscored: true, // snake_case 命名
      createdAt: 'created_at', // 建立的時間戳
      updatedAt: 'updated_at', // 更新的時間戳
    }
  )
}
