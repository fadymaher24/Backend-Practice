import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";

import User from "../models/user";

import { Request, Response, NextFunction } from "express";

class ValidationError extends Error {
  data: any;
  statusCode: number | undefined;

  constructor(message: string, data: any) {
    super(message); // Pass the message to the Error constructor
    this.data = data;
  }
}

export const signup = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new ValidationError("Validation failed.", errors.array());
    error.statusCode = 422;
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  bcrypt
    .hash(password, 12)
    .then((hashedPw) => {
      const user = new User({
        email: email,
        password: hashedPw,
        name: name,
      });
      return user.save();
    })
    .then((result) => {
      res.status(201).json({ message: "User created!", userId: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
