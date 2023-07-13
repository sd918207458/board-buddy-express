import { totp } from 'otplib'
import 'dotenv/config.js'

const sharedSecret = process.env.OTP_SECRET

// https://github.com/yeojz/otplib#totp-options
// totp.options = { step: 30 } // 30s step

// generateToken
// use email+sharedSecret for shared secret for each user
const generateToken = (email = '') => {
  return totp.generate(email + sharedSecret)
}

// verifyToken - only for step 30s token verify
const verifyToken = (token) => {
  try {
    return totp.verify({ token, sharedSecret })
  } catch (err) {
    console.error(err)
    return false
  }
}

export { generateToken, verifyToken }
