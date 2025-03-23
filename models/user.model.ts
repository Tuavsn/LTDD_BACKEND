import bcrypt from 'bcryptjs';
import { model, Schema } from "mongoose";
import { Role } from '../configs/enum';

const userSchema = new Schema({
    orders: {
        type: [{ type: Schema.Types.ObjectId, ref: "Order" }],
        default: []
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email already exists"],
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,
        required: [true, "Phone is required"],
        unique: [true, "Phone already exists"],
        trim: true,
        lowercase: true,
    },
    fullname: {
        type: String,
        required: [true, "Fullname is required"],
        min: [12, "Fullname must be at least 8 characters"],
        max: [100, "Fullname must be at most 100 characters"],
    },
    avatar: {
        type: String
    },
    address: [{
        address: {
            type: String,
            min: [8, "Address must be at least 8 characters"],
            max: [100, "Address must be at most 100 characters"],
        },
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    role: {
        type: String,
        enum: [Role.ADMIN, Role.USER],
        required: [true, "Role is required"],
        default: Role.USER,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        trim: true,
        min: [8, "Password must be at least 8 characters"],
        max: [30, "Password must be at most 30 characters"],
    },
    otp: {
        type: String,
        required: false
    },
    otpExpiration: {
        type: Date,
        required: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    pendingEmail: {
        type: String,
        required: false
    },
}, { timestamps: true });

const User = model("User", userSchema);

export default User;