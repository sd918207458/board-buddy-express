import { DataTypes } from 'sequelize'

export default function (sequelize) {
  return sequelize.define(
    'Address',
    {
      address_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'User', // 對應的表名（User 模型對應 member 表）
          key: 'member_id', // 外鍵對應 member 表中的 member_id
        },
        onDelete: 'CASCADE', // 可選：如果會員被刪除，地址也會跟著刪除
      },
      address_type: {
        type: DataTypes.ENUM('home', 'work', 'other'),
        defaultValue: 'home', // 設定預設值
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      zip_code: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'addresses', // 對應資料庫中的資料表名稱
      timestamps: true, // 自動維護 createdAt 和 updatedAt 欄位
      underscored: true, // 允許下劃線風格的欄位命名
    }
  )
}
