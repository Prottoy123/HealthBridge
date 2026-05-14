import mongoose, { Schema } from "mongoose";

const followUpSchema = new Schema(
  {
    originalAppointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      index: true, // Faster querying for chat sessions
    },
    type: {
      type: String,
      enum: {
        values: ["REPORT_REVIEW", "POST_MEDICATION_CHAT"],
        message: "{VALUE} is not a valid follow-up type",
      },
      required: true,
    },
    status: {
      type: String,
      enum: ["SCHEDULED", "ACTIVE", "CLOSED"],
      default: "SCHEDULED", // Initially scheduled based on doctor's input
    },
    unlocksAt: {
      type: Date,
      required: [true, "Unlock date is required"],
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
  },
  {
    timestamps: true,
  }
);

export const FollowUp = mongoose.model("FollowUp", followUpSchema);
