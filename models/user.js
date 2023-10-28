import { DataTypes } from 'sequelize'

export default async function (sequelize) {
  const User = sequelize.define(
    'User',
    {
      name: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(60),
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING(60),
        allowNull: true,
      },
      favoriteColor: {
        type: DataTypes.TEXT,
        defaultValue: 'green',
      },
      age: DataTypes.INTEGER,
      cash: DataTypes.INTEGER,
    },
    {
      classMethods: {
        associate: function (models) {
          // User.belongsTo(models.Department, { foreignKey: { allowNull: false } });
          // User.belongsTo(models.Position, { foreignKey: { allowNull: false } });
          // User.belongsTo(models.Profile, { foreignKey: { allowNull: false } });
          // User.hasMany(models.Report, { foreignKey: { allowNull: false } });
          // User.hasMany(models.Notification, { foreignKey: { allowNull: false } });
          // User.hasMany(models.Response, { foreignKey: { allowNull: false } });
        },
      },

      //   timestamps: false,

      // don't delete database entries but set the newly added attribute deletedAt
      // to the current date (when deletion was done). paranoid will only work if
      // timestamps are enabled
      paranoid: false,

      // don't use camelcase for automatically added attributes but underscore style
      // so updatedAt will be updated_at
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  )

  return User
}
