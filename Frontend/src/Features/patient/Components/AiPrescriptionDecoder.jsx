import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  decodePrescription,
  clearDecodedPrescription,
} from "../Slices/AI-Slices";
import toast from "react-hot-toast";

const AiPrescriptionDecoder = () => {
  const dispatch = useDispatch();

  // Redux State Extraction
  const { decodedPrescription, isDecodingPrescription, prescriptionError } =
    useSelector((state) => state.ai);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file format. Please upload JPEG, PNG, or WEBP.");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error("Image size exceeds 5MB limit.");
      return;
    }

    // 3. Memory Safe Preview Generation
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreview = URL.createObjectURL(file);
    setPreviewUrl(newPreview);
    setSelectedFile(file);
  };

  // The Execution Engine
  const handleDecodeSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a prescription image first.");
      return;
    }
    dispatch(decodePrescription(selectedFile));
  };

  useEffect(() => {
    if (prescriptionError) {
      toast.error(
        prescriptionError === "422" ||
          prescriptionError.includes("Unprocessable")
          ? "ছবিটি অস্পষ্ট। অনুগ্রহ করে আলোতে স্পষ্ট ছবি তুলে আবার আপলোড করুন।"
          : prescriptionError || "Failed to decode the prescription.",
      );
    }
  }, [prescriptionError]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      dispatch(clearDecodedPrescription());
    };
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto mt-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <svg
            className="w-6 h-6 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Vision AI Decoder
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload a clear picture of your prescription to extract medicines and
          instructions automatically.
        </p>
      </div>

      <form onSubmit={handleDecodeSubmit} className="space-y-6">
        {/* Upload Zone */}
        <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
          <input
            type="file"
            accept="image/jpeg, image/png, image/webp"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {previewUrl ? (
            <div className="w-full relative">
              <img
                src={previewUrl}
                alt="Prescription preview"
                className="max-h-64 mx-auto rounded shadow-sm"
              />
              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                Click to change
              </div>
            </div>
          ) : (
            <div className="text-center">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                Tap or drag an image here
              </span>
              <p className="text-xs text-gray-500 mt-1">
                JPEG, PNG, WEBP (Max 5MB)
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={!selectedFile || isDecodingPrescription}
          className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 
            ${!selectedFile || isDecodingPrescription ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg"}`}
        >
          {isDecodingPrescription ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Decoding Image...
            </>
          ) : (
            "Decode with AI"
          )}
        </button>
      </form>

      {/* Result UI (Structured JSON Rendering) */}
      {decodedPrescription && (
        <div className="mt-8 p-5 bg-indigo-50 border border-indigo-100 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="font-semibold text-indigo-900 mb-4 border-b border-indigo-200 pb-2">
            AI Analysis Result
          </h3>

          <div className="space-y-4">
            {/* assuming decodedPrescription returns an array of medicines or structured objects */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-indigo-50">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-auto">
                {JSON.stringify(decodedPrescription, null, 2)}
              </pre>
            </div>

            <p className="text-xs text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
              <svg
                className="w-4 h-4 text-amber-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              AI generated content. Always consult a real doctor before taking
              medication.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiPrescriptionDecoder;
