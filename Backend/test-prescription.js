import dotenv from "dotenv";
import { decodePrescriptionService } from "./src/services/decodePrescription.js";
dotenv.config({ path: "./.env" });

const runVisionTest = async () => {
  console.log("Starting Vision AI Test...\n");

  // Mocking Multer's req.file object manually
  const mockReqFile = {
    path: "./sample-prescription.jpg", // The location of our test image
    mimetype: "image/jpeg", // The identity of the image
  };

  try {
    // Pass the mock object directly to your service
    const result = await decodePrescriptionService(mockReqFile);

    console.log("Success! Extracted Medicines:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Test Failed! Error Details:");
    console.error(error.message || error);
  }
};

runVisionTest();
