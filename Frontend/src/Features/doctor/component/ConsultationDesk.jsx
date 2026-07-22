import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchAppointmentDetails,
  clearActiveConsultation,
  completeConsultation,
} from "../Slices/doctorSlice";

// 🚀 Import the Vault Drawer (Adjust the path based on your folder structure)
import PatientHistoryDrawer from "../../chat/component/PatientHistoryDrawer";

const ConsultationDesk = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux State Extraction
  const {
    activeAppointment,
    isConsultationLoading,
    consultationError,
    isCompleting,
  } = useSelector((state) => state.doctor);

  const [followUpDays, setFollowUpDays] = useState("");

  // 🚀 New State for handling the Side-Drawer
  const [isVaultOpen, setIsVaultOpen] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      dispatch(fetchAppointmentDetails(appointmentId));
    }

    return () => {
      dispatch(clearActiveConsultation());
    };
  }, [dispatch, appointmentId]);

  const handleCompleteVisit = async () => {
    try {
      await dispatch(
        completeConsultation({
          appointmentId,
          followUpDays: followUpDays ? Number(followUpDays) : 0,
        }),
      ).unwrap();

      toast.success("Visit completed successfully");
      navigate("/doctor/queue");
    } catch (error) {
      toast.error(error || "Failed to complete visit");
    }
  };

  // Guard Clauses (Loading, Error, Empty)
  if (isConsultationLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-semibold animate-pulse">
          Initializing Workspace...
        </p>
      </div>
    );
  }

  if (consultationError) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <div className="p-8 bg-red-50 border border-red-200 rounded-xl text-center max-w-md">
          <h3 className="text-xl font-bold text-red-700 mb-3">Sync Failure</h3>
          <p className="text-slate-600 mb-6">{consultationError}</p>
          <button
            onClick={() => dispatch(fetchAppointmentDetails(appointmentId))}
            className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!activeAppointment && !isConsultationLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-slate-500">
        <span className="text-4xl mb-4">📭</span>
        <h2 className="text-xl font-semibold">No Patient Data Found</h2>
      </div>
    );
  }

  // Determine Patient ID for the Vault (Assuming populate or direct ID)
  const patientId =
    activeAppointment?.patientId?._id || activeAppointment?.patientId;

  return (
    <div className="w-full max-w-7xl mx-auto mt-4 pb-12">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Consultation Desk
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Status:{" "}
            <span className="font-semibold text-blue-600">
              {activeAppointment?.status}
            </span>
          </p>
        </div>

        {/* Completion Action Block */}
        <div className="flex items-center space-x-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
          <div className="flex items-center">
            <label className="text-sm font-medium text-slate-600 mr-2">
              Follow-up After:
            </label>
            <input
              type="number"
              min="0"
              placeholder="Days"
              value={followUpDays}
              onChange={(e) => setFollowUpDays(e.target.value)}
              className="w-20 px-3 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <button
            onClick={handleCompleteVisit}
            disabled={isCompleting}
            className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isCompleting ? "Closing..." : "Complete Visit"}
          </button>
        </div>
      </div>

      {/* Main Grid Layout: Profile (Left) & Medical History (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Patient Mini Profile & AI Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-3 mb-4">
              Patient Identity
            </h2>
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-700">Name:</span>{" "}
                {activeAppointment?.patientDetails?.name}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Age:</span>{" "}
                {activeAppointment?.patientDetails?.age}
              </p>
              <p>
                <span className="font-semibold text-slate-700">
                  Blood Group:
                </span>{" "}
                {activeAppointment?.patientDetails?.bloodGroup || "N/A"}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Emergency:</span>{" "}
                {activeAppointment?.patientDetails?.emergencyContact}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-100 p-6">
            <h2 className="text-lg font-bold text-blue-900 border-b border-blue-200 pb-3 mb-4">
              AI Symptom Summary
            </h2>
            <p className="text-sm text-blue-800 leading-relaxed">
              {activeAppointment?.aiSymptomSummary ||
                "No AI pre-assessment generated for this visit."}
            </p>
          </div>
        </div>

        {/* Right Column: Medical Records & Clinical Data */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
            {/* 🚀 Refactored Header: Clinical Overview + Magic Vault Button */}
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-800">
                Clinical Overview
              </h2>
              <button
                onClick={() => setIsVaultOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-bold transition-colors shadow-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                <span>Open Vault (Records & Rx)</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <h3 className="font-semibold text-slate-700 mb-2">
                  Known Allergies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeAppointment?.patientDetails?.allergies?.length > 0 ? (
                    activeAppointment.patientDetails.allergies.map(
                      (allergy, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium"
                        >
                          {allergy}
                        </span>
                      ),
                    )
                  ) : (
                    <span className="text-sm text-slate-500">
                      None reported
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <h3 className="font-semibold text-slate-700 mb-2">
                  Chronic Diseases
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeAppointment?.patientDetails?.chronicDiseases?.length >
                  0 ? (
                    activeAppointment.patientDetails.chronicDiseases.map(
                      (disease, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium"
                        >
                          {disease}
                        </span>
                      ),
                    )
                  ) : (
                    <span className="text-sm text-slate-500">
                      None reported
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 🚀 Removed the old heavy tabbed interface placeholder. 
                Leaving a clean space for the doctor to take notes or focus on the call. */}
            <div className="flex flex-col items-center justify-center h-48 bg-slate-50 border border-slate-100 rounded-lg text-slate-400">
              <svg
                className="w-12 h-12 mb-3 text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                ></path>
              </svg>
              <p className="text-sm font-medium">Workspace Ready</p>
              <p className="text-xs text-slate-400 mt-1">
                Click "Open Vault" above to view patient history
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 Mounting the Vault Drawer */}
      <PatientHistoryDrawer
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        patientId={patientId}
      />
    </div>
  );
};

export default ConsultationDesk;
