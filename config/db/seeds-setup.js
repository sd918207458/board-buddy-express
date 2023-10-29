import * as fs from 'fs'
import path from 'path'
// 修正 __dirname for esm, windows dynamic import bug
import { fileURLToPath, pathToFileURL } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default async function applySeeds(sequelize) {
  // 載入各檔案
  const modelsPath = path.join(__dirname, '../../seeds')
  const filenames = await fs.promises.readdir(modelsPath)

  for (const filename of filenames) {
    const data = await fs.promises.readFile(
      pathToFileURL(path.join(modelsPath, filename))
    )
    const seeds = JSON.parse(data)
    const prop = filename.split('.')[0]
    const result = await sequelize.models[prop].bulkCreate(seeds)

    console.log(
      `${prop} model data bulkinsert to db, length is ${result.length} `
        .bgMagenta
    )
  }
}
