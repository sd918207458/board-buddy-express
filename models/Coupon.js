import { DataTypes } from 'sequelize'

export default function (sequelize) {
  const Coupon = sequelize.define(
    'Coupon',
    {
      coupon_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      coupon_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      discount_type: {
        type: DataTypes.ENUM('percent', 'amount'),
        allowNull: false,
      },
      discount_value: {
        type: DataTypes.INTEGER, // 固定折抵金額，NT$100
        allowNull: false,
      },
      expiry_date: {
        type: DataTypes.DATE,
        allowNull: false, // 折抵券的有效期為一個月
      },
    },
    {
      tableName: 'Coupon',
      timestamps: true,
      underscored: true,
    }
  )

  // 設定關聯
  Coupon.associate = function (models) {
    Coupon.belongsTo(models.User, {
      foreignKey: 'member_id',
      as: 'user',
    })
  }

  return Coupon
}
