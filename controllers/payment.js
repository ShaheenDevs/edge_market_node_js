const models = require('../models');

// ✅ CREATE
const createPaymentMethod = async (req, res) => {
  const { accountName, accountNumber, accountOwner, methodType, status } = req.body;

  if (!accountName || !accountNumber || !accountOwner || !methodType) {
    return res.status(400).json({ status: 400, message: 'All required fields must be provided' });
  }

  try {
    const method = await models.PaymentMethod.create({
      accountName,
      accountNumber,
      accountOwner,
      methodType,
      status: status ?? true
    });
    return res.status(201).json({ status: 201, message: 'Payment method created', data: method });
  } catch (err) {
    return res.status(500).json({ status: 500, message: 'Error creating payment method', error: err.message });
  }
};

// ✅ READ ALL
const getAllPaymentMethods = async (req, res) => {
  try {
    const methods = await models.PaymentMethod.findAll();
    return res.status(200).json({ status: 200, data: methods });
  } catch (err) {
    return res.status(500).json({ status: 500, message: 'Error fetching payment methods', error: err.message });
  }
};

// ✅ READ ONE
const getPaymentMethodById = async (req, res) => {
  try {
    const method = await models.PaymentMethod.findByPk(req.params.id);
    if (!method) return res.status(404).json({ status: 404, message: 'Payment method not found' });
    return res.status(200).json({ status: 200, data: method });
  } catch (err) {
    return res.status(500).json({ status: 500, message: 'Error fetching payment method', error: err.message });
  }
};

// ✅ UPDATE
const updatePaymentMethod = async (req, res) => {
  const { accountName, accountNumber, accountOwner, methodType, status } = req.body;

  try {
    const method = await models.PaymentMethod.findByPk(req.params.id);
    if (!method) return res.status(404).json({ status: 404, message: 'Payment method not found' });

    await method.update({
      accountName,
      accountNumber,
      accountOwner,
      methodType,
      status
    });

    return res.status(200).json({ status: 200, message: 'Payment method updated', data: method });
  } catch (err) {
    return res.status(500).json({ status: 500, message: 'Error updating payment method', error: err.message });
  }
};

// ✅ DELETE
const deletePaymentMethod = async (req, res) => {
  try {
    const method = await models.PaymentMethod.findByPk(req.params.id);
    if (!method) return res.status(404).json({ status: 404, message: 'Payment method not found' });

    await method.destroy();
    return res.status(200).json({ status: 200, message: 'Payment method deleted' });
  } catch (err) {
    return res.status(500).json({ status: 500, message: 'Error deleting payment method', error: err.message });
  }
};

module.exports = {
  createPaymentMethod,
  getAllPaymentMethods,
  getPaymentMethodById,
  updatePaymentMethod,
  deletePaymentMethod
};
