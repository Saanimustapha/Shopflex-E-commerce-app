const { fetchUserDetails } = require("../utils/fetchUserDetails");
const { sendEmail } = require("../config/emailProvider");


const handleAuthEvents = async (event) => {
  try {
    console.log("Auth event received:", event);

    const sendRegistrationEmail = async (userDetails) => {
      let subject, message, html;
      if (userDetails.role === "SHOP_OWNER") {
        subject = "Welcome, Shop Owner!";
        message = "Your shop owner account has been successfully created.";
        html = `
          <h1>Welcome to Our Platform, ${userDetails.username}!</h1>
          <p>We're excited to have you as a shop owner. Start managing your shop and serving your customers today!</p>
          <p><strong>Get started now and grow your business with us.</strong></p>
        `;
      } else {
        subject = "Welcome to Our Service!";
        message = "Your account has been successfully created.";
        html = `
          <h1>Hello, ${userDetails.username}!</h1>
          <p>We're thrilled to welcome you to our community. Explore and enjoy our amazing features!</p>
          <p><strong>Your journey begins now. Let’s make it memorable!</strong></p>
        `;
      }
      await sendEmail(userDetails.email, subject, message, html);
    };

    const sendLoginEmail = async (userDetails) => {
      const subject = "Login Alert!";
      const message = "Your account was accessed successfully.";
      const html = `
        <h1>Hello, ${userDetails.username}!</h1>
        <p>We noticed a login to your account just now. If this was you, enjoy your session!</p>
        <p><strong>Secure your account and always stay vigilant.</strong></p>
      `;
      await sendEmail(userDetails.email, subject, message, html);
    };

    const sendLogoutEmail = async (userDetails) => {
      const subject = "Goodbye for Now!";
      const message = "You have logged out successfully.";
      const html = `
        <h1>Goodbye, ${userDetails.username}!</h1>
        <p>You’ve logged out from your account. We’ll be here when you return!</p>
        <p><strong>Stay safe and come back soon!</strong></p>
      `;
      await sendEmail(userDetails.email, subject, message, html);
    };

    if (event.type === "user_created") {
      const userDetails = await fetchUserDetails(event.data.userId);
      if (userDetails) {
		console.log(userDetails);
        await sendRegistrationEmail(userDetails);
      }
    }

    if (event.type === "user_logged_in") {
      const userDetails = await fetchUserDetails(event.data.userId);
      if (userDetails) {
        console.log(`User ${userDetails.username} logged in.`);
        await sendLoginEmail(userDetails);
      }
    }

    if (event.type === "user_logged_out") {
      const userDetails = await fetchUserDetails(event.data.userId);
      if (userDetails) {
        console.log(`User ${userDetails.username} logged out.`);
        await sendLogoutEmail(userDetails);
      }
    }
  } catch (error) {
    console.error("Error handling auth event:", error.message);
  }
};

module.exports = { handleAuthEvents };
