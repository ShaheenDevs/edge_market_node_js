const express = require('express');
const router = express.Router();
const authRouter = require('./auth')
const versionRouter = require('./version')
const notificationRouter = require('./notification')
const imageRouter = require('./image')

router.use('/auth', authRouter)
// router.use('/version', versionRouter)
// router.use('/notification', notificationRouter)
// router.use('/image', imageRouter)

module.exports = router;

// sequelize model:generate --name Category --attributes appName:String,author:String,categoryName:String
// sequelize db:migrate