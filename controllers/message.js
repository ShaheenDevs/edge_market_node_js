const { Op, Sequelize } = require("sequelize");
const models = require("../models");

const sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, message } = req.body;

        if (senderId === undefined || receiverId === undefined || !message) {
            return res.status(400).json({ status: 400, message: "All fields are required" });
        }

        const newMessage = await models.Message.create({ senderId, receiverId, message });

        res.status(201).json({ status: 201, message: "Message sent successfully", data: newMessage });
    } catch (error) {
        console.error("Send Message Error:", error);
        res.status(500).json({ status: 500, message: "Error sending message", error: error.message });
    }
};

const getMessages = async (req, res) => {
    try {
        const { senderId, receiverId, page = 1, limit = 10 } = req.query;

        if (!senderId || !receiverId) {
            return res.status(400).json({ status: 400, message: "Sender and receiver IDs are required" });
        }

        const offset = (page - 1) * limit;

        const messages = await models.Message.findAll({
            where: {
                [Op.or]: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            },
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.status(200).json({ status: 200, message: "Messages retrieved", data: messages });
    } catch (error) {
        console.error("Get Messages Error:", error);
        res.status(500).json({ status: 500, message: "Error fetching messages", error: error.message });
    }
};

const getUserList = async (req, res) => {
    try {
        const { userId, page = 1, limit = 10 } = req.query;

        if (!userId) {
            return res.status(400).json({ status: 400, message: "User ID is required" });
        }

        const offset = (page - 1) * limit;

        const userList = await models.Message.findAll({
            attributes: [
                [
                    Sequelize.literal(`CASE 
                        WHEN \`Message\`.\`senderId\` = ${userId} THEN \`Message\`.\`receiverId\` 
                        ELSE \`Message\`.\`senderId\` END`),
                    "userId"
                ],
                [
                    Sequelize.literal(`(
                        SELECT M.message 
                        FROM \`Messages\` AS M 
                        WHERE (M.senderId = \`Message\`.senderId AND M.receiverId = \`Message\`.receiverId) 
                           OR (M.senderId = \`Message\`.receiverId AND M.receiverId = \`Message\`.senderId) 
                        ORDER BY M.createdAt DESC 
                        LIMIT 1
                    )`),
                    "lastMessage"
                ],
                [
                    Sequelize.fn("MAX", Sequelize.col("Message.createdAt")),
                    "lastMessageTime"
                ]
            ],
            include: [
                {
                    model: models.User,
                    as: "sender",
                    attributes: ["id", "fullName", "email", "profile"],
                },
                {
                    model: models.User,
                    as: "receiver",
                    attributes: ["id", "fullName", "email", "profile"],
                }
            ],
            where: {
                [Op.or]: [{ senderId: userId }, { receiverId: userId }],
            },
            group: [
                "Message.senderId",
                "Message.receiverId",
                "sender.id",
                "sender.fullName",
                "sender.email",
                "sender.profile",
                "receiver.id",
                "receiver.fullName",
                "receiver.email",
                "receiver.profile"
            ],
            order: [[Sequelize.literal("lastMessageTime"), "DESC"]],
            limit: parseInt(limit),
            offset: parseInt(offset),
            raw: false,
        });

        const formattedList = userList.map((message) => {
            const otherUser = message.sender.id === parseInt(userId) ? message.receiver : message.sender;
            return {
                userId: otherUser?.id,
                fullName: otherUser?.fullName,
                email: otherUser?.email,
                profile: otherUser?.profile,
                lastMessage: message.dataValues.lastMessage,
                lastMessageTime: message.dataValues.lastMessageTime,
            };
        });

        res.status(200).json({ status: 200, message: "User list retrieved", data: formattedList });
    } catch (error) {
        console.error("Get User List Error:", error);
        res.status(500).json({ status: 500, message: "Error fetching user list", error: error.message });
    }
};


module.exports = { sendMessage, getMessages, getUserList };
