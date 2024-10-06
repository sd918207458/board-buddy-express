import { DataTypes } from 'sequelize'
import { generateHash } from '#db-helpers/password-hash.js'

export default function (sequelize) {
  return sequelize.define(
    'User',
    {
      member_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: true, // Google登入可能沒有 username
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: true, // Google登入不需要密碼
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
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
      first_name: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      last_name: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      zip_code: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      phone_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      avatar: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      favorite_games: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      preferred_play_times: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active',
      },
    },
    {
      hooks: {
        beforeCreate: async (user) => {
          if (user.password_hash) {
            user.password_hash = await generateHash(user.password_hash)
          }
        },
        beforeUpdate: async (user) => {
          if (user.password_hash) {
            user.password_hash = await generateHash(user.password_hash)
          }
        },
      },
      tableName: 'member',
      timestamps: true,
      underscored: true,
    }
  )
}
