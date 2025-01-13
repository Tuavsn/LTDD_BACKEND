import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { GlobalConstant } from './constant';

const transporter: Transporter = nodemailer.createTransport({
    service: 'gmail',
    host: GlobalConstant.SMTP_HOST,
    port: GlobalConstant.SMTP_PORT,
    secure: true,
    auth: {
        user: GlobalConstant.SMTP_USER,
        pass: GlobalConstant.SMTP_PASS,
    },
} as SMTPTransport.Options);

export default transporter;