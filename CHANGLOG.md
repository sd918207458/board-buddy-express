# Change log

## TODO

- [ ] user change password feature

## FIXME

## LOG

### 231105

- (u) jwt access token change include user id, google_uid, line_uid, username. and expiresIn change to '3d'

### 231104

- (a) user register/update(profile) feature
- (u) refactor test all reset-password(otp) feature
- (a) db password hashing with bcrypt
- (a) node import alias for root(##)

### 231028

- (u) sequelize raw query for model/base.js
- (u) dynamic import routes
- (a) pg, pg-hstore, mariadb npm mods for test
- remove express-fileupload and only use multer

### 231024

- (d) models/users change router/user db funcs
- (d) docs
- (d) auth, facebook-login

### 231023-

- OTP workflow
- +nodemailer + Google SMTP
- +[faker](https://github.com/faker-js/faker)
- fixed create table issue(executeQuery only one query each time) drop if exist then create
- es6 import wo babel 
- auth route (session-cookie should use?... no, use jwt)

### 230604

- get: all, byId is ok
- post: insertOne is ok

### 230606

- json2db(create db and insert data) ok
- db backup tool ok
- create, drop, TRUNCATE db.... should need another TEST db?