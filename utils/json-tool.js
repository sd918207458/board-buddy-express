import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
import { readFile, writeFile } from 'fs/promises'

/**
 * Fetching data from the JSON file and parse to JS data
 * @param {string} pathname
 * @returns {Promise<object>} A promise that contains json parse object
 */
export const readJsonFile = async (pathname) => {
  const data = await readFile(path.join(process.cwd(), pathname))
  return JSON.parse(data)
}

export const writeJsonFile = async (pathname, jsonOrObject) => {
  try {
    // we need string
    const data =
      typeof jsonOrObject === 'object'
        ? JSON.stringify(jsonOrObject)
        : jsonOrObject

    await writeFile(path.join(process.cwd(), pathname), data)
    return true
  } catch (e) {
    console.log(e)
    return false
  }
}
