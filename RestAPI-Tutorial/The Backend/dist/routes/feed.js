"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const feedController = require("../controllers/feed");
const router = express_1.default.Router();
// GET /feed/posts
router.get("/posts", feedController.getPosts);
// POST /feed/post
router.post("/post", [
    (0, express_validator_1.body)("title").trim().isLength({ min: 5 }),
    (0, express_validator_1.body)("content").trim().isLength({ min: 5 }),
], feedController.createPost);
exports.default = router;
