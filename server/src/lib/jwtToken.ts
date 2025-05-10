import jwt from 'jsonwebtoken'; 
import dotenv from 'dotenv';
dotenv.config();

export function getToken(email: string) {
    if (!email) {
        console.log("Email is required to generate token.");
        return;
    }
    if (!process.env.JWT_SECRET) {
        console.log("JWT_SECRET is not defined in environment variables.");
        return;
    }

    try {
        const token = jwt.sign(
            { email },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        )
        return token;
    } catch (error) {
        console.log("Tokken error :" + error);
        return;
    }
}

export default getToken;