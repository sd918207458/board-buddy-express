import { Sequelize, Model, DataTypes } from 'sequelize'

// 讀取.env檔用
import 'dotenv/config.js'

import applyModels from './models-setup.js'
import applySeeds from './seeds-setup.js'

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
    console.log('INFO - 資料庫已連線 Database connected.'.bgGreen)
  })
  .catch((error) => {
    console.log(
      'ERROR - 無法連線至資料庫 Unable to connect to the database.'.bgRed
    )
    console.error(error)
  })

// 載入models中的各檔案
await applyModels(sequelize)

// This checks what is the current state of the table in the database
// (which columns it has, what are their data types, etc),
// and then performs the necessary changes in the table to make it match the model.
// await sequelize.sync({ alter: true })
await sequelize.sync({ force: true })

console.log(
  'INFO - 所有模型已完成同步化 All models were synchronized successfully.'
    .bgGreen
)

await applySeeds(sequelize)

// 輸出模組
export default sequelize
