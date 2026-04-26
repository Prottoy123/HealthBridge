import mongoose, { Schema } from "mongoose";

const patientProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, 
    },
    dateOfBirth: {
      type: Date,
    },
    bloodGroup: {
      type: String,
      trim: true,
    },
    allergies: [
      {
        type: String,
        trim: true,
      },
    ],
    chronicDiseases: [
      {
        type: String,
        trim: true,
      },
    ],
    emergencyContact: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const PatientProfile = mongoose.model(
  "PatientProfile",
  patientProfileSchema
);
