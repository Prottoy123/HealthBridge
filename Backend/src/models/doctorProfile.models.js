import mongoose, { Schema } from "mongoose";

const doctorProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    qualifications: [
      {
        type: String,
        trim: true,
        required: true,
      },
    ],
    experienceYears: {
      type: Number,
      required: true,
      min: [0, "Experience cannot be negative"],
    },
    about: {
      type: String,
      trim: true,
    },
    consultationFee: {
      type: Number,
      required: true,
      min: [0, "Fee cannot be negative"],
    },
    slotDuration: {
      type: Number,
      default: 15,
      required: true,
    },
    workingDays: [
      {
        type: String,
        trim: true,
        enum: {
          values: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          message: "{VALUE} is not a valid working day",
        },
      },
    ],
    shiftStartTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):?([0-5]\d)$/, "Please provide a valid 24-hour time format (e.g., 18:00)"],
    },
    shiftEndTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):?([0-5]\d)$/, "Please provide a valid 24-hour time format (e.g., 21:00)"],
    },
    roomNumber: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
export const DoctorProfile = mongoose.model("DoctorProfile", doctorProfileSchema);