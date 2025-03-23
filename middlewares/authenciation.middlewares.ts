import { NextFunction, Request, Response } from "express";
import Jwt from "jsonwebtoken";
import { TokenPayload } from "../controllers/auth.controller";
import { GlobalConstant } from "../configs/constant";
import { Logger } from "../utils/logger";
import { openRoutes } from "../routes/api.route";

export const authenticationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authroization = req.header("Authorization");

  // Nếu request thuộc các openRoutes, trả về ngay để không tiếp tục xử lý middleware
  if (openRoutes.some((route) => req.path.includes(route))) {
    return next();
  }

  if (!authroization) {
    Logger.error("Access denied. No token provided");
    res.status(401).send("Access denied");
    return;
  }
  try {
    const token = authroization.split(" ")[1];
    const decoded = Jwt.verify(token, GlobalConstant.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    Logger.error("Invalid token");
    res.status(400).send("Invalid token");
    return;
  }
};
