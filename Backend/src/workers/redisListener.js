import { Redis } from "ioredis";
import { FollowUp } from "../models/followUp.models.js"; 

const subscriber = new Redis(process.env.UPSTASH_REDIS_URL, {
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
});

export const initializeRedisListener = async () => {
  try {
    // enable the alarm system for expired keys 
    try {
      await subscriber.config("SET", "notify-keyspace-events", "Ex");
    } catch (configErr) {
      console.log(
        "🟡 Config SET command skipped (Managed by Upstash Environment)."
      );
    }

    await subscriber.subscribe("__keyevent@0__:expired");
    console.log(
      "🟢 Redis Worker is actively listening for expired chat timers..."
    );

    // Event listener and data parsing
    subscriber.on("message", async (channel, message) => {
      if (
        channel === "__keyevent@0__:expired" &&
        message.startsWith("chat_unlock:")
      ) {
        // getting the appointment ID from the expired key
        const appointmentId = message.split(":")[1];
        console.log(
          `⏳ Timer expired! Triggering chat unlock for Appointment: ${appointmentId}`
        );

        try {
          const updatedChat = await FollowUp.findOneAndUpdate(
            { originalAppointmentId: appointmentId }, 
            { $set: { status: "ACTIVE" } }, 
            { new: true }
          );

          if (updatedChat) {
            console.log(
              `✅ SUCCESS: Chat unlocked securely for Appointment: ${appointmentId}`
            );
          } else {
            console.log(
              `⚠️ WARNING: FollowUp record not found for Appointment: ${appointmentId}`
            );
          }
        } catch (dbError) {
          console.error(
            `🔴 ERROR: MongoDB update failed for Appointment ${appointmentId}:`,
            dbError
          );
        }
      }
    });
  } catch (error) {
    console.error("🔴 Redis Listener Initialization Failed:", error);
  }
};
