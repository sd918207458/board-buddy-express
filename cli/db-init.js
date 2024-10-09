import sequelize from '#configs/db.js'
import applySeeds from '#db-helpers/sequelize/seeds-setup.js'
// import applyAssociations from './associations-setup.js'

// 讓console.log呈現檔案與行號，與字串訊息呈現顏色用
import { extendLog } from '#utils/tool.js'
import 'colors'
extendLog()

// 獲取資料庫中的所有表名
async function getAllTables() {
  const [tables] = await sequelize.query(`
    SELECT TABLE_NAME 
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = DATABASE()
  `)
  return tables.map((row) => row.TABLE_NAME)
}

// 獲取表中的所有外鍵
async function getForeignKeys(tableName) {
  const [results] = await sequelize.query(`
    SELECT CONSTRAINT_NAME 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_NAME = '${tableName}' AND CONSTRAINT_SCHEMA = DATABASE() 
    AND REFERENCED_TABLE_NAME IS NOT NULL
  `)
  return results.map((row) => row.CONSTRAINT_NAME)
}

// 移除資料庫中所有表的外鍵
async function dropAllForeignKeys() {
  console.log('INFO - 移除所有表的外鍵約束...'.yellow)

  const tables = await getAllTables()

  for (const table of tables) {
    const foreignKeys = await getForeignKeys(table)

    if (foreignKeys.length > 0) {
      for (const foreignKey of foreignKeys) {
        try {
          await sequelize.query(
            `ALTER TABLE ${table} DROP FOREIGN KEY ${foreignKey};`
          )
          console.log(`INFO - 表 ${table} 的外鍵 ${foreignKey} 移除成功.`.green)
        } catch (error) {
          console.error(
            `ERROR - 無法移除表 ${table} 的外鍵 ${foreignKey}:`.red,
            error
          )
          throw new Error(
            `Failed to drop foreign key ${foreignKey} on table ${table}: ${error.message}`
          )
        }
      }
    } else {
      console.log(`INFO - 表 ${table} 沒有外鍵，無需移除.`.yellow)
    }
  }
}

// 同步資料庫
async function syncDatabase() {
  try {
    // 先移除所有表的外鍵約束，避免刪除表時出現錯誤
    await dropAllForeignKeys()

    // 強制同步資料庫，將刪除並重新建立資料表
    console.log('INFO - 開始同步資料庫模型...'.yellow)
    await sequelize.sync({ force: true }) // 可以改為 { alter: true } 根據需要選擇
    console.log('INFO - 資料庫模型同步完成.'.green)

    // 同步範例資料
    console.log('INFO - 開始同步範例資料 (seeds)...'.yellow)
    await applySeeds(sequelize)
    console.log('INFO - 所有範例資料同步成功.'.green)
  } catch (error) {
    console.error('ERROR - 同步資料庫時發生錯誤:'.red, error)
    throw new Error(`Database synchronization failed: ${error.message}`)
  }
}

// 開始執行同步資料庫
syncDatabase().catch((error) => {
  console.error('Uncaught Error:', error.message) // 捕捉未處理的錯誤並顯示
})
