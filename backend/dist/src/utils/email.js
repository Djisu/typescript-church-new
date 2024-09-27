var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const frontendUrl = process.env.FRONTEND_URL; // Access the environment variable
const appPassword = process.env.APP_PASSWORD;
const emailUser = process.env.EMAIL_USER;
export const sendResetEmail = (email, token) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(' in sendResetEmail');
    console.log('Email User:', emailUser);
    console.log('App Password:', appPassword);
    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: appPassword
        }
    });
    // Construct the email content
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;
    const mailOptions = {
        from: `"Typescript Church" <${emailUser}>`, // Sender address
        to: email, // List of recipients
        subject: 'Password Reset Request', // Subject line
        text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`, // Plain text body
        html: `<p>You requested a password reset. Click the link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`, // HTML body
    };
    // Send the email
    try {
        yield transport.sendMail(mailOptions);
        console.log('Password reset email sent to:', email);
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Could not send reset email');
    }
});
//# sourceMappingURL=email.js.map