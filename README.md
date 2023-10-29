# express-base-es6-esm

## !!使用前注意

- `.env`檔已移除，記得clone後，將`.env.template`改為`.env`檔案
- `.env`中`DB_XXX`相關設定，需改為你的資料庫、帳號、密碼才能開始使用
- 資料庫schema檔案

## TODO

- [x] node import alias for root(#root)
- [ ] db naming should change to [SQL Style Guide](https://www.sqlstyle.guide/zh-tw/)
- [ ] remove single models for each route, change to use base models


## FIXME

## Design Rules

### REST API

#### standards

- [JSend](https://github.com/omniti-labs/jsend)
- [Microsoft Azure REST API Guidelines](https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md)
- [Google JSON guide](https://google.github.io/styleguide/jsoncstyleguide.xml)

#### status code

```text
GET: 200 OK
POST: 201 Created
PUT: 200 OK
PATCH: 200 OK
DELETE: 204 No Content
```

```text
200 OK - the request was successful and the response contains the requested data
201 Created - the request was successful and a new resource was created
400 Bad Request - the request was invalid or missing required parameters
401 Unauthorized - the client needs to authenticate to access the resource
404 Not Found - the requested resource was not found
500 Internal Server Error - an unexpected error occurred on the server
```

#### pagnation

```
GET /posts?limit=10&offset=0 - retrieves the first 10 posts
GET /posts?limit=10&offset=10 - retrieves the second 10 posts
GET /posts?limit=10&offset=20 - retrieves the third 10 posts, and so on
```


## Changlog

### 20231028

- (u) sequelize raw query for model/base.js
- (u) dynamic import routes
- (a) pg, pg-hstore, mariadb npm mods for test

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
