import { DataTypes } from 'sequelize'

export default function (sequelize) {
  return sequelize.define(
    'Wishlist',
    {
      wishlist_id: {
        type: DataTypes.INTEGER, // 確保 DataTypes 正確被引用
        primaryKey: true,
        autoIncrement: true,
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'member', // 引用 'member' 表 (與 User 模型一致)
          key: 'member_id',
        },
        onDelete: 'CASCADE',
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Product_Game', // 引用 'Product_Game' 表
          key: 'product_id',
        },
        onDelete: 'CASCADE',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'wishlist',
      timestamps: true,
      underscored: true,
    }
  )
}
