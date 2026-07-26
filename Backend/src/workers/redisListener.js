import { Redis } from "ioredis";
import { FollowUp } from "../models/followUp.models.js"; // তোমার মডেলের সঠিক পাথ দিও
import { getRedis } from "../config/redis.config.js";

// 1. Dedicated subscriber connection (Only for listening to alarms)
const subscriber = new Redis(process.env.UPSTASH_REDIS_URL, {
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
});

export const initializeRedisListener = async () => {
  try {
    // 2. Enable expiry alarms in Redis server
    try {
      await subscriber.config("SET", "notify-keyspace-events", "Ex");
    } catch (configErr) {
      console.log("🟡 Config SET skipped (Managed securely by Upstash).");
    }

    // 3. Subscribe to the exact channel where expiry alarms are triggered
    await subscriber.subscribe("__keyevent@0__:expired");
    console.log("🟢 Redis Omni-Listener is active and waiting for timers...");

    // 4. The Single Router (Handles both Unlock and Close events)
    subscriber.on("message", async (channel, message) => {
      // Security check: Only process messages from the expired channel
      if (channel !== "__keyevent@0__:expired") return;

      // ==========================================
      // CONDITION A: 5 Days Over -> Unlock Chat
      // ==========================================
      if (message.startsWith("chat_unlock:")) {
        const appointmentId = message.split(":")[1];
        console.log(`⏳ Unlocking chat for Appointment: ${appointmentId}`);

        try {
          // Step A1: Make chat ACTIVE in the database
          const updatedChat = await FollowUp.findOneAndUpdate(
            { originalAppointmentId: appointmentId },
            { $set: { status: "ACTIVE" } },
            { returnDocument: "after" }
          );

          if (updatedChat) {
            console.log(`✅ Chat ACTIVE. Setting 48-hour auto-close timer...`);

            // Step A2: Use the main connection (getRedis) to set the 48h timer
            const mainRedis = getRedis();
            const closeTimerKey = `chat_close:${appointmentId}`;
            const closeTimerTTL = 48 * 60 * 60; // 48 hours in seconds (172800)

            await mainRedis.set(
              closeTimerKey,
              "closing_soon",
              "EX",
              closeTimerTTL
            );
            console.log(
              `⏱️ 48-hour countdown started for Appointment: ${appointmentId}`
            );
          }
        } catch (error) {
          console.error(
            `🔴 Failed to unlock chat for ${appointmentId}:`,
            error
          );
        }
      }

      // ==========================================
      // CONDITION B: 48 Hours Over -> Close Chat
      // ==========================================
      else if (message.startsWith("chat_close:")) {
        const appointmentId = message.split(":")[1];
        console.log(
          `⌛ Time is up! Closing chat for Appointment: ${appointmentId}`
        );

        try {
          // Step B1: Make chat CLOSED permanently in the database
          const updatedChat = await FollowUp.findOneAndUpdate(
            { originalAppointmentId: appointmentId },
            { $set: { status: "CLOSED" } },
            { returnDocument: "after" }
          );

          if (updatedChat) {
            console.log(
              `🔒 SUCCESS: Chat permanently CLOSED for Appointment: ${appointmentId}`
            );
          }
        } catch (error) {
          console.error(`🔴 Failed to close chat for ${appointmentId}:`, error);
        }
      }
    });
  } catch (error) {
    console.error("🔴 Redis Listener Initialization Failed:", error);
  }
};
