
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);

app.use(express.json({ limit: "1mb" }));

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  })
);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ArtSpace Backend API is running",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`ArtSpace Server running on port ${PORT}`);
  });
};

startServer();
