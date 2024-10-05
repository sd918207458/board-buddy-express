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
          model: 'member', // 改為引用 'member' 表
          key: 'member_id',
        },
        onDelete: 'CASCADE',
      },
      card_number: {
        type: DataTypes.STRING(20),
        allowNull: true, // 支持非信用卡支付方式
        unique: 'uniqueCardForMember',
      },
      card_type: {
        type: DataTypes.ENUM('Visa', 'MasterCard', 'Amex'),
        allowNull: true, // 支持非信用卡支付方式
      },
      expiration_date: {
        type: DataTypes.STRING(5), // 儲存 MM/YY 格式的字串
        allowNull: true,
      },

      cardholder_name: {
        type: DataTypes.STRING(100),
        allowNull: true, // 支持非信用卡支付方式
      },
      payment_type: {
        type: DataTypes.STRING(255),
        defaultValue: null,
        allowNull: true, // 用來區分支付類型（例如 'creditCard', 'cash', 'onlinePayment'）
      },
      online_payment_service: {
        type: DataTypes.STRING(50),
        allowNull: true, // 儲存線上支付服務名稱
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // 標記是否是預設付款方式
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
