import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    password: {
        type: String,

    },
    otp: {
        type: String // OTP stored in DB
    },
    otpExpiresAt: {
        type: Date // OTP expiration time
    },
    Jobs: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Job",
		},
	],
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
