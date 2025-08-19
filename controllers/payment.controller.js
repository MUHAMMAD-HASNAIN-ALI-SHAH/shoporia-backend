const User = require("../models/auth.model");
const dotenv = require("dotenv");
const Cart = require("../models/cart.model");
const Order = require("../models/order.model");
dotenv.config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Create Checkout Session
const createCheckOutSession = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = req.session.user;
    const getUser = await User.findOne({ email: user.email });
    if (!getUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get pending cart
    const getCart = await Cart.findOne({
      email: getUser.email,
      paymentStatus: "pending",
    });

    if (!getCart) {
      return res.status(404).json({ message: "No pending cart found" });
    }

    // Get all orders linked to this cart
    const orders = await Order.find({ cartId: getCart._id }).populate(
      "product"
    );
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No products in cart" });
    }

    // Prepare line items for Stripe
    const line_items = orders.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.name,
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/my-orders`,
      cancel_url: `${process.env.FRONTEND_URL}`,
      customer_email: getUser.email,
      metadata: {
        userId: getUser._id.toString(),
        cartId: getCart._id.toString(),
        orders: JSON.stringify(
          orders.map((o) => ({
            orderId: o._id.toString(),
            quantity: o.quantity,
          }))
        ),
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
};

// Stripe Webhook
// const webHook = async (req, res) => {
//   console.log("🔥 Webhook request received");

//   // Debug: Log headers
//   console.log("📩 Headers:", req.headers);

//   // Debug: Check body type
//   console.log("📦 Raw body type:", typeof req.body);

//   const sig = req.headers["stripe-signature"];
//   console.log("🔑 Stripe signature from headers:", sig);

//   let event;

//   try {
//     console.log("⚡ Constructing Stripe event...");
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//     console.log("✅ Stripe event constructed successfully:", event.type);
//   } catch (err) {
//     console.error("❌ Webhook signature verification failed:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // Debug log for full event
//   console.log("📌 Full Event Object:", JSON.stringify(event, null, 2));

//   if (event.type === "checkout.session.completed") {
//     console.log("🎉 Event: checkout.session.completed triggered");

//     const session = event.data.object;
//     console.log("🛒 Checkout Session object:", session);

//     const email = session.customer_email;
//     console.log("📧 Extracted customer email:", email);

//     try {
//       console.log("🔍 Searching for pending cart with email:", email);
//       const getCart = await Cart.findOne({ email, paymentStatus: "pending" });

//       if (!getCart) {
//         console.error("⚠️ No pending cart found for email:", email);
//         return res.status(404).json({ message: "No pending cart found" });
//       }

//       console.log("🛒 Cart found:", getCart);

//       // Update cart status
//       console.log(
//         `🔄 Updating cart ${getCart._id} paymentStatus to 'completed'`
//       );
//       getCart.paymentStatus = "completed";
//       await getCart.save();

//       console.log(`✅ Cart ${getCart._id} marked as completed`);
//     } catch (err) {
//       console.error("❌ Error processing webhook:", err);
//     }
//   } else {
//     console.log(`ℹ️ Event type ${event.type} received, no action taken`);
//   }

//   console.log("📤 Sending response to Stripe...");
//   res.json({ received: true });
// };

const webHook = async (req, res) => {
  console.log("🔥 Webhook request received");

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // req.body is a raw buffer because of express.raw()
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("⚡ Stripe event constructed:", event.type);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("💰 Checkout session completed for email:", session.customer_email);

    try {
      const getCart = await Cart.findOne({ email: session.customer_email, paymentStatus: "pending" });
      if (!getCart) {
        console.error("No pending cart found for webhook");
        return res.status(404).json({ message: "No pending cart found" });
      }

      // Update cart status
      getCart.paymentStatus = "completed";
      await getCart.save();
      console.log(`✅ Cart ${getCart._id} marked as completed`);
    } catch (err) {
      console.error("❌ Error processing webhook:", err);
    }
  }

  res.json({ received: true });
};

module.exports = {
  createCheckOutSession,
  webHook,
};
