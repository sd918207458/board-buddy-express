# OTP (one time password)

## note

- use TOTP w default options


## workflow

- user on forget password page -> input email field
- server send an otp(6 digits) to email ex.`550093`
- user get the otp token and input into the otp field
- server check the otp db table w email and otp token