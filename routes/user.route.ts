import express, { Request, Response } from "express";
import { UserController } from "../controllers";
import { Logger } from "../utils/logger";

const userRouter = express.Router();

userRouter.post("/profile", (req: Request, res: Response) => {
    UserController.updateProfile(req, res);
    Logger.warn("Update profile");
})

export default userRouter;