const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/tender_app";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api", require("./routes/dashboard"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/terms", require("./routes/terms"));
app.use("/api/tenders", require("./routes/tenders"));
app.use("/api/documents", require("./routes/documents"));

const SavedDocument = require("./models/SavedDocument");
app.get("/api/tenders/:id/documents", async (req, res) => {
  try {
    const docs = await SavedDocument.find({ tenderId: parseInt(req.params.id) }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/", (req, res) => {
  res.send("Welcome to the Tender App API! The frontend is served separately.");
});

// 404 Handler
app.use((req, res) => {
  console.log(`[404] Unhandled request: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
