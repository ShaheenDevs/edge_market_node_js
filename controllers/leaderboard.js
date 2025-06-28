const models = require('../models');

const getLeaderboard = async (req, res) => {
  try {
    const topUsers = await models.User.findAll({
      order: [['withdrawBalance', 'DESC']],
      attributes: ['id', 'fullName', 'email', 'withdrawBalance', 'profile'],
      limit: 50 // Top 50 users; adjust as needed
    });

    return res.status(200).json({
      status: 200,
      message: "Leaderboard fetched successfully",
      data: topUsers
    });
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return res.status(500).json({
      status: 500,
      message: "An error occurred while fetching leaderboard",
      error: error.message
    });
  }
};

module.exports = {
  getLeaderboard
};
