const express = require("express");
const router = express.Router();
const walletController = require("../controllers/wallet");

// User routes
router.post("/deposit", walletController.deposit);
router.post("/withdraw", walletController.requestWithdrawal);
router.get("/transactions/:userId", walletController.getUserTransactions);

// Admin routes
router.post("/approve/:transactionId", walletController.approveWithdrawal);
router.post("/wallet/reject/:transactionId", walletController.rejectWithdrawal);

module.exports = router;