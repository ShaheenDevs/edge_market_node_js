const express = require('express');
const router = express.Router();
const controller = require('../controllers/payment');

router.post('/', controller.createPaymentMethod);
router.get('/', controller.getAllPaymentMethods);
router.get('/:id', controller.getPaymentMethodById);
router.put('/:id', controller.updatePaymentMethod);
router.delete('/:id', controller.deletePaymentMethod);

module.exports = router;