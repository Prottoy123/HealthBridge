import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { analyzeSymptoms, clearSymptomSummary } from "./Slices/AI-Slices";

function AiSymptomBot() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { symptomSummary, isAnalyzingSymptom, symptomError } = useSelector(
    (state) => state.ai,
  );

  const [symptomText, setSymptomText] = useState("");

  const isValidInput = symptomText.trim().length >= 20;

  const handleAnalyze = () => {
    if (!isValidInput) {
      toast.error("Please enter at least 20 characters for symptom analysis.");
      return;
    }

    dispatch(analyzeSymptoms(symptomText))
      .unwrap()
      .then(() => {
        toast.success("Analysis complete! Review your summary.");
      })
      .catch((error) => {
        toast.error(error || "Failed to analyze symptoms.");
      });
  };

  const handleClear = () => {
    dispatch(clearSymptomSummary());
    setSymptomText("");
  };

  const handleProceed = () => {
    navigate("/patient/get-doctors");
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-6 mt-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* হেডার সেকশন */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center">
          <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            AI Triage Bot
          </h2>
          <p className="text-blue-100 text-sm font-medium">
            Describe your symptoms naturally, and our AI will generate a
            structured summary for the doctor.
          </p>
        </div>

        <div className="p-6">
          {symptomSummary ? (
            // --- State 2: Result Mode (Fixed Object Rendering) ---
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 relative shadow-inner">
                <div className="absolute top-0 right-0 -mt-3 -mr-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  Ready for Doctor
                </div>

                {/* AI Object Breakdown */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Generated Summary
                    </h3>
                    <p className="text-gray-800 text-base leading-relaxed font-medium">
                      {symptomSummary.aiSymptomSummary}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-3 border-t border-blue-200">
                    <div className="flex-1">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Recommended Specialist
                      </h3>
                      <p className="text-blue-700 font-bold bg-blue-100 inline-block px-3 py-1 rounded-md">
                        {symptomSummary.specialistRecommendation}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Severity Level
                      </h3>
                      <span
                        className={`inline-block px-3 py-1 rounded-md text-sm font-bold ${
                          symptomSummary.severityLevel
                            ?.toLowerCase()
                            .includes("high") ||
                          symptomSummary.severityLevel
                            ?.toLowerCase()
                            .includes("severe")
                            ? "bg-red-100 text-red-700"
                            : symptomSummary.severityLevel
                                  ?.toLowerCase()
                                  .includes("moderate")
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {symptomSummary.severityLevel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={handleProceed}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all hover:shadow-lg flex justify-center items-center gap-2"
                >
                  <span>Proceed to Book Doctor</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleClear}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Re-analyze / Edit
                </button>
              </div>
            </div>
          ) : (
            // --- State 1: Input Mode ---
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  How are you feeling today?
                </label>
                <textarea
                  value={symptomText}
                  onChange={(e) => setSymptomText(e.target.value)}
                  placeholder="Example: I have been experiencing a high fever and severe headache for the last 3 days..."
                  rows="5"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none bg-gray-50 focus:bg-white"
                  disabled={isAnalyzingSymptom}
                ></textarea>

                <div className="flex justify-between items-center mt-2">
                  <span
                    className={`text-xs font-medium ${symptomText.trim().length >= 20 ? "text-green-600" : "text-gray-500"}`}
                  >
                    {symptomText.trim().length} characters
                  </span>
                  {symptomError && (
                    <span className="text-xs font-semibold text-red-500">
                      {symptomError}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!isValidInput || isAnalyzingSymptom}
                className={`w-full py-3.5 rounded-xl text-white font-bold text-lg transition-all shadow-md flex justify-center items-center gap-2 ${
                  !isValidInput || isAnalyzingSymptom
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                }`}
              >
                {isAnalyzingSymptom ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing Symptoms...
                  </>
                ) : (
                  "Generate AI Summary"
                )}
              </button>

              {!isValidInput && (
                <p className="text-center text-xs text-gray-500 font-medium">
                  Please type at least 20 characters to enable AI analysis.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AiSymptomBot;
