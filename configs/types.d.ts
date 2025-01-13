import { Role } from "./enum";

interface IUser {
    email: string;
    fullname: string;
    avatar: string;
    role: [Role.Admin, Role.User];
    password: string;
    otp: string | undefined;
    otpExpiration: Date | undefined;
}