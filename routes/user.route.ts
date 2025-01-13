import express, { Request, Response } from "express";
import userController from "../controllers/user.controller";
import { Logger } from "../utils/logger";

const userRouter = express.Router();

userRouter.post("/profile", (req: Request, res: Response) => {
    userController.updateProfile(req, res);
    Logger.warn("Update profile");
})

export default userRouter;