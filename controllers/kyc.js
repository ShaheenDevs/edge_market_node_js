const path = require('path');
const fs = require('fs');
const multer = require('multer');
const models = require('../models');

// Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/kyc/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage }).fields([
  { name: 'selfieImage', maxCount: 1 },
  { name: 'documentImage', maxCount: 1 }
]);

// ✅ CREATE
const createKyc = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(500).json({ status: 500, message: 'Upload error', error: err.message });

    const { documentType, paymentId } = req.body;

    if (!req.files.selfieImage || !req.files.documentImage || !documentType)
      return res.status(400).json({ status: 400, message: 'All fields are required' });

    try {
      const kyc = await models.Kyc.create({
        selfieImage: req.files.selfieImage[0].path,
        documentImage: req.files.documentImage[0].path,
        documentType,
        paymentId,
        status: 'pending'
      });

      return res.status(201).json({ status: 201, message: 'KYC submitted', data: kyc });
    } catch (error) {
      return res.status(500).json({ status: 500, message: 'Database error', error: error.message });
    }
  });
};

// ✅ READ ALL
const getAllKycs = async (req, res) => {
  const kycs = await models.Kyc.findAll();
  res.status(200).json({ status: 200, data: kycs });
};

// ✅ READ ONE
const getKycById = async (req, res) => {
  const kyc = await models.Kyc.findByPk(req.params.id);
  if (!kyc) return res.status(404).json({ status: 404, message: 'KYC not found' });
  res.status(200).json({ status: 200, data: kyc });
};

// ✅ UPDATE STATUS
const updateKycStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ status: 400, message: 'Invalid status' });
  }

  const kyc = await models.Kyc.findByPk(id);
  if (!kyc) return res.status(404).json({ status: 404, message: 'KYC not found' });

  await kyc.update({ status });
  res.status(200).json({ status: 200, message: 'Status updated', data: kyc });
};

// ✅ DELETE
const deleteKyc = async (req, res) => {
  const { id } = req.params;
  const kyc = await models.Kyc.findByPk(id);

  if (!kyc) return res.status(404).json({ status: 404, message: 'KYC not found' });

  // Remove images
  [kyc.selfieImage, kyc.documentImage].forEach(file => {
    fs.unlink(file, err => { if (err) console.error('File delete error:', err); });
  });

  await kyc.destroy();
  res.status(200).json({ status: 200, message: 'KYC deleted' });
};

module.exports = {
  createKyc,
  getAllKycs,
  getKycById,
  updateKycStatus,
  deleteKyc
};
