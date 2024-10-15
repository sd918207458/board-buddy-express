import { DataTypes } from 'sequelize'

const Wishlist = (sequelize) => {
  return sequelize.define(
    'Wishlist',
    {
      wishlist_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'member',
          key: 'member_id',
        },
        onDelete: 'CASCADE', // 如果 member 被刪除，則相關的收藏也會刪除
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'product_game', // 假設你的產品表叫 'Product_Game'
          key: 'product_id',
        },
      },
    },
    {
      tableName: 'Wishlist',
      timestamps: false, // 假設不需要 `createdAt` 和 `updatedAt`
    }
  )
}
// 在模型關聯的地方設置
Wishlist.associate = (models) => {
  Wishlist.belongsTo(models.User, { foreignKey: 'member_id', as: 'user' })
  Wishlist.belongsTo(models.Product_Game, {
    foreignKey: 'product_id',
    as: 'product',
  })
}

export default Wishlist
