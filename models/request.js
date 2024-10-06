import { DataTypes } from 'sequelize'

export default async function (sequelize) {
  return sequelize.define(
    'Request',
    {
      request_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      order_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      product_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      product_model: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      product_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('requested', 'approved', 'rejected'),
        defaultValue: 'requested',
      },
    },
    {
      tableName: 'requests',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  )
}
