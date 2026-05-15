import mongoose, { Schema } from "mongoose";

const prescriptionSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Prescription title is required"],
      trim: true,
    },
    doctorName: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
    },
    prescriptionDate: {
      type: Date,
      required: [true, "Prescription date is required"],
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      default: null, 
    },
    fileUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String, 
      required: true,
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

prescriptionSchema.index({ patientId: 1, appointmentId: 1 });

export const Prescription = mongoose.model("Prescription", prescriptionSchema);
