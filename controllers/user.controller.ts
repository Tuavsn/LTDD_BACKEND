import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Request, Response } from 'express';
import User from '../models/user.model';
import transporter from '../configs/mail';
import { IUser } from '../configs/types';
import { TokenPayload } from './auth.controller';

class UserController {
    static async getUserInfo(req: Request, res: Response) {
        console.log('Get user info', req.user)
        const user = await User.findOne({_id: (req.user as TokenPayload).id})
        console.log("user"+user);
        return res.json({message:"Get user info successfully", user})
    }
    // Bài tập A03
    static async updateProfile(req: Request, res: Response) {
        const { email, fullname, avatar, password } = req.body;
        const savedUser = req.user as TokenPayload;

        try {
            // Tìm người dùng bằng email được giải mã bằng token
            const user = await User.findOne({ id: savedUser.id });

            // Kiểm tra xem người dùng có tồn tại không
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Kiểm tra xem id người dùng có khớp với id được giải mã từ token không (token trước và sau khi thay đổi email)
            if (savedUser?.id.toString() !== user._id.toString()) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            // Tạo một đối tượng chứa dữ liệu cần cập nhật
            const updateData: Partial<IUser> = {};
            if (fullname) updateData.fullname = fullname;
            if (avatar) updateData.avatar = avatar;

            // Kiểm tra có cập nhật mật khẩu không
            if (password) {
                if (password.length < 8 || password.length > 30) {
                    return res.status(400).json({ message: 'Password must be between 8 and 30 characters.' });
                }
                const hashedPassword = await bcrypt.hash(password, 10);
                updateData.password = hashedPassword;
            }

            // Kiểm tra coi có cập nhật email không
            if (email && email !== user.email) {
                console.log('email changing')
                // tạo otp
                const otp = crypto.randomInt(100000, 999999).toString();
                const otpExpiration = new Date(Date.now() + 15 * 60 * 1000); // OTP last in 15 minutes

                // lưu otp và các trường đang chờ cập nhật
                await User.findByIdAndUpdate(savedUser?.id, {
                    pendingEmail: email,
                    otp,
                    otpExpiration,
                    ...updateData
                });

                console.log('OTP for email update:', otp);

                // gửi otp qua email
                const mailOptions = {
                    from: process.env.SMTP_USER,
                    to: email,
                    subject: 'OTP for Email Update',
                    html: `<p>Your OTP for email update is <b>${otp}</b>. This OTP will expire in 15 minutes.</p>`
                };

                transporter.sendMail(mailOptions, (err: any) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ message: 'Failed to send OTP email for email update' });
                    }
                    return res.status(200).json({ changeEmail: true, message: 'OTP sent to the new email. Please verify to complete the update.' });
                });
            } else {
                // trường hợp không cần thay đổi email 
                console.log('tes')
                await User.findOneAndUpdate({ email: user.email }, { $set: { ...updateData } }, { new: true });
                console.log('tes1')
                return res.status(200).json({ changeEmail: false, message: 'Profile updated successfully.' });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Failed to update profile' });
        }
    }
}

export default UserController;
