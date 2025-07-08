const bcrypt = require('bcryptjs');
const models = require('../models');
const jwt = require('jsonwebtoken');
const Validator = require("fastest-validator");
const v = new Validator();

const signUp = async (req, res) => {
    try {
        const { fullName, email, phoneNo, profile, password, country, emailVerified, referralCode } = req.body;

        const existingUser = await models.User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(200).json({ status: 409, message: 'Email is already registered' });
        }

        const user = { fullName, email, phoneNo, profile, password, country, emailVerified };
        const schema = {
            fullName: { type: "string", min: 5, optional: true },
            email: { type: "string", min: 10 },
            phoneNo: { type: "string", optional: true },
            profile: { type: "string", optional: true },
            password: { type: "string", min: 8 },
            referralCode: { type: "string", optional: true },
            emailVerified: { type: "boolean", optional: true },
        };

        const validationResponse = v.validate(user, schema);
        if (validationResponse !== true) {
            return res.status(400).json({ status: 400, message: "Validation failed", errors: validationResponse });
        }

        user.password = await bcrypt.hash(password, 12);
        user.emailVerified = false;

        const newUser = await models.User.create(user);

        res.status(200).json({
            status: 201,
            message: "User signed up successfully.",
            data: newUser
        });
    } catch (error) {
        console.error("Sign-up error:", error);
        res.status(500).json({ status: 500, message: "An error occurred during sign-up", error: error.message });
    }
};

const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        const schema = {
            email: { type: "string" },
            password: { type: "string", min: 8 },
        };

        const validationResponse = v.validate({ email, password }, schema);
        if (validationResponse !== true) {
            return res.status(400).json({ status: 400, message: "Validation failed", errors: validationResponse });
        }

        const user = await models.User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ status: 404, message: 'No user registered with this email' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ status: 401, message: "Incorrect password" });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            status: 200,
            message: "Signed in successfully",
            data: {
                ...user.toJSON(),
                token,
                expiresIn: "7d"
            }
        });
    } catch (error) {
        console.error("Sign-in error:", error);
        res.status(500).json({ status: 500, message: "An error occurred during sign-in", error: error.message });
    }
};

const getUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await models.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            status: 200,
            message: "User data retrieved successfully",
            data: {
                ...user.toJSON(),
                token,
                expiresIn: "7d"
            }
        });
    } catch (error) {
        console.error("Get user error:", error);
        return res.status(500).json({ status: 500, message: "Failed to retrieve user", error: error.message });
    }
};


const updateProfile = async (req, res) => {
    try {
        const { id, fullName, email, phoneNo, profile, password, country, referralCode, emailVerified, referralsBy, language, kycStatus } = req.body;

        const user = await models.User.findOne({ where: { id } });
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const updatedData = { fullName, email, phoneNo, profile, password, country, referralCode, emailVerified, referralsBy, language, kycStatus };

        const schema = {
            fullName: { type: "string", min: 5, optional: true },
            email: { type: "string", optional: true },
            phoneNo: { type: "string", optional: true },
            profile: { type: "string", optional: true },
            password: { type: "string", min: 8, optional: true },
            country: { type: "string", optional: true },
            referralCode: { type: "string", optional: true },
            emailVerified: { type: "boolean", optional: true },
            language: { type: "string", optional: true },
            kycStatus: { type: "string", optional: true },
            referralsBy: { type: "number", optional: true },
        };

        const validationResponse = v.validate(updatedData, schema);
        if (validationResponse !== true) {
            return res.status(400).json({ status: 400, message: "Validation failed", errors: validationResponse });
        }

        if (password) {
            updatedData.password = await bcrypt.hash(password, 12);
        }

        await user.update(updatedData);

        res.status(200).json({ status: 200, message: "Profile updated successfully", data: user });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ status: 500, message: 'An error occurred while updating the profile', error: error.message });
    }
};

const delUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const deletionResult = await models.User.destroy({ where: { id: userId } });

        if (deletionResult) {
            return res.status(200).json({ status: 200, message: 'Account deleted successfully' });
        } else {
            return res.status(404).json({ status: 404, message: 'Account not found' });
        }
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ status: 500, message: 'An error occurred while deleting the account', error: error.message });
    }
};

const updateVerification = async (req, res) => {
    try {
        const { userId, emailVerified } = req.body;

        if (!userId) {
            return res.status(400).json({ status: 400, message: 'User ID is required.' });
        }

        const user = await models.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found.' });
        }

        await user.update({ emailVerified });

        res.status(200).json({
            status: 200,
            message: 'User verification status updated successfully.',
            data: user
        });
    } catch (error) {
        console.error("Update verification error:", error);
        res.status(500).json({ status: 500, message: "An error occurred while updating verification status.", error: error.message });
    }
};

module.exports = {
    signUp,
    signIn,
    getUser,
    updateProfile,
    delUser,
    updateVerification
};
