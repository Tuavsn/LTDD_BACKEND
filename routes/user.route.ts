import express, { Request, Response } from "express";
import userController from "../controllers/user.controller";
import { Logger } from "../utils/logger";

const userRouter = express.Router();

userRouter.get("/", (req: Request, res: Response) => {
    userController.getAll(req, res);
    Logger.warn("Get all user");
})

userRouter.get("/:id", (req: Request, res: Response) => {
    userController.getById(req, res);
    Logger.warn(`Get user with id: ${req.params.id}`);
})

userRouter.post("/", (req: Request, res: Response) => {
    userController.create(req, res);
    Logger.warn("Create user");
})

userRouter.put("/:id", (req: Request, res: Response) => {
    userController.update(req, res);
    Logger.warn(`Update user with id: ${req.params.id}`);
})

userRouter.delete("/:id", (req: Request, res: Response) => {
    userController.delete(req, res);
    Logger.warn(`Delete user with id: ${req.params.id}`);
})

export default userRouter;