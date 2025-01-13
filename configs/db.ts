import mongoose from "mongoose";
import { GlobalConstant } from "./constant";
import { Logger } from "../utils/logger";

export const connectDB = async () => {
    await mongoose
        .connect(GlobalConstant.MONGO_DB_URL)
        .then(() => {
            Logger.warn(`Connected to MongoDB with URL: ${GlobalConstant.MONGO_DB_URL}`);
        })
        .catch((err) => {
            Logger.error(`Error connecting to MongoDB with URL: ${GlobalConstant.MONGO_DB_URL}`);
            Logger.error(err);
            process.exit();
        })
}