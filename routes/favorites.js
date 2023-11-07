import express from 'express'
const router = express.Router()

// import { executeQuery } from '#db-helpers/base.js'
// 檢查空物件, 轉換req.params為數字
import { getIdParam } from '#db-helpers/db-tool.js'

import authenticate from '#middlewares/authenticate.js'
import sequelize from '#configs/db.js'
const { Favorite } = sequelize.models

// 獲得某會員id的有加入到我的最愛清單中的商品id們
// 此路由只有登入會員能使用
router.get('/', authenticate, async (req, res) => {
  const pids = await Favorite.findAll({
    attributes: ['pid'],
    where: {
      uid: req.user.id,
    },
    raw: true, //只需要資料
  })

  // 將結果中的pid取出變為一個純資料的陣列
  const favorites = pids.map((v) => v.pid)

  res.json({ status: 'success', data: { favorites } })
})

// router.get('/all-products-no-login', async (req, res, next) => {
//   const sql = `SELECT p.*
//     FROM products AS p
//     ORDER BY p.id ASC`

//   const { rows } = await executeQuery(sql)

//   res.json({ products: rows })
// })

// router.get('/all-products', authenticate, async (req, res, next) => {
//   const user = req.user
//   const uid = user.id

//   const sql = `SELECT p.*, IF(f.id, 'true', 'false') AS is_favorite
//     FROM products AS p
//     LEFT JOIN favorites AS f ON f.pid = p.id
//     AND f.uid = ${uid}
//     ORDER BY p.id ASC`

//   const { rows } = await executeQuery(sql)

//   console.log(rows)

//   // cast boolean
//   const products = rows.map((v) => ({
//     ...v,
//     is_favorite: v.is_favorite === 'true',
//   }))

//   console.log(products)

//   res.json({ products })
// })

// router.get('/fav-products', authenticate, async (req, res, next) => {
//   const user = req.user
//   const uid = user.id

//   const sql = `SELECT p.*
// FROM products AS p
//     INNER JOIN favorites AS f ON f.pid = p.id
//     AND f.uid = ${uid}
// ORDER BY p.id ASC`

//   const { rows } = await executeQuery(sql)

//   console.log(rows)

//   res.json({ products: rows })
// })

router.put('/:id', authenticate, async (req, res, next) => {
  const pid = getIdParam(req)

  const uid = req.user.id

  // const sql = `INSERT INTO favorites (uid, pid) VALUES (${uid}, ${pid})`

  // const { rows } = await executeQuery(sql)

  const existFav = await Favorite.findOne({ where: { pid, uid } })
  if (existFav) {
    return res.json({ status: 'error', message: '資料已經存在，新增失敗' })
  }

  const newFav = await Favorite.create({ pid, uid })

  // console.log(newFav.id)

  // 沒有新增到資料
  if (!newFav.id) {
    return res.json({
      status: 'error',
      message: '新增失敗',
    })
  }

  return res.json({ status: 'success', data: null })
})

router.delete('/:id', authenticate, async (req, res, next) => {
  const pid = getIdParam(req)
  const uid = req.user.id

  const affectedRows = await Favorite.destroy({
    where: {
      pid,
      uid,
    },
  })

  // 沒有刪除到任何資料 -> 失敗或沒有資料被刪除
  if (!affectedRows) {
    return res.json({
      status: 'error',
      message: '刪除失敗',
    })
  }

  // 成功
  return res.json({ status: 'success', data: null })
})

export default router
