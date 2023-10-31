// !! 注意: 此檔案並不是express執行時用，只用於初始化資料庫，指令為`npm run db-backup`

import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'

// 讓console.log可以呈現檔案與行號
import { extendLog } from '#utils/tool.js'
// 執行全域套用
extendLog()
// console.log呈現顏色用 全域套用
import 'colors'

// 讀取.env檔用
import 'dotenv/config.js'

const folder = './db-backups'
const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
}

const date = new Date()
const dumpFileName = `${date.getFullYear()}${
  date.getMonth() + 1
}${date.getDate()}-${date.getHours()}${date.getMinutes()}${date.getSeconds()}.dump.sql`

const filePath = path.join(process.cwd(), `${folder}/` + dumpFileName)

const writeStream = fs.createWriteStream(filePath)

const dump = spawn('mysqldump', [
  '-h',
  config.host,
  '-P',
  config.port,
  '-u',
  config.user,
  `-p${config.password}`,
  config.database,
])

dump.stdout
  .pipe(writeStream)
  .on('finish', function () {
    console.log(
      `INFO - 資料庫${config.database}已備份完成 database backup completed.`
        .bgGreen
    )
  })
  .on('error', function (err) {
    console.log(
      `ERROR - 資料庫${config.database}備份失敗 database backup failed.`.bgRed
    )
    console.log(err)
  })
