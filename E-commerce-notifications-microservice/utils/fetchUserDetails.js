const User = require("../models/user");

const fetchUserDetails = async (userId) => {
  try {
    const user = await User.findOne({ id: userId }).exec();
    if (!user) throw new Error(`User with ID ${userId} not found`);
    return user;
  } catch (error) {
    console.error("Failed to fetch user details:", error.message);
    return null;
  }
};

module.exports = { fetchUserDetails };
