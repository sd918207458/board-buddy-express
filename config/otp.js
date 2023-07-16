import * as OTPAuth from 'otpauth'
import 'dotenv/config.js'

const otpSecret = process.env.OTP_SECRET

// global object
let totp = null

// Generate a token (returns the current token as a string).
// each user use email+sharedSecret for shared secret
const generateToken = (email = '') => {
  // Create a new TOTP object.
  totp = new OTPAuth.TOTP({
    issuer: 'express-base',
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromLatin1(email + otpSecret),
  })

  return totp.generate()
}

// Validate a token (returns the token delta or null if it is not found in the search window, in which case it should be considered invalid).
const verifyToken = (token) => {
  const delta = totp.validate({ token, window: 1 })
  return delta === null ? false : true
}

export { generateToken, verifyToken }
