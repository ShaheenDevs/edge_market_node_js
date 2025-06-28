const express = require("express");
const versionCtrl = require('../controllers/version');
const checkAuth = require('../middleware/check_auth');

const router = express.Router();

router.get('', versionCtrl.getVersion);
router.put('', checkAuth, versionCtrl.updateVersion);

module.exports = router;