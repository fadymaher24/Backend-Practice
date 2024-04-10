import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user";

import { Request, Response, NextFunction } from "express";

interface SignUpRequestBody {
  email: string;
  name: string;
  password: string;
}

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new ValidationError("Validation failed.", errors.array());
      error.statusCode = 422;
      throw error;
    }

    const { email, name, password } = req.body as SignUpRequestBody;

    const hashedPw = bcrypt.hashSync(password, 12);
    const user = new User({ email, password: hashedPw, name });

    const result = await user.save();

    res.status(201).json({ message: "User created!", userId: result._id });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError("A user with this email could not be found.", 401);
    }

    const loadedUser = user;
    const isEqual = bcrypt.compareSync(password, user.password);
    if (!isEqual) {
      throw new CustomError("Wrong password!", 401);
    }
    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id.toString(),
      },
      "somesupersecretsecret",
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, userId: loadedUser._id.toString() });
  } catch (err) {
    next(err);
  }
};

class ValidationError extends Error {
  data: any;
  statusCode: number;

  constructor(message: string, data: any) {
    super(message);
    this.data = data;
    this.statusCode = 422;
  }
}

class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Error handling middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "An error occurred";
  res.status(statusCode).json({ message });
};
