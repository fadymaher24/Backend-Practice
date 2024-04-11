import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

const SECRET: string = process.env.SECRET!;
if (!SECRET) {
  throw new Error("Secret is not defined");
}

export const isAuth = (
  req: Request & { userId: string },
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Not authenticated.");
    (error as any).statusCode = 401;
    throw error;
  }
  const token = authHeader.split(" ")[1];
  let decodedToken: jwt.JwtPayload;
  try {
    decodedToken = jwt.verify(token, SECRET) as jwt.JwtPayload;
    if (!decodedToken) {
      throw new Error("Not authenticated.");
    }
    req.userId = decodedToken.userId; // Set req.userId directly
    next();
  } catch (err) {
    (err as any).statusCode = 500;
    next(err);
  }
};
