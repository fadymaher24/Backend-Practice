import express from "express";
import { body } from "express-validator";

import User from "../models/user";

const authController = require("../controllers/auth");
const router = express.Router();

router.put(
  "/signup",
  [
    body("email").isEmail().withMessage("Please enter a valid email."),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Please enter a password with at least 5 characters.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-Mail address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  authController.signup
);

// router.post("/login", authController.login);

export default router;

// Path: src/controllers/auth.ts