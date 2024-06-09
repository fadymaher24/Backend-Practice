import express from "express";
// import {
//   getIndex,
//   startStreaming,
//   stopStreaming,
// } from "../controllers/streamController";
import { handleConnection } from "../controllers/streamController";
const router = express.Router();

router.get("/", handleConnection);

// router.get("/", getIndex);
// router.get("/start-stream", startStreaming);
// router.get("/stop-stream", stopStreaming);

export default router;
