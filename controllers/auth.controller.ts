import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Request, Response } from "express";
import User from "../models/user.model";
import { GlobalConstant } from '../configs/constant';
import transporter from '../configs/mail';
import { IUser } from '../configs/types';
import { Role } from '../configs/enum';

class AuthController {
    /**
     * User Login
     * @param req 
     * @param res 
     * @returns 
     */
    static async login(req: Request, res: Response) {
        const { email, password } = req.body;

        try {
            // Tìm người dùng trong cơ sở dữ liệu
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Kiểm tra mật khẩu
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Kiểm tra trạng thái tài khoản (nếu có OTP tồn tại, yêu cầu xác minh)
            if (user.otp && user.otpExpiration && new Date() < user.otpExpiration && !user.isVerified) {
                return res.status(403).json({
                    message: 'Please verify your account using the OTP sent to your email.',
                    suggestEnterOtp: true
                });
            }

            // Tạo JWT token cho phiên đăng nhập
            const tokenPayload = { id: user._id, email: user.email, role: user.role };
            const token = jwt.sign(tokenPayload, GlobalConstant.JWT_SECRET, { expiresIn: GlobalConstant.JWT_EXPIRE });

            res.status(200).json({
                message: 'Login successful',
                token,
                user: { email: user.email, fullname: user.fullname, role: user.role, avatar: user.avatar },
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Create new account
     * @param req 
     * @param res 
     * @returns 
     */
    static async register(req: Request, res: Response) {
        const { email, phone, fullname, password }:
            { email: string, phone: string, fullname: string, role: string, password: string } = req.body;

        // Kiểm tra người dùng đã tồn tại
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Tạo mã OTP ngẫu nhiên
        const otp = crypto.randomInt(100000, 999999).toString(); // Mã OTP gồm 6 chữ số

        // Lưu thông tin người dùng cùng với OTP và thời gian hết hạn
        const otpExpiration = new Date(Date.now() + 15 * 60 * 1000); // OTP có hiệu lực trong 15 phút
        const hashedPassword = await bcrypt.hash(password, 10);

        if (existingUser) {
            await User.findOneAndUpdate(
                { email: existingUser.email },
                { $set: { password: hashedPassword, phone, fullname } },
                { new: true }
            );
            console.log('1')
        } else {
            await User.create({
                email, phone, fullname, role: Role.USER, password, otp, otpExpiration
            });
            console.log('2')
        }

        if (!existingUser || (existingUser.otpExpiration && existingUser.otpExpiration < new Date())) {
            // Gửi email chứa mã OTP
            console.log('3')
            const mailOptions = {
                from: process.env.SMTP_USER,
                to: email,
                subject: 'OTP for Account Registration',
                html: `<p>Your OTP code is: ${otp}</p><p>This OTP will expire in 15 minutes.</p>`,
            };

            transporter.sendMail(mailOptions, (err: any, info: any) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Failed to send OTP email' });
                }
                return res.status(201).json({ message: 'User registered successfully. Check your email for the OTP.' });
            });
        }
        return res.status(201).json({ message: 'User registered successfully. Check your email for the OTP.' });
    }

    /**
     * Verify OTP and complete registration
     * @param req 
     * @param res 
     * @returns 
     */
    static async verifyOtp(req: Request, res: Response) {
        const { email, otp } = req.body;

        // Tìm người dùng theo email
        const user = await User.findOne({ email }) as IUser;
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(otp, user.otp, user.otpExpiration)

        // Kiểm tra OTP và thời gian hết hạn
        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (!user.otpExpiration || new Date() > user.otpExpiration) {
            return res.status(400).json({
                message: 'OTP has expired',
                suggestResendOtp: true, // Thêm thông báo đề xuất gửi lại OTP

            });
        }

        // Hoàn tất đăng ký: Xóa OTP và hoàn tất quá trình đăng ký
        await User.findOneAndUpdate(
            { email: user.email },
            { $set: { otp: null, otpExpiration: null, isVerified: true } },
            { new: true } // Trả về document đã cập nhật
        );

        res.status(200).json({ message: 'Registration successful' });
    }

    /**
     * Resend OTP if expired
     * @param req 
     * @param res 
     * @returns 
     */
    static async resendOtp(req: Request, res: Response) {
        const { email } = req.body;

        // Tìm người dùng theo email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Kiểm tra xem OTP có hết hạn chưa
        if (!user.otpExpiration || new Date() < user.otpExpiration) {
            return res.status(400).json({ message: 'OTP is still valid' });
        }

        // Tạo mã OTP mới
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpiration = new Date(Date.now() + 15 * 60 * 1000); // OTP mới có hiệu lực trong 15 phút

        // Cập nhật OTP và thời gian hết hạn trong CSDL
        await User.findOneAndUpdate(
            { email: user.email },
            { $set: { otp: otp, otpExpiration: otpExpiration } },
            { new: true } // Trả về document đã cập nhật
        );

        // Gửi lại email với mã OTP mới
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: 'OTP for Account Registration',
            html: `<p>Your new OTP code is: ${otp}</p><p>This OTP will expire in 15 minutes.</p>`,
        };

        transporter.sendMail(mailOptions, (err: any, info: any) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Failed to send OTP email' });
            }
            res.status(200).json({ message: 'New OTP sent successfully. Check your email for the OTP.' });
        });
    }

    /**
     * Reset Password
     * @param req 
     * @param res 
     * @returns 
     */
    static async forgotPassword(req: Request, res: Response) {
        const { email } = req.body;

        // Tìm người dùng
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Please verify your account first.' });
        }

        // Tạo mã OTP ngẫu nhiên
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // OTP hết hạn sau 10 phút

        // Lưu mã OTP vào cơ sở dữ liệu
        await User.findOneAndUpdate(
            { email: user.email },
            { $set: { otp: otp, otpExpiration: otpExpiration } },
            { new: true } // Trả về document đã cập nhật
        );

        // Gửi email chứa OTP
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Password Reset OTP',
            html: `<p>Your OTP for password reset is <b>${otp}</b>. This OTP will expire in 10 minutes.</p>`,
        };

        transporter.sendMail(mailOptions, (err: any) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Failed to send email' });
            }
            res.status(200).json({ message: 'OTP sent to email' });
        });
    }

    static async resetPassword(req: Request, res: Response) {
        const { email, newPassword } = req.body;

        // Tìm người dùng
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Kiểm tra trạng thái xác thực OTP
        if (user.otp) {
            return res.status(403).json({ message: 'OTP not verified. Please verify OTP first.' });
        }

        if (!user.otpExpiration || new Date() > user.otpExpiration) {
            return res.status(403).json({ message: 'OTP has expired' });
        }

        // Hash mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu và xóa trạng thái OTP
        await User.findOneAndUpdate(
            { email: user.email },
            { $set: { password: hashedPassword, otp: null, otpExpiration: null } },
            { new: true } // Trả về document đã cập nhật
        );

        res.status(200).json({ message: 'Password reset successful' });
    }

}

export default AuthController;