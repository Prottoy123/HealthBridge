import nodemailer from "nodemailer";

/**
 * @description Utility function to send emails asynchronously
 * @param {Object} options - { email: 'to@example.com', subject: 'Hello', message: 'Body' }
 */
export const sendEmail = async (options) => {
  try {
    // ১. ট্রান্সপোর্টার তৈরি করা (The Delivery Engine)
    const transporter = nodemailer.createTransport({
      service: "gmail", // তুমি চাইলে Hostinger বা AWS SES এর হোস্টও দিতে পারো
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // ২. ইমেইলের অপশন সেট করা (The Mail Payload)
    const mailOptions = {
      from: `HealthBridge Admin <${process.env.SMTP_MAIL}>`, // কে পাঠাচ্ছে
      to: options.email, // কাকে পাঠাচ্ছে (কন্ট্রোলার থেকে আসবে)
      subject: options.subject, // সাবজেক্ট
      text: options.message, // ইমেইলের বডি
    };

    // ৩. ইমেইল পাঠানো
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Email sent successfully to ${options.email}. Message ID: ${info.messageId}`
    );
  } catch (error) {
    // যেহেতু এটি নন-ব্লকিং হবে, তাই এখানে ApiError থ্রো না করে শুধু কনসোলে প্রিন্ট করছি
    // যাতে ইমেইল ফেইল করলেও আমাদের মেইন API ক্র্যাশ না করে।
    console.error("Error in sending background email: ", error.message);
  }
};
