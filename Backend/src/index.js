import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import { server } from "./app.js";
import { connectRedis } from "./config/redis.config.js"; 
import { initializeRedisListener } from "./workers/redisListener.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {

    connectRedis();

    initializeRedisListener();

    server.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("🔴 MongoDB connection failed !!!", err);
    process.exit(1); 
  });
