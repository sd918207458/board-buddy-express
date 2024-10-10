import { DataTypes } from 'sequelize'

export default function (sequelize) {
  return sequelize.define(
    'Friends',
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      friend_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'accepted',
      },
    },
    {
      tableName: 'friends',
      timestamps: true,
    }
  )
}
