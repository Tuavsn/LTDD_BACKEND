import { stringify } from "querystring";
import { Logger } from "../utils/logger";
import dotenv from 'dotenv';

dotenv.config();

export class GlobalConstant {
    static readonly MONGO_DB_URL = process.env.MONGO_DB_URL??'mongodb://localhost:27017/dev';
    static readonly JWT_SECRET = process.env.JWT??'secret';
    static readonly JWT_EXPIRE = process.env.JWT_EXPIRE??'1d';
    static readonly SMTP_HOST = process.env.SMTP_HOST??'';
    static readonly SMTP_PORT = process.env.SMTP_PORT??587;
    static readonly SMTP_USER = process.env.SMTP_USER??'';
    static readonly SMTP_PASS = process.env.SMTP_PASS??'';
}

export class BaseResponse {
    Status: number;
    Data: any;
    Message: any;

    constructor(Status: number, Data: any, Message: any) {
        this.Status = Status;
        this.Data = Data;
        this.Message = Message;
    }
}