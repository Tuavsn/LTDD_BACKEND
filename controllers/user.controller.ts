import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Request, Response } from 'express';
import User from '../models/user.model';
import transporter from '../configs/mail';
import { IUser } from '../configs/types';

class UserController {
    /**
     * Update user profile, including email, fullname, avatar, and password.
     * Email change requires OTP verification for the new email.
     */
    static async updateProfile(req: Request, res: Response) {
        const { userId } = req.params;
        const { email, fullname, avatar, password } = req.body;

        try {
            // Find user by ID
            const user = await User.findOne({ email }) as IUser;
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Prepare update object
            const updateData: Partial<IUser> = {};
            if (fullname) updateData.fullname = fullname;
            if (avatar) updateData.avatar = avatar;

            // Handle password update if provided
            if (password) {
                if (password.length < 8 || password.length > 30) {
                    return res.status(400).json({ message: 'Password must be between 8 and 30 characters.' });
                }
                const hashedPassword = await bcrypt.hash(password, 10);
                updateData.password = hashedPassword;
            }

            // Handle email update with OTP verification
            if (email && email !== user.email) {
                // Generate a new OTP
                const otp = crypto.randomInt(100000, 999999).toString();
                const otpExpiration = new Date(Date.now() + 15 * 60 * 1000); // OTP có hiệu lực trong 15 phút

                // Update OTP and pending email in the database
                await User.findByIdAndUpdate(userId, {
                    pendingEmail: email,
                    otp,
                    otpExpiration
                });

                // Send OTP email
                const mailOptions = {
                    from: process.env.SMTP_USER,
                    to: email,
                    subject: 'OTP for Email Update',
                    html: `<p>Your OTP for email update is <b>${otp}</b>. This OTP will expire in 10 minutes.</p>`
                };

                transporter.sendMail(mailOptions, (err: any) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ message: 'Failed to send OTP email for email update' });
                    }
                    return res.status(200).json({ message: 'OTP sent to the new email. Please verify to complete the update.' });
                });
            } else {
                // Update other profile fields without email change
                await User.findOneAndUpdate({ email: user.email }, { $set: { fullname: fullname, otpExpiration: null } } , { new: true });
                return res.status(200).json({ message: 'Profile updated successfully.' });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Failed to update profile' });
        }
    }
}

export default UserController;
