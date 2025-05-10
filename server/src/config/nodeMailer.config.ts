import {createTransport} from "nodemailer";
import { config } from "dotenv";

config();

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
const transporter = createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: SMTP_USER, // generated ethereal user
    pass: SMTP_PASS, // generated ethereal password
  },
});

export default transporter;