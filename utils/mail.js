import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Ensure environment variables are loaded

const sendOtpEmail = async (emails, otp) => {
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
        const recipients = emails

        // HTML content with CSS styling
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; background-color: #f4f7fc; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
                <div style="background-color: #4CAF50; padding: 10px 0; text-align: center; border-radius: 8px 8px 0 0;">
                    <h2 style="color: #ffffff; margin: 0;">Job Portal</h2>
                </div>
                <div style="padding: 20px; background-color: #ffffff; border-radius: 0 0 8px 8px;">
                    <h3 style="color: #333333;">Your OTP Code</h3>
                    <p style="color: #555555; font-size: 16px;">Thank you for registering with Job Portal. Please use the OTP code below to complete your registration:</p>
                    <div style="text-align: center; font-size: 24px; font-weight: bold; color: #4CAF50; padding: 10px 0; background-color: #f4f7fc; border-radius: 5px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p style="color: #555555; font-size: 16px;">If you did not request this, please ignore this email.</p>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <p style="color: #888888; font-size: 14px;">© 2025 Job portal. All Rights Reserved.</p>
                </div>
            </div>
        `;

        // Sending the email
        let info = await transporter.sendMail({
            from: `"Job Portal" <${process.env.MAIL_USER}>`,
            to: recipients, // Sending OTP to multiple emails
            subject: "Your OTP Code",
            html: htmlContent, // HTML content with styling
        });

        return info;
    } catch (error) {
        return error;
    }
};

export default sendOtpEmail;
export const sendOtpEmail1 = async (emails, sendermail, jobDetails) => {
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
            // Generate HTML content for each job in the jobDetails array
            let jobHtml = jobDetails.map(job => {
                return `
                    <div style="background-color: #f4f7fc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333333;">Job Title: ${job.title}</h3>
                        <p style="color: #555555; font-size: 16px;"><strong>Description:</strong> ${job.description}</p>
                        <p style="color: #555555; font-size: 16px;"><strong>Experience Level:</strong> ${job.experienceLevel}</p>
                        <p style="color: #555555; font-size: 16px;"><strong>Application Deadline:</strong> ${job.endDate}</p>
                    </div>
                `;
            }).join(''); // Join all jobs HTML content into one string

            // Send the email to the recipient
            let info = await transporter.sendMail({
                from: `"Job Portal" <${sendermail}>`,
                to: email, // Send email to each recipient individually
                subject: "Job Updates: New Job Opportunities",
                html: `
                    <div style="font-family: Arial, sans-serif; background-color: #f4f7fc; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
                        <div style="background-color: #4CAF50; padding: 10px 0; text-align: center; border-radius: 8px 8px 0 0;">
                            <h2 style="color: #ffffff; margin: 0;">Job Portal</h2>
                        </div>
                        <div style="padding: 20px; background-color: #ffffff; border-radius: 0 0 8px 8px;">
                            <p style="color: #555555; font-size: 16px;">We are excited to share new job opportunities with you. Here are the details:</p>
                            ${jobHtml} <!-- Insert the jobs dynamically here -->
                            <p style="color: #555555; font-size: 16px;">We encourage you to apply if you're interested. If you have any questions, feel free to reach out to us.</p>
                        </div>
                        <div style="text-align: center; margin-top: 20px;">
                            <p style="color: #888888; font-size: 14px;">© 2025 Job Portal. All Rights Reserved.</p>
                        </div>
                    </div>
                `, // HTML content with all job details
            });
        }
        
    } catch (error) {
        return error;
    }
};
