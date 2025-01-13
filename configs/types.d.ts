import { Role } from "./enum";

interface IUser {
    email: string;
    phone: string;
    fullname: string;
    avatar?: string;
    role: [Role.ADMIN, Role.USER];
    password: string;
    otp: string | undefined;
    otpExpiration: Date | undefined;
}