const express = require('express');
const router = express.Router();
const models = require('../models');

// Get the current app version
const getVersion = async (req, res) => {
    try {
        const versionData = await models.Version.findOne();
        if (!versionData) {
            return res.status(404).json({ status: 404, message: "Version data not found" });
        }
        res.status(200).json({ status: 200, data: versionData });
    } catch (error) {
        console.error("Error fetching version:", error);
        res.status(500).json({ status: 500, message: "Internal server error", error: error.message });
    }
};

// Update the app version
const updateVersion = async (req, res) => {
    try {
        const { version, forceUpdateVersion } = req.body;

        const versionData = await models.Version.findOne();
        if (!versionData) {
            return res.status(404).json({ status: 404, message: "Version data not found" });
        }

        await versionData.update({ version, forceUpdateVersion });

        res.status(200).json({ status: 200, message: "Version updated successfully", data: versionData });
    } catch (error) {
        console.error("Error updating version:", error);
        res.status(500).json({ status: 500, message: "Internal server error", error: error.message });
    }
};

module.exports = { getVersion, updateVersion };
