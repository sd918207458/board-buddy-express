import { DataTypes } from 'sequelize'

export default async function (sequelize) {
  return sequelize.define(
    'Order',
    {
      order_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      order_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      order_status: {
        type: DataTypes.ENUM('pending', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending',
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
      },
      transaction_id: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.ENUM('pending', 'paid', 'fail', 'cancel', 'error'),
      },
      order_info: {
        type: DataTypes.TEXT,
      },
      reservation: {
        type: DataTypes.TEXT,
      },
      confirm: {
        type: DataTypes.TEXT,
      },
      return_code: {
        type: DataTypes.STRING,
      },
      shipping_address_id: {
        type: DataTypes.INTEGER,
      },
      payment_method_id: {
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: 'orders',
      underscored: true,
      timestamps: false,
    }
  )
}
