const { fetchUserDetails } = require("../utils/fetchUserDetails");
const { sendEmail } = require("../config/emailProvider");


const handleProductEvents = async (event) => {
  try {
    if (event.type === "product_created") {
      const { title, description, price, quantity, seller, createdAt } = event.data;

      const sellerDetails = await fetchUserDetails(seller.id);
      if (sellerDetails) {
        const formattedDate = new Date(createdAt).toLocaleDateString();
        const messageBody = `
          <p>Hi ${sellerDetails.username},</p>
          <p>Your new product has been created successfully:</p>
          <ul>
            <li><b>Title:</b> ${title}</li>
            <li><b>Description:</b> ${description}</li>
            <li><b>Price:</b> $${price}</li>
            <li><b>Quantity:</b> ${quantity}</li>
          </ul>
          <p>Created on: ${formattedDate}</p>
        `;
        await sendEmail(
          sellerDetails.email,
          "Product Created Successfully",
          `Your product "${title}" has been successfully created!`,
          messageBody
        );
      }
    }

    if (event.type === "product_updated") {
      const { title, description, price, quantity, category, seller } = event.data;

      const sellerDetails = await fetchUserDetails(seller.id);
      if (sellerDetails) {
        const messageBody = `
          <p>Hi ${sellerDetails.username},</p>
          <p>Your product has been updated successfully with the following details:</p>
          <ul>
            <li><b>Title:</b> ${title}</li>
            <li><b>Description:</b> ${description}</li>
            <li><b>Category:</b> ${category}</li>
            <li><b>Price:</b> $${price}</li>
            <li><b>Current Quantity:</b> ${quantity}</li>
          </ul>
          <p>If you didn’t request this update, please contact our support team immediately.</p>
          <p>Thank you for keeping your products up to date!</p>
        `;
        await sendEmail(
          sellerDetails.email,
          "Product Updated Successfully",
          `Your product "${title}" has been successfully updated!`,
          messageBody
        );
      }
    }

    if (event.type === "product_deleted") {
      const { title, description, category, price, seller, quantity } = event.data;

      const sellerDetails = await fetchUserDetails(seller.id);
      if (sellerDetails) {
        const messageBody = `
          <p>Hi ${sellerDetails.username},</p>
          <p>We have processed your request to delete the following product:</p>
          <ul>
            <li><b>Title:</b> ${title}</li>
            <li><b>Description:</b> ${description}</li>
            <li><b>Category:</b> ${category}</li>
            <li><b>Price:</b> $${price}</li>
            <li><b>Remaining Quantity Before Deletion:</b> ${quantity}</li>
          </ul>
          <p>Your product has been successfully removed from our platform.</p>
          <p>If you deleted this by mistake or need assistance, feel free to contact us at <a href="mailto:support@example.com">support@example.com</a>.</p>
          <p>Warm regards,</p>
          <p><b>Your Product Team</b></p>
        `;
        await sendEmail(
          sellerDetails.email,
          "Product Deleted Successfully",
          `Your product "${title}" has been successfully deleted.`,
          messageBody
        );
      }
    }
  } catch (error) {
    console.error("Error handling product event:", error.message);
  }
};


module.exports = { handleProductEvents };
