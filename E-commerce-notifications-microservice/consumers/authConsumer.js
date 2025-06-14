//authConsumer.js
const { handleAuthEvents } = require("../handlers/authHandler");

module.exports = async (event) => {
  try {
    await handleAuthEvents(event);
  } catch (error) {
    console.error("Error in authConsumer:", error.message);
  }
};
