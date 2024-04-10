import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId: string;
}

class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

interface Jwt {
  userId: string;
  iat: number;
  exp: number;
}

export const isAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new CustomError("Not authenticated.", 401);
    throw error;
  }

  interface DecodedToken extends Jwt {
    userId: string;
  }

  const token = authHeader.split(" ")[1];
  let decodedToken: DecodedToken;
  try {
    decodedToken = jwt.verify(token, "somesupersecretsecret") as DecodedToken;
  } catch (err) {
    const error = new CustomError("Internal server error.", 500);
    throw error;
  }
  if (!decodedToken) {
    const error = new CustomError("Not authenticated.", 401);
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};

// export default isAuth;

// Path: src/middleware/is-auth.ts
