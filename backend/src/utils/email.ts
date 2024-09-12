import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const frontendUrl = process.env.FRONTEND_URL; // Access the environment variable
const appPassword = process.env.APP_PASSWORD;
const emailUser = process.env.EMAIL_USER;

export const sendResetEmail = async (email: string, token: string): Promise<void> => {
  console.log(' in sendResetEmail')

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
    await transport.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Could not send reset email');
  }
};