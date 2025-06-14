const User = require("../models/user");

const syncUserData = async (event) => {
  try {
    const { id, username, email, role } = event;

    if (!id || !username || !email || !role) {
      throw new Error("Missing required user fields.");
    }

    const update = { id, username, email, role };

    const result = await User.findOneAndUpdate(
      { id },
      { $set: update },
      { upsert: true, new: true }
    );

    console.log(`User data successfully synced: ${result.id}`);
  } catch (error) {
    console.error("Error syncing user data:", error.message);
  }
};

module.exports = { syncUserData };
