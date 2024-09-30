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
      google_uid: {
        type: DataTypes.STRING(255), // Google帳號的UID
        allowNull: true,
        unique: true,
      },
      photo_url: {
        type: DataTypes.STRING(255), // Google的頭像網址
        allowNull: true,
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'User',
          key: 'member_id',
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
