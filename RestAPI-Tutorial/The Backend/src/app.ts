import express from "express";
import bodyParser from "body-parser";
import path from "path";
import mongoose from "mongoose";

import feedRoutes from "./routes/feed";

import dotenv from "dotenv";
dotenv.config();

const urL: string = process.env.MONGO_URL!;
const port: number = Number(process.env.PORT);

const app = express();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);

app.use((error: any, req: any, res: any, next: any) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

mongoose
  .connect(urL)
  .then((result) => {
    console.log("Connected to MongoDB");
    app.listen(port);
  })
  .catch((err) => console.log(err));
