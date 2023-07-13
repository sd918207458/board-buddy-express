// 資料庫查詢處理函式
import { find, count, insertOne, findOne } from './base.js'
//
import { generateToken, verifyToken } from '../config/otp.js'

const table = 'otp'

const getOtp = (email) => generateToken(email)
const createOtp = async (user) => await insertOne(table, user)
