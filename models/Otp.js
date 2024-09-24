import { DataTypes } from 'sequelize'

export default async function (sequelize) {
  return sequelize.define(
    'Otp',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // 確保不允許為 null
        references: {
          model: 'User', // 引用 User 模型
          key: 'member_id', // 使用 'member_id' 作為外鍵
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      exp_timestamp: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      tableName: 'otp',
      timestamps: true,
      paranoid: false,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  )
}
