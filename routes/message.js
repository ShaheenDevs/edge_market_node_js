const express = require("express");
const messageCtrl = require('../controllers/message');
const checkAuth = require('../middleware/check_auth');

const router = express.Router();

router.post('/sendMessage', checkAuth, messageCtrl.sendMessage);
router.get('/getMessages', checkAuth, messageCtrl.getMessages);
router.get('/getUserList', checkAuth, messageCtrl.getUserList);

module.exports = router;