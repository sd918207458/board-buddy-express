import { Sequelize, Model, DataTypes } from 'sequelize'

// 讀取.env檔用
import 'dotenv/config.js'

// 資料庫連結資訊
const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    define: {
      // prevent sequelize from pluralizing table names
      freezeTableName: true,
    },
  }
)

// 啟動時測試連線
sequelize
  .authenticate()
  .then(() => {
    console.log('INFO - Database connected.'.bgGreen)
  })
  .catch((error) => {
    console.log('ERROR - Unable to connect to the database.'.bgRed)
    //console.error(err)
  })

// model test
const User = sequelize.define(
  'user',
  {
    name: DataTypes.TEXT,
    favoriteColor: {
      type: DataTypes.TEXT,
      defaultValue: 'green',
    },
    age: DataTypes.INTEGER,
    cash: DataTypes.INTEGER,
  },
  {
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
)

// create table
await sequelize.sync({ force: true })

// new a instance
const jane = await User.create({ name: 'Jane' })

console.log(jane instanceof User) // true
console.log(jane.name) // "Jane"

// 輸出模組
export default sequelize
