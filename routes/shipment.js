import express from 'express'
const router = express.Router()

// 存取`.env`設定檔案使用
import 'dotenv/config.js'

const callback_url = process.env.SHIP_711_STORE_CALLBACK_URL

// POST home page.
router.post('/711', function (req, res, next) {
  console.log(req.body)
  let searchParams = new URLSearchParams(req.body)
  console.log(searchParams.toString())

  res.redirect(callback_url + '?' + searchParams.toString())


  //   res.render('index', { title: 'OK' })
})


// test only
router.get('/', function (req, res, next) {
  res.render('index', { title: 'shipment OK' })
})

export default router
