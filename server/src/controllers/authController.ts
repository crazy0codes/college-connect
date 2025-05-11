import e, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getUser, updatePassword } from "../service/auth";
import { verify } from "crypto";
import path from "path";
import transporter from "../config/nodeMailer.config";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRATION = "30h";

export const authController = {
  // registerUser: async (req: Request, res: Response) => {
  //   const { username, email, password } = req.body;

  //   if (!username || !email || !password) {
  //     return res.status(400).json({ message: "All fields are required" });
  //   }

  //   const existingUser = await getUser(email);
  //   if (existingUser) {
  //     return res
  //       .status(409)
  //       .json({ message: "Username or email already exists" });
  //   }

  //   const hashedPassword = await bcrypt.hash(password, 12);
  //   const newUser = await User.create({
  //     username,
  //     email,
  //     password: hashedPassword,
  //   });

  //   const token = jwt.sign({ id: newUser._id }, JWT_SECRET, {
  //     expiresIn: JWT_EXPIRATION,
  //   });
  //   res.status(201).json({ token });
  // },

  loginUser: async (req: Request, res: Response) => {
    console.log("Login request received");
    const { email, password } = req.body;
    const bearerToken = req.headers.authorization;
    const token =
      bearerToken && bearerToken.startsWith("Bearer ")
        ? bearerToken.split(" ")[1]
        : null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return res.status(200).json({ token });
      } catch (err: any) {
        if (err.name !== "TokenExpiredError") {
          return res.status(403).json({ message: "Invalid token" });
        }
        // token expired: proceed to re-authenticate
      }
    }

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const user = await getUser(email);

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.stu_password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const newToken = jwt.sign(
      { email: user.stu_email, username: user.stu_email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );
    res
      .status(200)
      .json({ token: newToken, profile: user.stu_dp, username: user.username });
  },

  forgotPassword: async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await getUser(email);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate a reset token and send it to the user's email
    const resetToken = jwt.sign({ email }, JWT_SECRET, {
      expiresIn: "10hrs",
    });
    // Here you would send the reset token to the user's email address
    try {
      const smtpEmail = await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: "Password Reset",
        text: `Click the link to reset your password: http://localhost:3001/api/auth/verify-email/${resetToken}`,
      });

      console.log("Email sent:", smtpEmail.response);

    } catch (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({ message: "Error sending email" });
    }

    res.status(200).json({
      message: "Reset password link sent to your email",
    });
  },

  verifyEmail: async (req: Request, res: Response) => {
    const { token } = req.params;
    if (!token) return res.status(400).json({ message: "Token is required" });

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user = await getUser(decoded.email);

      if (!user) return res.status(404).json({ message: "User not found" });

      res.sendFile(path.join(__dirname, "../../public/reset-password/index.html"));
    } catch (err) {
      console.error("Error verifying email:", err);
      return res.status(403).json({ message: "Invalid or expired token" });
    }
  },

  resetPassword: async (req: Request, res: Response) => {
    const { token } = req.params;
    console.log(req.params)
    if (!token) return res.status(400).json({ message: "Token is required" });

    const { email, newPassword } = req.body;

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);

      if (email !== decoded.email) {
        return res.status(403).json({ message: "Invalid token" });
      }

      if (!newPassword) {
        return res.status(400).json({ message: "New password is required" });
      }

      const user = await getUser(email);
      if (!user) return res.status(404).json({ message: "User not found" });

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      // Update the user's password in the database

      await updatePassword(email, hashedPassword);

      res.status(200).json({ message: "Password reset successfully" , success: true});
    } catch (err) {
      console.error("Error resetting password:", err);
      return res.status(403).json({ message: "Invalid or expired token", success: false });
    }
  },

  // getUserProfile: async (req: Request, res: Response) => {
  //   const { email } = req.body;
  //   const user = await getUser(email);
  //   if (!user) return res.status(404).json({ message: "User not found" });
  //   res.status(200).json({
  //     user: {
  //       profile: user.stu_dp,
  //       email: user.stu_email,
  //       username: user.username,
  //     },
  //   });
  // },
};
