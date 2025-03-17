import express, { Request, Response } from "express";
import { UserController } from "../controllers";
import { Logger } from "../utils/logger";

const UserRouter = express.Router();

UserRouter.put("/profile", (req: Request, res: Response) => {
    UserController.updateProfile(req, res);
})

UserRouter.get("/me", (req: Request, res: Response) => {
    UserController.getProfile(req, res);
})

export default UserRouter;