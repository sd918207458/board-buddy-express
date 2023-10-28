import * as fs from 'fs'
import path from 'path'
import sequelize from '../config/mysql.js'

// 修正 __dirname for esm, windows dynamic import bug
import { fileURLToPath, pathToFileURL } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// object to hold all the models to export
const models = {}

// Read all the files from this dir and load the models
fs.readdirSync(__dirname).forEach((file) => {
  if (file !== path.basename(__filename) && file.endsWith('.js')) {
    const model = sequelize.import(
      path.join(__dirname, '/', file.replace(/\.js$/, ''))
    )
    models[model.name] = model
  }
})


// fs.readdirSync(__dirname)
//   .filter((file) => {
//     const returnFile =
//       file.indexOf('.') !== 0 &&
//       file !== filebasename &&
//       file.slice(-3) === '.js'
//     return returnFile
//   })
//   .forEach((file) => {
//     const model = require(path.join(__dirname, file))(sequelize, DataTypes)
//     db[model.name] = model
//   })

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

const sequelizeOptions = { logging: config.logging }

// Removes all tables and recreates them (only available if env is not in production)
if (DB_FORCE_RESTART === 'true' && process.env.ENV !== 'production') {
  sequelizeOptions.force = true
}

sequelize
  .sync(sequelizeOptions)
  .then(async () => {
    // await db.User.bulkCreate(users)
  })
  .catch((err) => {
    console.log(err)
    process.exit()
  })