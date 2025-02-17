import express, { Request, Response } from "express";
import { UserController } from "../controllers";
import { Logger } from "../utils/logger";

const UserRouter = express.Router();

UserRouter.post("/profile", (req: Request, res: Response) => {
    UserController.updateProfile(req, res);
    Logger.warn("Update profile");
})

export default UserRouter;