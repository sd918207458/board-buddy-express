import { DataTypes } from 'sequelize'

export default function (sequelize) {
  const PaymentMethod = sequelize.define(
    'PaymentMethod',
    {
      payment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'User', // 注意這裡應該是User模型, 而非member
          key: 'member_id',
        },
        onDelete: 'CASCADE',
        unique: 'uniqueCardForMember',
      },
      card_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: 'uniqueCardForMember',
      },
      card_type: {
        type: DataTypes.ENUM('Visa', 'MasterCard', 'Amex'),
        allowNull: false,
      },
      expiration_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      cardholder_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      payment_type: {
        type: DataTypes.STRING(255),
        defaultValue: null,
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
      tableName: 'payment_methods',
      timestamps: true,
      underscored: true,
    }
  )

  PaymentMethod.associate = function (models) {
    PaymentMethod.belongsTo(models.User, {
      foreignKey: 'member_id',
      as: 'user',
    })
  }

  return PaymentMethod
}
