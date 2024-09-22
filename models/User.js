import { DataTypes } from 'sequelize'
// 加密密碼字串用
import { generateHash } from '#db-helpers/password-hash.js'

export default async function (sequelize) {
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
        allowNull: true, // 允許為空
        unique: true,
        defaultValue: 'admin', // 可以指定一個默認值
      },

      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      first_name: {
        type: DataTypes.STRING(50),
        defaultValue: 'user', // 可以指定一個默認值
      },
      last_name: {
        type: DataTypes.STRING(50),
        defaultValue: 'user', // 可以指定一個默認值
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
      profile_picture_url: {
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
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      hooks: {
        beforeCreate: async (user) => {
          if (user.password_hash) {
            // 確保正確加密密碼
            user.password_hash = await generateHash(user.password_hash)
          }
        },
        beforeUpdate: async (user) => {
          if (user.password_hash) {
            user.password_hash = await generateHash(user.password_hash)
          }
        },
      },
      tableName: 'member', // 對應資料表名稱
      timestamps: true,
      underscored: true, // snake_case 欄位命名
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  )
}
