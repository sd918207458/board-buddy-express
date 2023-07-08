# express-base-es6

## TODO

- [ ] line login
- [ ] google(firebase) login
- [ ] category db
- [ ] favorite db?
- [ ] comment db?
- [ ] order db(order_item, shipping, payment)

## FIXME

## Changlog

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
