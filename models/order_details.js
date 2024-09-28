import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const OrderDetails = sequelize.define(
    'OrderDetails',
    {
      orderdetail_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Orders', // 關聯到 Orders 表
          key: 'order_id',
        },
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Products', // 關聯到 Products 表
          key: 'product_id',
        },
      },
      product_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      game_type: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: sequelize.literal('number * price'), // 生成的小計
      },
      orderdetail_status: {
        type: DataTypes.ENUM('cart', 'processing', 'completed', 'cancelled'),
        defaultValue: 'cart',
      },
      image_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
      },
    },
    {
      tableName: 'order_details', // 資料表名稱
      timestamps: true, // 自動維護 created_at 和 updated_at
      underscored: true, // 使用下劃線命名欄位
    }
  )

  // 設置關聯關係
  OrderDetails.associate = function (models) {
    OrderDetails.belongsTo(models.Orders, {
      foreignKey: 'order_id',
      as: 'order',
    })
    OrderDetails.belongsTo(models.Products, {
      foreignKey: 'product_id',
      as: 'product',
    })
  }

  return OrderDetails
}
