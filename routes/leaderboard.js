const express = require("express");
const leaderboardCtrl = require('../controllers/leaderboard');
const checkAuth = require('../middleware/check_auth');

const router = express.Router();


// GET: Get all leaderboard records
router.get('', checkAuth, leaderboardCtrl.getLeaderboard);

module.exports = router;
