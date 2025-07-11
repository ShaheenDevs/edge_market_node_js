const express = require("express");
const router = express.Router();
const walletController = require("../controllers/wallet");

// User routes
router.post("/deposit", walletController.deposit);
router.post("/withdraw", walletController.requestWithdrawal);
router.get("/transactions/:userId", walletController.getUserTransactions);
// GET /wallet/all-transactions?userId=123&type=deposit&status=approved&page=1&limit=10
router.get("/all-transactions", walletController.getAllUserTransactions);

// Admin routes
router.post("/approve/:transactionId", walletController.approveWithdrawal);
router.post("/wallet/reject/:transactionId", walletController.rejectWithdrawal);


module.exports = router;