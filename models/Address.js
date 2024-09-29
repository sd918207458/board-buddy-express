import { DataTypes } from 'sequelize'

export default function (sequelize) {
  return sequelize.define(
    'Address',
    {
      address_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'User',
          key: 'member_id',
        },
        onDelete: 'CASCADE',
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      area: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      street: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      detailed_address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'addresses',
      timestamps: true,
      underscored: true,
    }
  )
}
