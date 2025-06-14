//userSyncConsumer.js
const { syncUserData } = require("../handlers/userHandler");

module.exports = async (event) => {
  try {
    await syncUserData(event);
  } catch (error) {
    console.error("Error in userSyncConsumer:", error.message);
  }
};
