const express = require("express");
const kycCtrl = require('../controllers/kyc');
const checkAuth = require('../middleware/check_auth');

const router = express.Router();

// POST: Submit KYC with selfie + document image
router.post('', checkAuth, kycCtrl.createKyc);

// GET: Get all KYC records
router.get('', checkAuth, kycCtrl.getAllKycs);

// GET: Get KYC by ID
router.get('/:id', checkAuth, kycCtrl.getKycById);

// PUT: Update KYC status (approve/reject)
router.put('/status/:id', checkAuth, kycCtrl.updateKycStatus);

// DELETE: Remove a KYC record (and delete images)
router.delete('/:id', checkAuth, kycCtrl.deleteKyc);

module.exports = router;
