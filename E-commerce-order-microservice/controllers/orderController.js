const Order = require("../models/orderModel");
const { sendMessage } = require("../config/rabbitmq");
const ProductCache = require("../models/productCacheModel");
const { validateProductsAndCalculateTotal } = require("../integrations/validateAndCalculateProducts");



// Create an order
exports.createOrder = async (req, res) => {
  try {
    const { products, location } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Products are required" });
    }

    // Validate products and calculate total, product details, etc.
    const { totalAmount, productDetails, inventoryUpdates, productCount } =
      await validateProductsAndCalculateTotal(products);

    // Extract location from req.body.location.
    // Use provided location if available, otherwise default to 0.0 values.
    const userLocation = location && location.latitude && location.longitude
      ? location
      : { latitude: 0.0, longitude: 0.0 };

    const order = new Order({
      user: { id: req.user.user_id, profileUrl: req.user.profileUrl },
      products: productDetails.map(({ productId, quantity }) => ({ productId, quantity })),
      totalAmount,
      location: userLocation, // Save the location data with the order
    });

    await order.save();

    // Send inventory updates first
    sendMessage("update_inventory", inventoryUpdates);

    setTimeout(() => {
      sendMessage("order_events_for_notifications", {
        type: "order_placed",
        data: {
          orderId: order.id,
          userId: req.user.user_id,
          totalProducts: productCount,
          productIds: productDetails.map(({ productId }) => productId),
          quantities: productDetails.map(({ quantity }) => quantity),
          sellerIds: productDetails.map(({ sellerId }) => sellerId),
          titles: productDetails.map(({ title }) => title),
        },
      });
    }, 5000);

    res.status(201).json(order);
  } catch (err) {
    console.error("Error in createOrder:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// Get all orders in the database (Admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    console.error("Error in getAllOrders:", err.message);
    res.status(500).json({ message: err.message });
  }
};


// Get all orders for a user
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ "user.id": req.user.user_id });
    res.json(orders);
  } catch (err) {
    console.error("Error in getOrders:", err.message);
    res.status(500).json({ message: err.message });
  }
};



// Get an order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error("Error in getOrderById:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// Get orders by user ID (Admin only)
exports.getOrdersByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Validate if userId is provided
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const orders = await Order.find({ "user.id": userId });

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.json(orders);
  } catch (err) {
    console.error("Error in getOrdersByUserId:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Update an order
exports.updateOrder = async (req, res) => {
  try {
    const { products } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (String(order.user.id) !== String(req.user.user_id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (order.status !== "Pending") {
      return res.status(400).json({ message: "Only pending orders can be updated" });
    }

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Products are required" });
    }

    const previousProducts = order.products;

    const { totalAmount, productDetails, inventoryUpdates } =
      await validateProductsAndCalculateTotal(products);

    // Calculate inventory reversals for the previous state
    const reverseInventoryUpdates = previousProducts.map((prevProduct) => ({
      productId: prevProduct.productId,
      quantity: prevProduct.quantity, 
    }));

    order.products = productDetails;
    order.totalAmount = totalAmount;

    await order.save();

    // Send inventory updates first
    sendMessage("update_inventory", [...reverseInventoryUpdates, ...inventoryUpdates]);

    // Set a 5-second delay for the order events notification
    setTimeout(() => {
      sendMessage("order_events_for_notifications", {
        type: "order_updated",
        data: {
          orderId: order.id,
          userId: req.user.user_id,
          totalProducts: productDetails.length,
          productIds: productDetails.map(({ productId }) => productId),
          quantities: productDetails.map(({ quantity }) => quantity),
          sellerIds: productDetails.map(({ sellerId }) => sellerId),
          titles: productDetails.map(({ title }) => title),
        },
      });
    }, 5000);


    res.json(order);
  } catch (err) {
    console.error("Error in updateOrder:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// Delete an order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (String(order.user.id) !== String(req.user.user_id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (order.status !== "Pending") {
      return res.status(400).json({ message: "Only pending orders can be deleted" });
    }

    // Fetch detailed product information for deleted order
    const productDetails = await Promise.all(
      order.products.map(async (product) => {
        const productRecord = await ProductCache.findById(product.productId);

        return productRecord
          ? {
              productId: product.productId,
              quantity: product.quantity,
              sellerId: productRecord.seller.id, 
              title: productRecord.title,        
            }
          : {
              productId: product.productId,
              quantity: product.quantity,
              sellerId: null,
              title: null,
            };
      })
    );

    const reverseInventoryUpdates = productDetails.map((product) => ({
      productId: product.productId,
      quantity: product.quantity, 
    }));

    // Delete the order using `deleteOne` or `findByIdAndDelete`
    await Order.deleteOne({ _id: req.params.id });

    // Send inventory updates first
    sendMessage("update_inventory", reverseInventoryUpdates);


    setTimeout(() => {
      sendMessage("order_events_for_notifications", {
        type: "order_deleted",
        data: {
          orderId: order.id,
          userId: req.user.user_id,
          totalProducts: productDetails.length,
          productIds: productDetails.map(({ productId }) => productId),
          quantities: productDetails.map(({ quantity }) => quantity),
          sellerIds: productDetails.map(({ sellerId }) => sellerId),
          titles: productDetails.map(({ title }) => title),
        },
      });
    }, 5000);


    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Error in deleteOrder:", err.message);
    res.status(500).json({ message: err.message });
  }
};


// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!["Pending", "Shipped", "Delivered", "Cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    order.status = status;
    await order.save();
	
	const productDetails = await Promise.all(
      order.products.map(async (product) => {
        const productRecord = await ProductCache.findById(product.productId);

        return productRecord
          ? {
              productId: product.productId,
              quantity: product.quantity,
              sellerId: productRecord.seller.id, 
              title: productRecord.title,        
            }
          : {
              productId: product.productId,
              quantity: product.quantity,
              sellerId: null,
              title: null,
            };
      })
    );
	
	setTimeout(() => {
      sendMessage("order_events_for_notifications", {
        type: "order_status_updated",
        data: {
          orderId: order.id,
          userId: order.user.id,
          totalProducts: productDetails.length,
          productIds: productDetails.map(({ productId }) => productId),
          quantities: productDetails.map(({ quantity }) => quantity),
          sellerIds: productDetails.map(({ sellerId }) => sellerId),
          titles: productDetails.map(({ title }) => title),
		  status: status
        },
      });
    }, 5000);


    res.json(order);
  } catch (err) {
    console.error("Error in updateOrderStatus:", err.message);
    res.status(500).json({ message: err.message });
  }
};



// Fetch orders placed for a seller's products
exports.getOrdersBySeller = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;

    // Find orders that have products from the given seller
    const orders = await Order.find({ "products.productId": { $exists: true } })
      .populate("products.productId", "seller title price")
      .lean();

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this seller." });
    }

    const sellerOrders = orders
      .map(order => ({
        orderId: order._id,
        user: order.user,
        products: order.products
          .filter(product => product.productId?.seller?.id === sellerId)
          .map(product => ({
            productId: product.productId._id,
            title: product.productId.title,
            quantity: product.quantity,
            status: product.status,
          })),
        totalAmount: order.totalAmount,
        orderStatus: order.status,
		paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
      }))
      .filter(order => order.products.length > 0); // Remove orders without matching seller products

    res.json(sellerOrders);
  } catch (err) {
    console.error("Error in getOrdersBySeller:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// Update the status of a single product in an order
exports.updateProductStatusInOrder = async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const product = order.products.find(product => product.productId.toString() === productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found in the order." });
    }

    product.status = status;
    await order.save();

    res.json({ message: "Product status updated successfully", product });
  } catch (err) {
    console.error("Error in updateProductStatusInOrder:", err.message);
    res.status(500).json({ message: err.message });
  }
};
