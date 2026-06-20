import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalAppointmentId: {
      type: Schema.Types.ObjectId,
      ref: "FollowUp",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    attachmentUrl: {
      type: String, // ভবিষ্যতে ক্লাউডিনারি (Cloudinary) থেকে আসা ইমেজ/ফাইলের লিংক রাখার জন্য
      default: "",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Message = mongoose.model("Message", messageSchema);
