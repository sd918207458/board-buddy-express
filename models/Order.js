import { DataTypes } from 'sequelize'

export default async function (sequelize) {
  return sequelize.define(
    'Order',
    {
      id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      transaction_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      return_code: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'order', //直接提供資料表名稱
      timestamps: true, // 使用時間戳
      paranoid: false, // 軟性刪除
      underscored: true, // 所有自動建立欄位，使用snake_case命名
      createdAt: 'created_at', // 建立的時間戳
      updatedAt: 'updated_at', // 更新的時間戳
    }
  )
}
