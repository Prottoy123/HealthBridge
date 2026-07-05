import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const doctorProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // নতুন ফিল্ড: BM&DC Registration Number
    bmdcRegistration: {
      type: String,
      trim: true,
      // required: true দেওয়া যাবে না, কারণ রেজিস্ট্রেশনের সময় এটি থাকবে না
    },
    specialization: {
      type: String,
      trim: true,
    },
    qualifications: [
      {
        type: String,
        trim: true,
      },
    ],
    experienceYears: {
      type: Number,
      min: [0, "Experience cannot be negative"],
    },
    about: {
      type: String,
      trim: true,
    },
    consultationFee: {
      type: Number,
      min: [0, "Fee cannot be negative"],
    },
    slotDuration: {
      type: Number,
      default: 15,
    },
    workingDays: [
      {
        type: String,
        trim: true,
        enum: {
          values: [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
          message: "{VALUE} is not a valid working day",
        },
      },
    ],
    shiftStartTime: {
      type: String,
      match: [
        /^([01]\d|2[0-3]):?([0-5]\d)$/,
        "Please provide a valid 24-hour time format (e.g., 18:00)",
      ],
    },
    shiftEndTime: {
      type: String,
      match: [
        /^([01]\d|2[0-3]):?([0-5]\d)$/,
        "Please provide a valid 24-hour time format (e.g., 21:00)",
      ],
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
doctorProfileSchema.plugin(mongooseAggregatePaginate);

export const DoctorProfile =
  mongoose.models.DoctorProfile ||
  mongoose.model("DoctorProfile", doctorProfileSchema);