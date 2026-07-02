import dotenv from "dotenv";
import connectDB from "../db/connectDB.js";
import { User } from "../models/User.models.js";

dotenv.config({
  path: "./.env",
});

const seedSuperAdmin = async () => {
  try {
    await connectDB();
    console.log("⚙️ Database connected for Seeding...");

    const existingAdmin = await User.findOne({ role: "ADMIN" });

    if (existingAdmin) {
      console.log(
        `⚠️ Super Admin already exists! Email: ${existingAdmin.email}`
      );
      console.log("🛑 Exiting seed process to prevent duplication.");
      process.exit(0); // গ্রেসফুল এক্সিট
    }

    const { ADMIN_FULLNAME, ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } =
      process.env;

    if (!ADMIN_FULLNAME || !ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("Missing Admin credentials in .env file. Please check!");
    }

    const adminUser = await User.create({
      fullName: ADMIN_FULLNAME,
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD, 
      role: "ADMIN",
      status: "ACTIVE",
    });

    console.log(`✅ Super Admin created successfully!`);
    console.log(`🔑 Login Email: ${adminUser.email}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding Super Admin:", error.message);
    process.exit(1); 
  }
};

seedSuperAdmin();
