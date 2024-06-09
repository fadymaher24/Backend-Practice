const express = require("express");
const _ = require("lodash");
const UserService = require("./models/user");
const TokenService = require("./models/token");
const Camera = require("./models/camera");

const {
  allowAuthenticatedUser,
  errorHandle,
  responseHandle,
} = require("./middleware");

const routers = (app) => {
  const router = express.Router();

  // Root API
  router.get("/", (req, res) => {
    return res.json({ version: "1.0" });
  });

  // Authentication for live stream user
  router.post("/api/on-live-auth", (req, res) => {
    const streamInfo = req.body;
    const streamSecretKey = _.get(streamInfo, "name");
    console.log(`Verifying secret streaming key: ${streamSecretKey}`);
    console.log("Stream info", streamInfo);
    return res.status(200).json({ verified: true });
  });

  // Event after user finishing streaming
  router.post("/api/on-live-done", (req, res) => {
    const streamingKey = _.get(req, "body.name");
    console.log(`User finished streaming camera.`, streamingKey);
    return res.json({ done: true });
  });

  // Send command to server with camera ID to stream or stop stream
  router.post("/api/camera/:id/stream", (req, res) => {
    const body = req.body;
    console.log("Got body command", body);
    const payload = _.get(body, "stream", false);
    const connections = app.connections.getClients();
    connections.forEach((con) => {
      const ws = con.ws;
      if (ws) {
        const message = {
          action: "stream",
          payload: payload,
        };
        ws.send(JSON.stringify(message));
      }
    });
    return res.status(200).json({ received: true });
  });

  // Create new user
  router.post("/api/users", async (req, res) => {
    const body = req.body;
    const userService = new UserService(app);
    try {
      const result = await userService.create(body);
      _.unset(result, "password");
      return responseHandle(res, result);
    } catch (err) {
      if (err.name === "ValidationError") {
        const errorMessage = Object.values(err.errors)
          .map((e) => e.message)
          .join(", ");
        return errorHandle(res, errorMessage, 400);
      } else {
        return errorHandle(res, err.message, 503);
      }
    }
  });

  // Get owner info
  router.get("/api/users/me", async (req, res) => {
    let tokenId = req.get("authorization");
    if (!tokenId) {
      tokenId = req.query.auth;
    }
    if (!tokenId) {
      return errorHandle(res, "Token missing", 401);
    }
    try {
      const tokenService = new TokenService(app);
      const result = await tokenService.load(tokenId);
      if (!result) {
        return errorHandle(res, "Token verify error", 401);
      }
      return responseHandle(res, result);
    } catch (err) {
      console.log("Token verify error:", err);
      return errorHandle(res, "Token verify error", 401);
    }
  });

  // Get owner cameras
  router.get("/api/me/cameras", allowAuthenticatedUser, async (req, res) => {
    const userId = req.ctx.token.userId;
    const query = { userId: new mongoose.Types.ObjectId(userId) };
    const projection = {
      _id: true,
      name: true,
      created: true,
      live: true,
      lastConnected: true,
      isConnected: true,
    };

    try {
      const results = await Camera.find(query, projection);
      return responseHandle(res, results);
    } catch (err) {
      return errorHandle(res, err, 404);
    }
  });

  // Add new user camera
  router.post("/api/me/cameras", allowAuthenticatedUser, async (req, res) => {
    let camera = req.body;
    if (!camera) {
      return errorHandle(res, "Camera is required", 400);
    }
    const userId = req.ctx.token.userId;
    camera.userId = userId;

    try {
      const result = await Camera.create(camera);
      return responseHandle(res, result, 200);
    } catch (err) {
      return errorHandle(res, err);
    }
  });

  // Login a user and return token object
  router.post("/api/users/login", async (req, res) => {
    const userData = req.body;
    if (!_.get(userData, "email") || !_.get(userData, "password")) {
      return errorHandle(res, "Email & Password is required", 400);
    }
    const userService = new UserService(app);
    try {
      const result = await userService.login(
        _.get(userData, "email", ""),
        _.get(userData, "password", "")
      );
      return responseHandle(res, result);
    } catch (err) {
      return errorHandle(res, err.message, 401);
    }
  });
  // Logout route
  router.post("/api/users/logout", allowAuthenticatedUser, async (req, res) => {
    const tokenId = req.ctx.token._id;
    try {
      const tokenService = new TokenService(app);
      await tokenService.delete(tokenId);
      return responseHandle(res, { message: "Logout successful" });
    } catch (err) {
      console.log("Logout error:", err);
      return errorHandle(res, "Logout failed", 500);
    }
  });

  app.use(router);
};

module.exports = {
  routers,
};
