import Sequelize from 'sequelize'

// 讀取.env檔用
import 'dotenv/config.js'

// 資料庫連結資訊
const connection = new Sequelize(
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

// Test connection
console.log('SETUP - Connecting database...'.bgGreen)

connection
  .authenticate()
  .then(() => {
    console.log('INFO - Database connected.'.bgGreen)
  })
  .catch((err) => {
    console.log('ERROR - Unable to connect to the database.'.bgRed)
  })

const User = connection.define(
  'user',
  { username: Sequelize.STRING },
  {
    underscored: true,
  }
)

export default connection
// 資料庫連結資訊
// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USERNAME,
//   port: process.env.DB_PORT,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
//   dateStrings: true, // 轉換日期字串格式用
// })

// // 啟動時測試連線
// pool
//   .getConnection()
//   .then((connection) => {
//     console.log('Database Connected Successfully'.bgGreen)
//     connection.release()
//   })
//   .catch((error) => {
//     console.log('Database Connection Failed'.bgRed)
//     console.log(error)
//   })

// // 輸出模組
// export default pool
