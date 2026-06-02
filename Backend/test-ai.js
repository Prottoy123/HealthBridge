import dotenv from "dotenv";

// 1. Load environment variables FIRST, before any other imports
dotenv.config({ path: "./.env" });

// 2. Now import your service (adjust the path if needed)
import { analyzeSymptomService } from "./src/services/analyzeSymptomService.js";
// 3. Create an async wrapper function to test the service
const runTest = async () => {
  console.log("Starting AI Analysis Test...\n");

  // Mock data mimicking frontend input
  const mockSymptoms =
    "I have been experiencing a severe headache, blurred vision, and slight nausea for the past 2 days. Medicine is not working.";

  try {
    // Execute the isolated service
    const result = await analyzeSymptomService(mockSymptoms);

    console.log("Success! AI Output:");
    console.log(result);
  } catch (error) {
    console.error("Test Failed! Error Details:");
    console.error(error.message || error);
  }
};

// 4. Trigger the test
runTest();
