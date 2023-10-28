// Create a MySQL connection pool
import mysql2 from 'mysql2/promise.js'
import { Pool } from 'sequelize-pool'
// 讀取.env檔用
import 'dotenv/config.js'

const pool = new Pool({
  name: 'mysql',
  create: async () => {
    // create a new connection
    // return as a promise
    return mysql2.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      port: process.env.DB_PORT,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      dateStrings: true, // 轉換日期字串格式用
    })
  },
  destroy: (connection) => {
    // this function should destroy connection. Pool waits for promise (if returned).
    // connection is removed from pool and this method is called and awaited for.
    connection.end()
  },
  validate: (connection) => connection.closed !== true,
  max: 30,
  min: 0,
})

// 啟動時測試連線
try {
  const connection = await pool.acquire()
  if (pool.using) {
    console.log('INFO - Database pool connected.'.bgGreen)

    // return connection back to pool so it can be reused
    pool.release(connection)
  } else {
    console.log('ERROR - Database connect failed'.bgRed)
  }
} catch (e) {
  console.log('ERROR - Database connect failed'.bgRed)
}

// 輸出模組
export default pool
