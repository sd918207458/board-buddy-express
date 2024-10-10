// models/Game_rooms.js
import { DataTypes } from 'sequelize'

export default function (sequelize) {
  return sequelize.define(
    'Room_heart',
    {
      room_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      room_name: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
      member_id: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      room_intro: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      minperson: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      maxperson: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      creation_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      event_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      img: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      room_type: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      type1: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      type2: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      type3: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      game1: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      game2: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      game3: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      roomrule: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
    },
    {
      tableName: 'room_heart',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  )
}
