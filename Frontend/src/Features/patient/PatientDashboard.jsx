import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchPatientProfile } from "./Slices/patientSlice";
import AiSymptomBot from "./Components/AiSymptomBot";

const PatientDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux State Extraction
  const { profile, status } = useSelector((state) => state.patient);
  const { symptomSummary } = useSelector((state) => state.ai);

  useEffect(() => {
    if (profile === null && status === "idle") {
      dispatch(fetchPatientProfile());
    }
  }, [profile, status, dispatch]);

  // Navigation Handlers (Zero-friction routing)
  const handleFindDoctor = () => {
    navigate("/patient/get-doctors");
  };

  const handleOpenVault = () => {
    navigate("/patient/vault");
  };

  // Guard Rail: Loading State
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  // Error State Handling (Optional but recommended)
  if (status === "failed") {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500 font-medium">
          Failed to load profile. Please refresh.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Greeting Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back
            {profile?.user?.fullName ? `, ${profile.user.fullName}` : ""} 👋
          </h1>
          <p className="text-gray-500 mt-1">How are you feeling today?</p>
        </div>
      </div>

      {/* 2. AI Triage Mounting Zone (The Core Feature) */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-blue-900">
            AI Symptom Checker
          </h2>
          <p className="text-sm text-blue-700">
            Describe your symptoms and let our AI guide you to the right
            specialist.
          </p>
        </div>

        {/* AiSymptomBot কম্পোনেন্টটি এখানে রেন্ডার হবে */}
        <div className="bg-white rounded-xl p-4 shadow-inner">
          {/* <AiSymptomBot /> */}
          <div className="text-center text-gray-400 py-10 border-2 border-dashed border-gray-200 rounded-lg">
            <AiSymptomBot/>
          </div>
        </div>

        {/* যদি আগে থেকে সামারি থাকে, তবে ইউজারকে একটি রিমাইন্ডার দেখাবে */}
        {symptomSummary && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex justify-between items-center">
            <span>You have an active AI recommendation.</span>
            <button
              onClick={handleFindDoctor}
              className="font-semibold underline"
            >
              Find Doctor Now
            </button>
          </div>
        )}
      </div>

      {/* 3. Quick Action Widgets (Service-on-demand Model) */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Action Card: Find Specialist */}
          <div
            onClick={handleFindDoctor}
            className="group cursor-pointer bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-600 transition-colors duration-200">
                <svg
                  className="w-6 h-6 text-blue-600 group-hover:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Find a Specialist
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Book a new appointment
                </p>
              </div>
            </div>
          </div>

          {/* Action Card: Medical Vault */}
          <div
            onClick={handleOpenVault}
            className="group cursor-pointer bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-emerald-500 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-emerald-100 p-3 rounded-xl group-hover:bg-emerald-600 transition-colors duration-200">
                <svg
                  className="w-6 h-6 text-emerald-600 group-hover:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Medical Vault</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Access reports & prescriptions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
