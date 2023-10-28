# express-base-es6-esm

## !!使用前注意

- `.env`檔已移除，記得clone後，將`.env.template`改為`.env`檔案
- `.env`中`DB_設定`需改為你的資料庫、帳號、密碼才能開始使用
- 資料庫schema檔案在`data`中

## FIXME

- [ ] db naming should change to [SQL Style Guide](https://www.sqlstyle.guide/zh-tw/)
- [ ] remove single models for each route, change to use base models

## Changlog

### 20231028

- (a)pg, pg-hstore, mariadb npm mods for test

### 20231024

- (d) models/users change router/user db funcs
- (d) docs
- (d) auth, facebook-login

### 20231023-

- OTP workflow
- +nodemailer + Google SMTP
- +[faker](https://github.com/faker-js/faker)
- fixed create table issue(executeQuery only one query each time) drop if exist then create
- es6 import wo babel 
- auth route (session-cookie should use?... no, use jwt)

### 20230604

- get: all, byId is ok
- post: insertOne is ok

### 20230606

- json2db(create db and insert data) ok
- db backup tool ok
- create, drop, TRUNCATE db.... should need another TEST db?
