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

export const signup = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new ValidationError("Validation failed.", errors.array());
    error.statusCode = 422;
    throw error;
  }
  const { email, name, password } = req.body as SignUpRequestBody;

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

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;

  try {
    loadedUser = await User.findOne({ email: email });

    if (!loadedUser || !loadedUser.password) {
      throw new Error("User not found or password is undefined");
    }

    const isEqual = await bcrypt.compare(password, loadedUser.password);
    if (!isEqual) {
      throw new Error("Wrong password!");
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

export const getUserStatus = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        const error = new Error("User not found.");
        (error as any).statusCode = 404;
        throw error;
      }
      res.status(200).json({ status: user.status });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
export const updateUserStatus = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;
  const newStatus = req.body.status;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        const error = new Error("User not found.");
        (error as any).statusCode = 404;
        throw error;
      }
      user.status = newStatus;
      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: "User updated." });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

export default { signup, login, errorHandler, getUserStatus, updateUserStatus };
