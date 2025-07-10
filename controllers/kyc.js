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
  { name: 'documentImage', maxCount: 1 },
  { name: 'paymentProofImage', maxCount: 1 },
]);

// ✅ CREATE
const createKyc = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(500).json({ status: 500, message: 'Upload error', error: err.message });

    const { documentType, payment, userId } = req.body;

    if (!req.files.selfieImage || !req.files.documentImage || !req.files.paymentProofImage || !documentType || !userId)
      return res.status(400).json({ status: 400, message: 'All fields including payment proof are required' });

    try {
      // 🔄 Check if KYC already exists for this user
      let kyc = await models.Kyc.findOne({ where: { userId } });

      const selfiePath = req.files.selfieImage[0].path;
      const documentPath = req.files.documentImage[0].path;
      const paymentProofPath = req.files.paymentProofImage[0].path;

      if (kyc) {
        // ✅ Update existing KYC
        await kyc.update({
          selfieImage: selfiePath,
          documentImage: documentPath,
          paymentProofImage: paymentProofPath,
          documentType,
          payment,
          status: 'pending'
        });
      } else {
        // ✅ Create new KYC
        kyc = await models.Kyc.create({
          selfieImage: selfiePath,
          documentImage: documentPath,
          paymentProofImage: paymentProofPath,
          documentType,
          payment,
          userId,
          status: 'pending'
        });
      }

      // 🔁 Update User profile and status
      const user = await models.User.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ status: 404, message: 'User not found' });
      }

      await user.update({
        profile: documentPath,
        kycStatus: 'pending'
      });

      return res.status(201).json({
        status: 201,
        message: kyc ? 'KYC updated and user profile refreshed' : 'KYC created and user profile updated',
        data: { kyc, user }
      });
    } catch (error) {
      console.error("createKyc error:", error);
      return res.status(500).json({
        status: 500,
        message: 'Database error',
        error: error.message
      });
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
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ status: 400, message: 'Invalid status' });
    }

    // Find KYC record
    const kyc = await models.Kyc.findOne({ where: { userId: id } });
    if (!kyc) {
      return res.status(404).json({ status: 404, message: 'KYC not found' });
    }

    // If already approved, return early
    // if (kyc.status === 'approved') {
    //   return res.status(200).json({ status: 200, message: 'KYC already approved', data: kyc });
    // }

    // Find User
    const user = await models.User.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ status: 404, message: 'User not found' });
    }

    // Update User's KYC Status
    await user.update({ kycStatus: status });

    // If newly approved, give 80% of KYC balance to referralBy
    if (status === 'approved' && user.referralBy) {
      const referralBy = await models.User.findOne({ where: { id: user.referralBy } });
      if (referralBy) {
        const refBonus = (kyc.payment || 0) * 0.8;
        const currentBalance = referralBy.balance || 0;
        await referralBy.update({ balance: currentBalance + refBonus });
      }
      await models.Notification.create({ userId: referralBy.id, title, description, link, imageUrl });
    }

    // Update KYC status
    await kyc.update({ status });

    return res.status(200).json({ status: 200, message: 'KYC status updated', data: kyc });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: 'Internal server error' });
  }
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
