import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendOtpEmail from "../utils/mail.js";

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password } = req.body;

        if (!fullname || !email || !phoneNumber || !password) {
            return res.status(400).json({ message: "All fields are required.", success: false });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email.", success: false });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

        // Store OTP in the user document
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ fullname, email,password:hashedPassword,phoneNumber, otp, otpExpiresAt });

        // Send OTP via email
        await sendOtpEmail(email, otp);

        return res.status(200).json({ message: "OTP sent to email. Please verify.", success: true });

    } catch (error) {
        
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
};

// Verify OTP and Complete Registration
export const verifyOtp = async (req, res) => {
    try {
        const { otp, email } = req.body;
        // Check if both fields are provided
        if (!otp || !email) {
            return res.status(400).json({ message: "All fields are required.", success: false });
        }

        // Find user by email
        const user = await User.findOne({ email });

        // If user not found or OTP does not match
        if (!user || user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP.", success: false });
        }

        // Check if OTP is expired
        if (user.otpExpiresAt < new Date()) {
            await User.deleteOne({ email }); // Delete user if OTP is expired
            return res.status(400).json({ message: "OTP has expired. User deleted.", success: false });
        }

        // Clear OTP and update user status
        user.otp = null;
        user.otpExpiresAt = null;
        await user.save();

        return res.status(201).json({ message: "Account verified successfully.", success: true });

    } catch (error) {
      
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
};


export const logout = async (req, res) => {
    try {
        // Clear the JWT token stored in cookies
        res.clearCookie("token", { httpOnly: true, sameSite: "strict" });

        return res.status(200).json({
            message: "Logged out successfully",
            success: true,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
};
export const login = async (req, res) => {
	try {
		// Get email and password from request body
		const { email, password } = req.body;

		// Check if email or password is missing
		if (!email || !password) {
			// Return 400 Bad Request status code with error message
			return res.status(400).json({
				success: false,
				message: `Please Fill up All the Required Fields`,
			});
		}

		// Find user with provided email
		const user = await User.findOne({ email })

		// If user not found with provided email
		if (!user) {
			// Return 401 Unauthorized status code with error message
			return res.status(401).json({
				success: false,
				message: `User is not Registered with Us Please SignUp to Continue`,
			});
		}

		// Generate JWT token and Compare Password
		if (await bcrypt.compare(password, user.password)) {
			const token = jwt.sign(
				{ email: user.email, id: user._id,phoneNumber:user.phoneNumber },
				process.env.JWT_SECRET,
				{
					expiresIn: "24h",
				}
			);

			// Save token to user document in database
			user.token = token;
			user.password = undefined;
			// Set cookie for token and return success response
			const options = {
				expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
				httpOnly: true,
			};
			res.cookie("token", token, options).status(200).json({
				success: true,
				token,
				user,
				message: `User Login Success`,
			});
		} else {
			return res.status(401).json({
				success: false,
				message: `Password is incorrect`,
			});
		}
	} catch (error) {
	
		return res.status(500).json({
			success: false,
			message: `Login Failure Please Try Again`,
		});
	}
};