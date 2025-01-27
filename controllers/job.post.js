import { User } from '../models/user.model.js';
import { Job } from "../models/Job.mode.js"; // Import Job Model
import { allEmail } from '../models/email.model.js'; // Import allEmail Model
// Function to send emails
import nodemailer from "nodemailer";
import dotenv from "dotenv";
export const createJob = async (req, res) => {
    try {
        const { email } = req.user; // Recruiter's email (from authentication middleware)
        const { title, description, experienceLevel, candidates, endDate } = req.body;

        // Validate input
        if (!title || !description || !experienceLevel || !endDate || !candidates || candidates.length === 0) {
            return res.status(400).json({ message: "All fields are required.", success: false });
        }

        // Create a new job posting in Job Collection
        const newJob = new Job({
            title,
            description,
            experienceLevel,
            candidates,
            endDate,
        });

        await newJob.save(); // Save Job to DB

        // Find User and Push Job ID into Jobs Array
        const updatedUser = await User.findOneAndUpdate(
            { email }, // Find user by email
            { $push: { Jobs: newJob._id } }, // Push new job ID into Jobs array
            { new: true } // Return updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found.", success: false });
        }

        if (candidates && candidates.length > 0) {
            // Loop through each candidate and check if their email is already registered
            const existingEmails = await allEmail.find({ usemail: { $in: candidates } });

            // Extract emails that are already in the database
            const existingEmailList = existingEmails.map(emailEntry => emailEntry.usemail);

            // Filter out the emails that already exist from the list of candidates
            const newEmails = candidates.filter(candidateEmail => !existingEmailList.includes(candidateEmail));

            // Insert the new emails that do not exist in the database
            if (newEmails.length > 0) {
                const emailEntries = newEmails.map(candidateEmail => ({ usemail: candidateEmail }));
                await allEmail.insertMany(emailEntries); // Insert only new emails
            }
        }

        // Send job notification email to candidates
        // await sendOtpEmail1();
        await sendOtpEmail1(candidates, email, title,
            description,
            experienceLevel,
            endDate)
        return res.status(201).json({ message: "Job created successfully.", job: newJob, success: true });

    } catch (error) {
        
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
};
const sendOtpEmail1 = async (emails, sendermail, title, description, experienceLevel, candidates, endDate) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 587,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });

        // Ensure `emails` is an array; if not, convert it
        for (let email of emails) {
            let info = await transporter.sendMail({
                from: `"Job Portal" <${sendermail}>`, // Sender email
                to: email, // Recipient email
                subject: "Job Updates: New Job Opportunities", // Email subject
                html: `
                    <div style="font-family: Arial, sans-serif; background-color: #f4f7fc; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
                        <div style="background-color: #4CAF50; padding: 10px 0; text-align: center; border-radius: 8px 8px 0 0;">
                            <h2 style="color: #ffffff; margin: 0;">Job Portal</h2>
                        </div>
                        <div style="padding: 20px; background-color: #ffffff; border-radius: 0 0 8px 8px;">
                            <h3 style="color: #333333;">New Job Opportunity: ${title}</h3>
                            <p style="color: #555555; font-size: 16px;">We are excited to share a new job opening with you. Here are the details:</p>
                            <div style="background-color: #f4f7fc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="color: #333333; font-size: 16px; margin-bottom: 10px;"><strong>Description:</strong> ${description}</p>
                                <p style="color: #333333; font-size: 16px; margin-bottom: 10px;"><strong>Experience Level:</strong> ${experienceLevel}</p>
                                <p style="color: #333333; font-size: 16px; margin-bottom: 10px;"><strong>Number of Candidates:</strong> ${candidates || "Not Specified"}</p>
                                <p style="color: #333333; font-size: 16px;"><strong>Application Deadline:</strong> ${endDate}</p>
                            </div>
                            <p style="color: #555555; font-size: 16px;">We encourage you to apply if you're interested. If you have any questions, feel free to reach out to us.</p>
                        </div>
                        <div style="text-align: center; margin-top: 20px;">
                            <p style="color: #888888; font-size: 14px;">© 2025 Job Portal. All Rights Reserved.</p>
                        </div>
                    </div>
                `, // HTML content with styling
            });
        }
        
    } catch (error) {
        console.error("Error sending email:", error.message);
        return error;
    }
};
