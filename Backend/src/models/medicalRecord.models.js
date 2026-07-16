import mongoose, { Schema } from "mongoose";

const medicalRecordSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, 
    },
    fileUrl: {
      type: String, // Cloudinary URL
      required: true,
    },
    recordType: {
      type: String,
      enum: ["LAB_REPORT", "PRESCRIPTION", "PAST_HISTORY", "OTHER"],
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    uploaderRole: {
      type: String,
      enum: ["PATIENT", "STAFF", "DOCTOR", "ADMIN"],
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const MedicalRecord = mongoose.model(
  "MedicalRecord",
  medicalRecordSchema
);
