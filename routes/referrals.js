const express = require("express");
const referralsCtrl = require('../controllers/referrals');
const checkAuth = require('../middleware/check_auth');

const router = express.Router();

// GET: Get referrals by ID
router.get('/:id', checkAuth, referralsCtrl.getReferrals);

// GET: Get referral tree for a user
router.get('/tree/:userId', checkAuth, referralsCtrl.getReferralTree);

module.exports = router;
