import express from 'express'
const router = express.Router()

// const orderModel = require('../db-utils/order.js')

// import { findOne, insertOne, update } from '#db-helpers/base.js'
import { createLinePayClient } from 'line-pay-merchant'
import { v4 as uuidv4 } from 'uuid'

// 存取`.env`設定檔案使用
import 'dotenv/config.js'

// 定義安全的私鑰字串
const linePayClient = createLinePayClient({
  channelId: process.env.LINE_PAY_CHANNEL_ID,
  channelSecretKey: process.env.LINE_PAY_CHANNEL_SECRET,
  env: process.env.NODE_ENV,
})

// 建立order
router.post('/create-order', async (req, res) => {
  //產生 order id/ package id
  const orderId = uuidv4()
  const pId = uuidv4()

  const order = {
    orderId: orderId,
    currency: 'TWD',
    amount: req.body.amount,
    packages: [
      {
        id: pId,
        amount: req.body.amount,
        products: req.body.products,
      },
    ],
    options: { display: { locale: 'zh_TW' } },
  }

  console.log(order)

  // Save order information

  // insert new order to database
  await insertOne('orders', {
    order_id: orderId,
    amount: req.body.amount,
    order_info: JSON.stringify(order), // request to line pay
    status: 'pending',
    created: +new Date(),
  })

  res.json(order)
})

// 檢查交易用
router.get('/check-transaction', async (req, res) => {
  const transactionId = req.query.transactionId

  try {
    const linePayResponse = await linePayClient.checkPaymentStatus.send({
      transactionId: transactionId,
      params: {},
    })

    // 範例:
    // {
    //   "body": {
    //     "returnCode": "0000",
    //     "returnMessage": "reserved transaction."
    //   },
    //   "comments": {}
    // }

    res.json(linePayResponse.body)
  } catch (e) {
    res.json({ error: e })
  }
})

router.get('/confirm', async (req, res) => {
  const transactionId = req.query.transactionId

  // get transaction from db
  const record = await findOne('orders', { transaction_id: transactionId })
  console.log(record)

  //transaction
  // let transaction = cache.get(transactionId)
  const transaction = JSON.parse(record.reservation)

  const amount = transaction.amount

  try {
    // do final confirm
    const linePayResponse = await linePayClient.confirm.send({
      transactionId: transactionId,
      body: {
        currency: 'TWD',
        amount: amount,
      },
    })

    console.log(linePayResponse)

    transaction.confirmBody = linePayResponse.body

    //status: 'pending' | 'paid' | 'cancel' | 'fail' | 'error'
    let status = 'paid'

    if (linePayResponse.body.returnCode !== '0000') {
      status = 'fail'
    }

    // update db status
    const result = await update(
      'orders',
      {
        status: status,
        return_code: linePayResponse.body.returnCode,
        confirm: JSON.stringify(linePayResponse.body),
      },
      { order_id: record.order_id }
    )

    res.json(linePayResponse.body)
  } catch (e) {
    res.json({ error: e })
  }
})

// 進行line-pay交易
router.get('/reserve', async (req, res) => {
  // TODO: order infos, note the amount should calc correctly
  // let options = {
  //   amount: 1500,
  //   currency: 'TWD',
  //   orderId: '20211216003',
  //   packages: [
  //     {
  //       id: 'c99abc79-3b29-4f40-8851-bc618ca57856',
  //       amount: 1500,
  //       products: [
  //         {
  //           name: 'Product Name1',
  //           quantity: 1,
  //           price: 500,
  //         },
  //         {
  //           name: 'Product Name2',
  //           quantity: 2,
  //           price: 500,
  //         },
  //       ],
  //     },
  //   ],
  //   redirectUrls: {
  //     confirmUrl: 'http://localhost:3000/pay-confirm',
  //     cancelUrl: 'http://localhost:3000/pay-cancel',
  //   },
  // }

  const redirectUrls = {
    confirmUrl: process.env.REACT_REDIRECT_CONFIRM_URL,
    cancelUrl: process.env.REACT_REDIRECT_CANCEL_URL,
  }

  if (!req.query.orderId) {
    throw new Error('orderId not exist.')
  }

  const orderId = req.query.orderId
  //console.log('L145-', req.query.orderId)

  // find order from db
  const orderRecord = await findOne('orders', { order_id: orderId })

  // order_info記錄要向line pay請求的訂單json
  const order = JSON.parse(orderRecord.order_info)

  //const order = cache.get(orderId)
  console.log(`Order got. Detail is following.`)

  try {
    const linePayResponse = await linePayClient.request.send({
      body: { ...order, redirectUrls },
    })

    //console.log('L140-', linePayResponse)

    // deep copy from order
    const reservation = JSON.parse(JSON.stringify(order))

    reservation.returnCode = linePayResponse.body.returnCode
    reservation.returnMessage = linePayResponse.body.returnMessage
    reservation.transactionId = linePayResponse.body.info.transactionId
    reservation.paymentAccessToken =
      linePayResponse.body.info.paymentAccessToken

    console.log(`Reservation was made. Detail is following.`)
    console.log(reservation)

    // 在db儲存reservation資料
    const newRecord = await update(
      'orders',
      {
        reservation: JSON.stringify(reservation),
        transaction_id: reservation.transactionId,
      },
      { order_id: orderId }
    )

    console.log(newRecord)

    // Save transaction to cache
    //cache.put(reservation.transactionId, reservation)

    res.redirect(linePayResponse.body.info.paymentUrl.web)
  } catch (e) {
    console.log('error', e)
  }
})

export default router
