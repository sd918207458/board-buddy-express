# express-base-es6-esm

## !!使用前注意

- `.env`檔已移除，記得git clone後，將`.env.template`改為`.env`檔案，之後進行相關設定
- `.env`中`DB_XXX`相關設定，需改為你的資料庫、帳號、密碼才能開始使用

## 指令

express執行:

```sh
npm run dev
```

資料庫種子(範例)資料載入:

```sh
npm run seed
```

資料庫備份(mysqldump):

```sh
npm run backup
```

express執行&除錯(macOS, linux):

```sh
npm run debug
```

express執行&除錯(win):

```sh
npm run debug-win
```

## 設計準則 Design Rules

- [SQL Style Guide](https://www.sqlstyle.guide/zh-tw/)
- [Modern SQL Style Guide](https://gist.github.com/mattmc3/38a85e6a4ca1093816c08d4815fbebfb)

### 資料庫 DB

### Table Names

Lower Case Table Name
Table name in Singular
Prefixed Table name

### Field Names

Use all above cases which include lowercase, no space, no numbers, and avoid prefix.

Choose short names no-longer than two words.

Field names should be easy and understandable.

Primary key can be id or table name_id or it can be a self-explanatory name.

Avoid using reserve words as field name. i.e. — Pre-defined words or Keywords. You can add prefix to these names to make it understandable like user_name, signup_date.

Avoid using column with same name as table name. This can cause confusion while writing query.

Avoid abbreviated, concatenated, or acronym-based names.

Do define a foreign key on database schema.

Foreign key column must have a table name with their primary key.

e.g. blog_id represents foreign key id from table blog.

### API路由 REST API

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

POST

```text
Once you are creating a resource on the server, you should return the 201 status code along with a Location header, allowing the client to locate the newly created resource.

The response payload is optional and it typically describes and links to the resource created.
```

#### pagnation

```text
GET /posts?limit=10&offset=0 - retrieves the first 10 posts
GET /posts?limit=10&offset=10 - retrieves the second 10 posts
GET /posts?limit=10&offset=20 - retrieves the third 10 posts, and so on
```

### JWT

- add only unchangeable fields like username, role to JWT