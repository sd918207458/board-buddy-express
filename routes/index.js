import express from 'express'
const router = express.Router()

import sequelize from '#configs/db.js'
const { User } = sequelize.models

/* GET home page. */
router.get('/', async function (req, res, next) {
  const users = await User.findAll()
  res.json({ users })
})

router.get('/create', async function (req, res, next) {
  const jane = await User.create({ name: 'Jane' })

  console.log(jane instanceof User) // true
  console.log(jane.name) // "Jane"
  res.json({ msg: 'success' })
})

// router.get('/', function (req, res, next) {
//   res.render('index', { title: 'Express' })
// })

export default router
