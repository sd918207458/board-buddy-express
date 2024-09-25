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
          model: 'member', // 引用的資料表
          key: 'member_id', // 引用的欄位
        },
        onDelete: 'CASCADE', // 刪除會員時，刪除其付款方式
        unique: 'uniqueCardForMember', // 確保會員不會有兩個相同卡號
      },
      card_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: 'uniqueCardForMember', // 與 `member_id` 組合成唯一約束
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
      as: 'user', // 允許通過 `PaymentMethod.user` 存取相關的會員資料
    })
  }

  return PaymentMethod
}
