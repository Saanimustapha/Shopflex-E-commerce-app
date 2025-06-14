const { fetchUserDetails } = require("../utils/fetchUserDetails");
const getProductQuantityFromES = require('../elastic/getProductQuantityFromES');
const { sendEmail } = require("../config/emailProvider");


const handleOrderEvents = async (event) => {
  try {
    switch (event.type) {
      case "order_placed": {
        const userDetailsPromise = fetchUserDetails(event.data.userId);

        const sellerPromises = event.data.sellerIds.map(async (sellerId, index) => {
          const sellerDetails = await fetchUserDetails(sellerId);
          
          const remainingQuantity = await getProductQuantityFromES(event.data.titles[index]);

          if (sellerDetails) {
            const sellerMessage = `
              <p style="font-family: Arial, sans-serif; color: #333;">
                Hi <b>${sellerDetails.username}</b>,
              </p>
              <p>A new order has been placed for your product:</p>
              <ul style="list-style-type: none; padding: 0;">
                <li><b>Product:</b> ${event.data.titles[index]}</li>
                <li><b>Quantity Ordered:</b> ${event.data.quantities[index]}</li>
                <li><b>Remaining Stock:</b> ${remainingQuantity || "Unknown"}</li>
              </ul>
              <p>Please prepare the order promptly. Thank you!</p>
            `;
            await sendEmail(
              sellerDetails.email,
              "New Order Received",
              `A new order has been placed for "${event.data.titles[index]}"`,
              sellerMessage
            );
          }
        });

        await Promise.all(sellerPromises);

        const userDetails = await userDetailsPromise;
        if (userDetails) {
          const productList = event.data.titles.map((title, index) => {
            return `<li>${title} (Quantity: ${event.data.quantities[index]})</li>`;
          }).join("");

          const userMessage = `
            <p style="font-family: Arial, sans-serif; color: #333;">
              Hi <b>${userDetails.username}</b>,
            </p>
            <p>Your order has been successfully placed:</p>
            <ul>${productList}</ul>
            <p>Thank you for shopping with us!</p>
          `;
          await sendEmail(
            userDetails.email,
            "Order Placed",
            `Your order for "${event.data.titles.join(", ")}" has been placed successfully.`,
            userMessage
          );
        }

        break;
      }

      case "order_updated": {
        const userDetailsPromise = fetchUserDetails(event.data.userId);

        const sellerPromises = event.data.sellerIds.map(async (sellerId, index) => {
          const sellerDetails = await fetchUserDetails(sellerId);
          
          // Fetch the remaining quantity from Elasticsearch for the particular product
          const remainingQuantity = await getProductQuantityFromES(event.data.titles[index]);

          if (sellerDetails) {
            const sellerMessage = `
              <p style="font-family: Arial, sans-serif; color: #333;">
                Hi <b>${sellerDetails.username}</b>,
              </p>
              <p>The order for your product has been updated:</p>
              <ul style="list-style-type: none; padding: 0;">
                <li><b>Product:</b> ${event.data.titles[index]}</li>
                <li><b>Updated Quantity:</b> ${event.data.quantities[index]}</li>
                <li><b>Remaining Stock:</b> ${remainingQuantity || "Unknown"}</li>
              </ul>
              <p>Keep track of your stock levels and fulfill this updated order. Thank you!</p>
            `;
            await sendEmail(
              sellerDetails.email,
              "Order Updated",
              `The order for "${event.data.titles[index]}" has been updated`,
              sellerMessage
            );
          }
        });

        await Promise.all(sellerPromises);

        const userDetails = await userDetailsPromise;
        if (userDetails) {
          const productList = event.data.titles.map((title, index) => {
            return `<li>${title} (Updated Quantity: ${event.data.quantities[index]})</li>`;
          }).join("");

          const userMessage = `
            <p style="font-family: Arial, sans-serif; color: #333;">
              Hi <b>${userDetails.username}</b>,
            </p>
            <p>Your order has been updated:</p>
            <ul>${productList}</ul>
            <p>Thank you for your continued support!</p>
          `;
          await sendEmail(
            userDetails.email,
            "Order Updated",
            `Your order for "${event.data.titles.join(", ")}" has been updated.`,
            userMessage
          );
        }

        break;
      }

      case "order_deleted": {
        const userDetailsPromise = fetchUserDetails(event.data.userId);

        const sellerPromises = event.data.sellerIds.map(async (sellerId, index) => {
		  console.log('seller id', Number(sellerId))
          const sellerDetails = await fetchUserDetails(Number(sellerId));
          
          // Fetch the remaining quantity from Elasticsearch for the particular product
          const remainingQuantity = await getProductQuantityFromES(event.data.titles[index]);

          if (sellerDetails) {
            const sellerMessage = `
              <p style="font-family: Arial, sans-serif; color: #333;">
                Hi <b>${sellerDetails.username}</b>,
              </p>
              <p>An order for your product has been cancelled:</p>
              <ul style="list-style-type: none; padding: 0;">
                <li><b>Product:</b> ${event.data.titles[index]}</li>
                <li><b>Cancelled Quantity:</b> ${event.data.quantities[index]}</li>
                <li><b>Remaining Stock:</b> ${remainingQuantity || "Unknown"}</li>
              </ul>
              <p>We regret the cancellation but trust you'll continue providing great service!</p>
            `;
            await sendEmail(
              sellerDetails.email,
              "Order Cancelled",
              `The order for "${event.data.titles[index]}" has been cancelled.`,
              sellerMessage
            );
          }
        });

        await Promise.all(sellerPromises);

        const userDetails = await userDetailsPromise;
        if (userDetails) {
          const productList = event.data.titles.map((title, index) => {
            return `<li>${title} (Cancelled Quantity: ${event.data.quantities[index]})</li>`;
          }).join("");

          const userMessage = `
            <p style="font-family: Arial, sans-serif; color: #333;">
              Hi <b>${userDetails.username}</b>,
            </p>
            <p>Your order has been cancelled:</p>
            <ul>${productList}</ul>
            <p>We’re sorry for any inconvenience caused.</p>
          `;
          await sendEmail(
            userDetails.email,
            "Order Cancelled",
            `Your order for "${event.data.titles.join(", ")}" has been cancelled.`,
            userMessage
          );
        }

        break;
      }
	  
	  
	  case "order_status_updated": {
        const { orderId, userId, sellerIds, titles, quantities, status } = event.data;

        const userDetailsPromise = fetchUserDetails(userId);

        const sellerPromises = sellerIds.map(async (sellerId, index) => {
          const sellerDetails = await fetchUserDetails(sellerId);
          const remainingQuantity = await getProductQuantityFromES(titles[index]);

          if (sellerDetails) {
            const sellerMessage = `
              <p style="font-family: Arial, sans-serif; color: #333;">
                Hi <b>${sellerDetails.username}</b>,
              </p>
              <p>The status of an order for your product has been updated:</p>
              <ul style="list-style-type: none; padding: 0;">
                <li><b>Order ID:</b> ${orderId}</li>
                <li><b>Product:</b> ${titles[index]}</li>
                <li><b>Quantity:</b> ${quantities[index]}</li>
                <li><b>Status:</b> ${status}</li>
                <li><b>Remaining Stock:</b> ${remainingQuantity || "Unknown"}</li>
              </ul>
              <p>Stay updated on the order and ensure timely communication with the buyer. Thank you!</p>
            `;
            await sendEmail(
              sellerDetails.email,
              "Order Status Updated",
              `The status of an order for "${titles[index]}" has been updated.`,
              sellerMessage
            );
          }
        });

        await Promise.all(sellerPromises);

        const userDetails = await userDetailsPromise;
        if (userDetails) {
          const productList = titles.map((title, index) => {
            return `<li>${title} (Quantity: ${quantities[index]})</li>`;
          }).join("");

          const userMessage = `
            <p style="font-family: Arial, sans-serif; color: #333;">
              Hi <b>${userDetails.username}</b>,
            </p>
            <p>The status of your order has been updated:</p>
            <ul>
              <li><b>Order ID:</b> ${orderId}</li>
              <li><b>Status:</b> ${status}</li>
              <li><b>Products:</b></li>
              <ul>${productList}</ul>
            </ul>
            <p>Thank you for shopping with us! If you have any questions, feel free to contact us.</p>
          `;
          await sendEmail(
            userDetails.email,
            "Order Status Updated",
            `The status of your order (${orderId}) has been updated to "${status}".`,
            userMessage
          );
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
        break;
    }
  } catch (error) {
    console.error("Error handling order event:", error.message);
  }
};

module.exports = { handleOrderEvents };
