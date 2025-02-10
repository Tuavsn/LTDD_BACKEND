import { Types } from "mongoose";
import { Role } from "./enum";

interface IUser {
    id: Types.ObjectId;
    email: string;
    phone: string;
    fullname: string;
    avatar?: string;
    role: [Role.ADMIN, Role.USER];
    password: string;
    otp: string | undefined;
    otpExpiration: Date | undefined;
    isVerified: boolean;
    pendingEmail: string | undefined;
}