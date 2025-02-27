import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Request, Response } from 'express';
import User from '../models/user.model';
import transporter from '../configs/mail';
import { IUser } from '../configs/types';
import { TokenPayload } from './auth.controller';
import { Types } from 'mongoose';

class UserController {

    static async getProfile(req: Request, res: Response) {
        try {
            const user = req.user as TokenPayload;
            const foundUser = await User.findById(user.id).select('-password');

            return res.status(200).json({ user: foundUser, message: 'Profile retrieved successfully.' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Failed to get profile' });
        }
    }

    static async updateProfile(req: Request, res: Response) {
        try {
            const { email, fullname, avatar, password, oldPassword } = req.body;
            const savedUser = req.user as TokenPayload;

            const user = await User.findOne({ email: savedUser.email });
            if (!user) return res.status(404).json({ message: 'User not found' });
            if (savedUser?.id.toString() !== user._id.toString()) return res.status(403).json({ message: 'Forbidden' });

            if (email || password)
                if (oldPassword) {
                    const isMatch = await bcrypt.compare(oldPassword, user.password);
                    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });
                } else {
                    return res.status(400).json({ message: 'Old password is required to update email or password' });
                }

            const updateData: Partial<IUser> = {};
            if (fullname) updateData.fullname = fullname;
            if (avatar) updateData.avatar = avatar;

            if (password) {
                if (password.length < 8 || password.length > 30) {
                    return res.status(400).json({ message: 'Password must be between 8 and 30 characters.' });
                }
                updateData.password = await bcrypt.hash(password, 10);
            }

            if (email && email !== user.email) {

                const existingUser = await User.findOne({ email });
                if (existingUser)
                    return res.status(400).json({ message: 'Email already exists' });

                await UserController.handleEmailUpdate(email, savedUser.id, updateData, res);
                return res.status(200).json({ changeEmail: true, message: 'Processing email update. Please verify the OTP sent to the new email.' });
            } else {

                if (Object.keys(updateData).length === 0) {
                    return res.status(400).json({ message: 'No data to update' });
                }

                await User.findByIdAndUpdate(user._id, { $set: updateData }, { new: true });
                return res.status(200).json({ changeEmail: false, message: 'Profile updated successfully.' });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Failed to update profile' });
        }
    }

    private static async handleEmailUpdate(email: string, userId: Types.ObjectId, updateData: Partial<IUser>, res: Response) {
        try {
            const otp = crypto.randomInt(100000, 999999).toString();
            const otpExpiration = new Date(Date.now() + 15 * 60 * 1000);

            await User.findByIdAndUpdate(userId, { pendingEmail: email, otp, otpExpiration, ...updateData });
            console.log('OTP for email update:', otp);

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
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to process email update' });
        }
    }
}

export default UserController;
