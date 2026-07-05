import nodemailer from "nodemailer";

/**
 * @description Utility function to send emails asynchronously
 * @param {Object} options - { email: 'to@example.com', subject: 'Hello', message: 'Body' }
 */
export const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `HealthBridge Admin <${process.env.SMTP_MAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Email sent successfully to ${options.email}. Message ID: ${info.messageId}`
    );
  } catch (error) {
    console.error("Error in sending background email: ", error.message);
  }
};
