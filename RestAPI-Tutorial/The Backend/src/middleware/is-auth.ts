import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Not authenticated.");
    (error as any).statusCode = 401;
    throw error;
  }
  const token = authHeader.split(" ")[1];
  let decodedToken: jwt.JwtPayload;
  try {
    decodedToken = jwt.verify(token, "") as jwt.JwtPayload;
  } catch (err) {
    (err as any).statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error("Not authenticated.");
    (error as any).statusCode = 401;
    throw error;
  }
  req.params.userId = decodedToken.userId;
  next();
};
