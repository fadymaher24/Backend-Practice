const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Server } = require("ws");
// const https = require("https");
const http = require("http");

const _ = require("lodash");
const Connection = require("./connection");
const { routers } = require("./router");
// const {connect} = require('./db');
const mongoose = require("mongoose");

// Import your Mongoose models here
const Model = require("./models");

require("dotenv").config(); // Load environment variables
const { mongodbUrl, PORT } = process.env; // Use environment variables

const app = express();

app.use(express.json());
app.use(cors({ exposedHeaders: "*" }));

// Setup Websocket Server.
app.server = http.createServer(app);
app.ws = new Server({ server: app.server });
app.connections = new Connection(app);
app.routers = routers(app);

// Connect to MongoDB
mongoose.connect(mongodbUrl);
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
  // Set Models
  app.models = new Model(app);

  // Start server
  app.server.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}`);
  });
});
