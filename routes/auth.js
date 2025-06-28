const express = require("express");
const authCtrl = require('../controllers/auth');
const checkAuth = require('../middleware/check_auth');

const router = express.Router();

// Auth routes
router.post('/signUp', authCtrl.signUp);                       // Create account
router.post('/signIn', authCtrl.signIn);                       // Login
router.put('/updateProfile', checkAuth, authCtrl.updateProfile); // Update user info
router.post('/updateVerification', authCtrl.updateVerification); // Email verification
router.delete('/user/:id', checkAuth, authCtrl.delUser);         // Delete user

module.exports = router;
