const express = require("express");
const session = require("express-session");
require("dotenv").config();
const connectDb = require("./lib/db");
const app = express();
const cors = require("cors");
const MongoStore = require("connect-mongo");
const { webHook } = require("./controllers/payment.controller");

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
    },
  })
);

// Hello route
app.get("/", (req, res) => res.send("Hello World!"));

// --- WEBHOOK: exact path, raw body
app.post(
  "/api/v5/payment/webhook",
  express.raw({ type: "application/json" }),
  webHook
);

// --- Normal JSON for everything else
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/api/v1/auth", require("./routes/auth.route"));
app.use("/api/v2/admin", require("./routes/admin.route"));
app.use("/api/v3/product", require("./routes/product.route"));
app.use("/api/v4/cart", require("./routes/cart.route"));
app.use("/api/v5/payment", require("./routes/payment.route"));
app.use("/api/v6/order", require("./routes/order.route"));
app.use("/api/v7/address", require("./routes/address.route"));
app.use("/api/v8/rating", require("./routes/rating.route"));

const port = process.env.PORT || 8080;

connectDb().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});
