const { User } = require('../models');
const { Sequelize } = require('sequelize');

// GET: All users referred by a specific user + KYC status counts
const getReferrals = async (req, res) => {
    try {
        const userId  = req.params.id;

        // Fetch referred users
        const referrals = await User.findAll({
            where: { referralBy: userId },
            attributes: ['id', 'fullName', 'email', 'profile', 'balance', 'kycStatus'],
        });

        // Count users by kycStatus
        const kycCountsRaw = await User.findAll({
            where: { referralBy: userId },
            attributes: ['kycStatus', [Sequelize.fn('COUNT', Sequelize.col('kycStatus')), 'count']],
            group: ['kycStatus'],
            raw: true,
        });

        // Format counts into object: { pending: 2, approved: 1, ... }
        const kycCounts = {
            not_applied: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
        };
        for (const row of kycCountsRaw) {
            kycCounts[row.kycStatus] = parseInt(row.count);
        }

        res.status(200).json({ success: true, data: referrals, kycCounts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



// GET: User and their referred users (referral tree)
const getReferralTree = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId, {
            attributes: ['id', 'fullName', 'email', 'referralCode'],
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const referrals = await User.findAll({
            where: { referralBy: userId },
            attributes: ['id', 'fullName', 'email', 'referralCode'],
        });

        res.status(200).json({
            success: true,
            data: {
                user,
                referrals,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
module.exports = {
    getReferrals,
    getReferralTree,
};