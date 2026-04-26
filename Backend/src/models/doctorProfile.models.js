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
    consultationFee: {
      type: Number,
      required: true,
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
      },
    ],
    shiftStartTime: {
      type: String,
      required: true,
    },
    shiftEndTime: {
      type: String,
      required: true,
    },
    roomNumber: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const DoctorProfile = mongoose.model(
  "DoctorProfile",
  doctorProfileSchema
);
