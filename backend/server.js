require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const listingsRouter = require("./routes/listings");
const adminRouter = require("./routes/admin");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/listings", listingsRouter);
app.use("/api/admin", adminRouter);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "PrimeMarket API is running" });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/primemarket";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
