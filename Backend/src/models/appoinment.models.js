import mongoose, { Schema } from "mongoose";
const appointmentSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, 
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, 
    appointmentDate: {
      type: Date,
      required: true,
    }, 
    startTime: {
      type: String,
      required: true,
    }, 
    endTime: {
      type: String,
      required: true,
    }, 
    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "CHECKED-IN",
        "IN-PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING",
    }, 
    aiSymptomSummary: {
      type: String,
    }, 
  },
  { timestamps: true }
);

appointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, startTime: 1 },
  { unique: true }
);

export const Appointment = mongoose.model("Appointment", appointmentSchema);
