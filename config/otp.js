import { totp } from 'otplib'
import 'dotenv/config.js'

// const secret = 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD'

//const sharedSecret = reqJSON.contact_email + 'APICHALLENGE'
const secret = process.env.OTP_SECRET

totp.options = { step: 60 } // 60s step

const generateToken = (email = '') => {
  return totp.generate(email + secret)
}

const verifyToken = (token) => {
  try {
    return totp.verify({ token, secret })
  } catch (err) {
    console.error(err)
    return false
  }
}

export { generateToken, verifyToken }
