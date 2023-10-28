import { Sequelize, Model, DataTypes } from 'sequelize'

// 讀取.env檔用
import 'dotenv/config.js'

import * as fs from 'fs'
import path from 'path'
// 修正 __dirname for esm, windows dynamic import bug
import { fileURLToPath, pathToFileURL } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
      charset: 'utf8',
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
    console.error(error)
  })

// 載入models中的各檔案使用
const modelsPath = path.join(__dirname, '../models')
const filenames = await fs.promises.readdir(modelsPath)

for (const filename of filenames) {
  const item = await import(pathToFileURL(path.join(modelsPath, filename)))
  item.default(sequelize)
}

// const modelDefiners = [await import('../models/user.js')]

// // We define all models according to their files.
// for (const modelDefiner of modelDefiners) {
//   modelDefiner.default(sequelize)
// }

// This checks what is the current state of the table in the database
// (which columns it has, what are their data types, etc),
// and then performs the necessary changes in the table to make it match the model.
await sequelize.sync({ alter: true })
console.log('All models were synchronized successfully.')
// We execute any extra setup after the models are defined, such as adding associations.
// applyExtraSetup(sequelize)

// // model test
// const User = sequelize.define(
//   'user',
//   {
//     name: DataTypes.TEXT,
//     favoriteColor: {
//       type: DataTypes.TEXT,
//       defaultValue: 'green',
//     },
//     age: DataTypes.INTEGER,
//     cash: DataTypes.INTEGER,
//   },
//   {
//     underscored: true,
//     createdAt: 'created_at',
//     updatedAt: 'updated_at',
//   }
// )

// // create table
// await sequelize.sync({ force: true })

// // new a instance
// const jane = await User.create({ name: 'Jane' })

// console.log(jane instanceof User) // true
// console.log(jane.name) // "Jane"

// 輸出模組
export default sequelize
