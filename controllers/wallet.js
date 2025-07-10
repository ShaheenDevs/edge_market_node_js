const models = require('../models');
const Validator = require('fastest-validator');
const v = new Validator();

// ✅ DEPOSIT
const deposit = async (req, res) => {
  try {
    const { userId, amount, description } = req.body;

    const schema = {
      userId: { type: "number" },
      amount: { type: "number", min: 0.01 },
      description: { type: "string", optional: true }
    };

    const validate = v.validate({ userId, amount, description }, schema);
    if (validate !== true) return res.status(400).json({ message: "Validation failed", errors: validate });

    const user = await models.User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Create deposit transaction
    await models.WalletTransaction.create({
      userId,
      type: "deposit",
      amount,
      status: "approved",
      description
    });

    // Update user balance (if you're maintaining it)
    user.balance += amount;
    await user.save();

    // 🔔 Notify user
    await models.Notification.create({
      userId,
      title: "Deposit Successful",
      description: `Your deposit of ${amount} has been added to your wallet.`,
      link: "/wallet",
      imageUrl: ""
    });

    res.status(200).json({ message: "Deposit successful", balance: user.balance });
  } catch (err) {
    console.error("Deposit error:", err);
    res.status(500).json({ message: "Internal error", error: err.message });
  }
};

// ✅ WITHDRAWAL REQUEST
const requestWithdrawal = async (req, res) => {
  try {
    const { userId, amount, description } = req.body;

    const schema = {
      userId: { type: "number" },
      amount: { type: "number", min: 0.01 },
      description: { type: "string", optional: true }
    };

    const validate = v.validate({ userId, amount, description }, schema);
    if (validate !== true) return res.status(400).json({ message: "Validation failed", errors: validate });

    const user = await models.User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Create withdrawal transaction (pending)
    await models.WalletTransaction.create({
      userId,
      type: "withdrawal",
      amount,
      status: "pending",
      description
    });

    // 🔔 Notify user
    await models.Notification.create({
      userId,
      title: "Withdrawal Request Submitted",
      description: `Your withdrawal request of ${amount} is under review.`,
      link: "/transactions",
      imageUrl: ""
    });

    res.status(200).json({ message: "Withdrawal request submitted for approval" });
  } catch (err) {
    console.error("Withdrawal request error:", err);
    res.status(500).json({ message: "Internal error", error: err.message });
  }
};

// ✅ APPROVE WITHDRAWAL
const approveWithdrawal = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await models.WalletTransaction.findByPk(transactionId);
    if (!transaction || transaction.type !== 'withdrawal' || transaction.status !== 'pending') {
      return res.status(404).json({ message: "Pending withdrawal not found" });
    }

    const user = await models.User.findByPk(transaction.userId);
    if (user.balance < transaction.amount) {
      return res.status(400).json({ message: "User has insufficient balance" });
    }

    transaction.status = "approved";
    await transaction.save();

    // Deduct balance
    user.balance -= transaction.amount;
    await user.save();

    // 🔔 Notify user
    await models.Notification.create({
      userId: user.id,
      title: "Withdrawal Approved",
      description: `Your withdrawal of ${transaction.amount} has been approved and processed.`,
      link: "/transactions",
      imageUrl: ""
    });

    res.status(200).json({ message: "Withdrawal approved and processed", balance: user.balance });
  } catch (err) {
    console.error("Approve withdrawal error:", err);
    res.status(500).json({ message: "Internal error", error: err.message });
  }
};

// ✅ REJECT WITHDRAWAL
const rejectWithdrawal = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await models.WalletTransaction.findByPk(transactionId);
    if (!transaction || transaction.type !== 'withdrawal' || transaction.status !== 'pending') {
      return res.status(404).json({ message: "Pending withdrawal not found" });
    }

    transaction.status = "rejected";
    await transaction.save();

    // 🔔 Notify user
    await models.Notification.create({
      userId: transaction.userId,
      title: "Withdrawal Rejected",
      description: `Your withdrawal of ${transaction.amount} was rejected.`,
      link: "/transactions",
      imageUrl: ""
    });

    res.status(200).json({ message: "Withdrawal rejected" });
  } catch (err) {
    console.error("Reject withdrawal error:", err);
    res.status(500).json({ message: "Internal error", error: err.message });
  }
};

// ✅ GET USER TRANSACTIONS
const getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await models.WalletTransaction.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ transactions });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch transactions", error: err.message });
  }
};

module.exports = {
  deposit,
  requestWithdrawal,
  approveWithdrawal,
  rejectWithdrawal,
  getUserTransactions
};
