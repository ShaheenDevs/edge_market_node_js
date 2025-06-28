const express = require('express');
const models = require('../models');
const { Op } = require("sequelize");

// Create a new notification
const addNotification = async (req, res) => {
  try {
    const { title, description, link, imageUrl } = req.body;
    const userId = req.userData["userId"];
    const newNotification = await models.Notification.create({ userId, title, description, link, imageUrl });

    res.status(201).json({ status: 201, message: "Notification created", data: newNotification });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ status: 500, message: "Internal server error", error: error.message });
  }
};

// Get notifications with pagination (20 per page)
const getNotifications = async (req, res) => {
  try {
    const userId = req.userData["userId"];
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await models.Notification.findAndCountAll({
      limit,
      offset,
      where: {
        [Op.or]: [{ userId }, { userId: 0 }],
      },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      status: 200,
      total: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ status: 500, message: "Internal server error", error: error.message });
  }
};

// Update a notification
const updateNotification = async (req, res) => {
  try {
    const { title, description, link, imageUrl } = req.body;
    const notification = await models.Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({ status: 404, message: "Notification not found" });
    }

    await notification.update({ title, description, link, imageUrl });

    res.status(200).json({ status: 200, message: "Notification updated", data: notification });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ status: 500, message: "Internal server error", error: error.message });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const notification = await models.Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({ status: 404, message: "Notification not found" });
    }

    await notification.destroy();
    res.status(200).json({ status: 200, message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ status: 500, message: "Internal server error", error: error.message });
  }
};

module.exports = { addNotification, getNotifications, updateNotification, deleteNotification };
