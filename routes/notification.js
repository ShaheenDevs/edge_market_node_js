const express = require("express");
const notificationCtrl = require('../controllers/notification');
const checkAuth = require('../middleware/check_auth');

const router = express.Router();

router.post('', checkAuth, notificationCtrl.addNotification);
router.get('', checkAuth, notificationCtrl.getNotifications);
router.delete('/:id', checkAuth, notificationCtrl.deleteNotification);
router.put('/:id', checkAuth, notificationCtrl.updateNotification);

module.exports = router;