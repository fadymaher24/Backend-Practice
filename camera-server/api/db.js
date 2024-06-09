const mongoose = require("mongoose");
require("dotenv").config();

const { mongodbUrl } = process.env;

mongoose.connect(mongodbUrl);

const db = mongoose.connection;

db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

db.once("open", () => {
  console.log("Connected to MongoDB");
});
