import express from 'express'
const router = express.Router()

import { executeQuery } from '../models/base.js'

import authenticate from '../middlewares/jwt.js'

/* GET home page. */
router.get('/all-products', authenticate, async (req, res, next) => {
  const user = req.user
  const uid = user.id

  const sql = `SELECT p.*, IF(f.id, 'true', 'false') AS is_favorite
    FROM products AS p
    LEFT JOIN favorites AS f ON f.pid = p.id
    AND f.uid = ${uid}
    ORDER BY p.id ASC`

  const { rows } = await executeQuery(sql)

  console.log(rows)

  // cast boolean
  const products = rows.map((v) => ({
    ...v,
    is_favorite: v.is_favorite === 'true',
  }))

  console.log(products)

  res.json({ products })
})

router.get('/fav-products', authenticate, async (req, res, next) => {
  const user = req.user
  const uid = user.id

  const sql = `SELECT p.*
FROM products AS p
    INNER JOIN favorites AS f ON f.pid = p.id
    AND f.uid = ${uid}
ORDER BY p.id ASC`

  const { rows } = await executeQuery(sql)

  console.log(rows)

  res.json({ products: rows })
})

router.put('/:pid', authenticate, async (req, res, next) => {
  const pid = req.params.pid

  const user = req.user
  const uid = user.id

  const sql = `INSERT INTO favorites (uid, pid) VALUES (${uid}, ${pid})`

  const { rows } = await executeQuery(sql)

  console.log(rows.affectedRows)
  if (rows.affectedRows) {
    return res.json({ message: 'success', code: '200' })
  } else {
    return res.json({ message: 'fail', code: '400' })
  }
})

router.delete('/:pid', authenticate, async (req, res, next) => {
  const pid = req.params.pid

  const user = req.user
  const uid = user.id

  const sql = `DELETE FROM favorites WHERE pid=${pid} AND uid=${uid}; `

  const { rows } = await executeQuery(sql)

  console.log(rows.affectedRows)

  if (rows.affectedRows) {
    return res.json({ message: 'success', code: '200' })
  } else {
    return res.json({ message: 'fail', code: '400' })
  }
})

export default router
