import { DataTypes } from 'sequelize'

export default function (sequelize) {
  return sequelize.define(
    'Room_add',
    {
      room_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: 'room_add',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  )
}
