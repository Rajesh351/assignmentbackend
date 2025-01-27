import { allEmail } from "../models/email.model.js";
import { sendOtpEmail1 } from "../utils/mail.js";
import { Job } from "../models/Job.mode.js"; // Assuming you have a Job model

export const sendmail = async (req, res) => {
    try {
        // Fetch all emails from the allEmail collection
        const { email } = req.user;
        const emailsList = await allEmail.find({});
       

        // If no emails are found, return a response
        if (emailsList.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No emails found.",
            });
        }

        // Extract email addresses from the emailsList
        const emails = emailsList.map(emailEntry => emailEntry.usemail);

        // Fetch the top 5 most recent jobs (sorted by date or any other criteria)
        const recentJobs = await Job.find({}) // You can adjust this query based on your schema and requirements
            .sort({ createdAt: -1 }) // Assuming the `createdAt` field exists and sorts by most recent
            .limit(5); // Get the most recent 5 jobs

        // If there are no jobs available
        if (recentJobs.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No jobs available to send.",
            });
        }

        // Prepare the job details to send in the email
        const jobDetails = recentJobs.map(job => ({
            title: job.title,
            description: job.description,
            experienceLevel: job.experienceLevel,
            candidates: job.candidates,
            endDate: job.endDate,
        }));

        // Send an email to each recipient with the job details
        await sendOtpEmail1(
            emails,
            email, // Sender's email (user's email)
            jobDetails
        );

        return res.status(200).json({
            success: true,
            message: `Emails sent successfully.`,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while sending emails.",
        });
    }
};
