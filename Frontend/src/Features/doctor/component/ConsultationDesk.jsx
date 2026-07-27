import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchAppointmentDetails,
  clearActiveConsultation,
  completeConsultation,
} from "../Slices/doctorSlice";
import { User, Activity, AlertCircle, FileText, CheckCircle, Archive, AlertTriangle } from "lucide-react";

import PatientHistoryDrawer from "../../chat/component/PatientHistoryDrawer";

const ConsultationDesk = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    activeAppointment,
    isConsultationLoading,
    consultationError,
    isCompleting,
  } = useSelector((state) => state.doctor);

  const [followUpDays, setFollowUpDays] = useState("");
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

  if (isConsultationLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-teal-400 font-medium flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
          Loading Consultation...
        </div>
      </div>
    );
  }

  if (consultationError) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-rose-500 mb-2">Error Loading Patient Data</h3>
          <p className="text-slate-400 mb-4">{consultationError}</p>
          <button
            onClick={() => dispatch(fetchAppointmentDetails(appointmentId))}
            className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!activeAppointment && !isConsultationLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <User className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-300 mb-1">No Patient Data Found</h2>
          <p className="text-slate-500 text-sm">Could not retrieve consultation details.</p>
        </div>
      </div>
    );
  }

  const patientId = activeAppointment?.patientId?._id || activeAppointment?.patientId;

  return (
    <div className="w-full max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-2">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-teal-400" />
            Consultation Desk
          </h1>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
            Status: <span className="text-teal-400 px-2 py-0.5 bg-teal-500/10 rounded-md border border-teal-500/20 text-xs font-medium">{activeAppointment?.status}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-[#051316] p-2 rounded-xl border border-white/[0.05]">
          <div className="flex items-center bg-white/[0.02] px-3 py-2 rounded-lg border border-white/[0.05]">
            <label className="text-sm text-slate-400 mr-2">Follow-up in days:</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={followUpDays}
              onChange={(e) => setFollowUpDays(e.target.value)}
              className="w-16 bg-transparent text-slate-200 text-sm focus:outline-none placeholder-slate-600 text-right"
            />
          </div>
          <button
            onClick={handleCompleteVisit}
            disabled={isCompleting}
            className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:bg-white/[0.05] disabled:text-slate-500 disabled:cursor-not-allowed text-slate-900 font-semibold rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
          >
            {isCompleting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                Closing...
              </>
            ) : (
              <>
                Complete Visit
                <CheckCircle className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#03090a] rounded-2xl border border-white/[0.05] p-6">
            <h2 className="text-sm font-semibold text-slate-300 border-b border-white/[0.05] pb-3 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-teal-400" />
              Patient Details
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Name</span>
                <span className="font-medium text-slate-200">{activeAppointment?.patientDetails?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Age</span>
                <span className="font-medium text-slate-200">{activeAppointment?.patientDetails?.age}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Blood Group</span>
                <span className="font-medium text-slate-200">{activeAppointment?.patientDetails?.bloodGroup || "N/A"}</span>
              </div>
              <div className="pt-3 border-t border-white/[0.05] text-sm">
                <span className="text-slate-400 block mb-1">Emergency Contact</span>
                <span className="font-medium text-slate-200">{activeAppointment?.patientDetails?.emergencyContact || "Not Provided"}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#051316] rounded-2xl border border-teal-500/20 p-6">
            <h2 className="text-sm font-semibold text-teal-400 border-b border-teal-500/20 pb-3 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              AI Symptom Summary
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {activeAppointment?.aiSymptomSummary || "No pre-assessment generated for this visit."}
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
          <div className="bg-[#03090a] rounded-2xl border border-white/[0.05] p-6 min-h-[500px] flex flex-col">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.05] pb-4 mb-6 gap-4">
              <h2 className="text-lg font-semibold text-slate-200">Clinical Overview</h2>
              <button
                onClick={() => setIsVaultOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors border border-white/[0.05]"
              >
                <Archive className="w-4 h-4 text-teal-400" />
                Open Patient Vault
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/10">
                <h3 className="text-sm font-medium text-rose-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Known Allergies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeAppointment?.patientDetails?.allergies?.length > 0 ? (
                    activeAppointment.patientDetails.allergies.map((allergy, i) => (
                      <span key={i} className="px-2.5 py-1 bg-rose-500/10 text-rose-300 text-xs rounded-md border border-rose-500/20">
                        {allergy}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">None reported</span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                <h3 className="text-sm font-medium text-indigo-400 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Chronic Diseases
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeAppointment?.patientDetails?.chronicDiseases?.length > 0 ? (
                    activeAppointment.patientDetails.chronicDiseases.map((disease, i) => (
                      <span key={i} className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 text-xs rounded-md border border-indigo-500/20">
                        {disease}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">None reported</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center bg-[#051316] rounded-xl border border-white/[0.02] p-8 text-center text-slate-500">
              <FileText className="w-10 h-10 mb-3 opacity-50" />
              <p className="font-medium text-slate-300">Workspace Ready</p>
              <p className="text-sm mt-1">Review the patient's history in the Vault.</p>
            </div>
          </div>
        </div>
      </div>

      <PatientHistoryDrawer
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        patientId={patientId}
      />
    </div>
  );
};

export default ConsultationDesk;
