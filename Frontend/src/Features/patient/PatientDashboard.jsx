import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchPatientProfile } from "./Slices/patientSlice";
import AiSymptomBot from "./Components/AiSymptomBot";
import { Loader2, AlertCircle, RefreshCw, User, Search, FolderLock, Activity, Stethoscope } from "lucide-react";

const PatientDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { profile, status } = useSelector((state) => state.patient);
  const { symptomSummary } = useSelector((state) => state.ai);

  useEffect(() => {
    if (profile === null && status === "idle") {
      dispatch(fetchPatientProfile());
    }
  }, [profile, status, dispatch]);

  const handleFindDoctor = () => navigate("/patient/get-doctors");
  const handleOpenVault = () => navigate("/patient/vault");

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
        <p className="text-teal-400 font-semibold tracking-widest uppercase text-xs animate-pulse">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="bg-[#051316] border border-rose-500/20 px-8 py-8 rounded-3xl flex flex-col items-center max-w-sm w-full text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
          <p className="text-rose-400 font-bold text-sm tracking-wide">
            Failed to Load Dashboard.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 flex items-center justify-center gap-2 w-full px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700 max-w-[1400px] mx-auto min-h-[calc(100vh-8rem)]">
      
      {/* ========================================================= */}
      {/* TOP PORTION: GREETING & QUICK ACTIONS                     */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Dynamic Greeting Card (Spans 7/12) */}
        <div className="lg:col-span-7 bg-[#051316] p-8 rounded-[2rem] border border-white/[0.05] relative overflow-hidden group flex flex-col justify-center">
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 h-full">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1.5 bg-[#03090a] border border-white/[0.05] rounded-full text-[10px] font-bold tracking-widest uppercase text-slate-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                  System Online
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-200 tracking-tight">
                Hello, {profile?.user?.fullName?.split(' ')[0] || "Patient"}.
              </h1>
              <p className="text-slate-400 mt-3 text-sm max-w-md leading-relaxed">
                Your medical dashboard is ready. View your records, book an appointment, or check your symptoms below.
              </p>
            </div>
            
            <div className="hidden sm:flex w-24 h-24 rounded-full bg-[#03090a] border-4 border-white/[0.02] items-center justify-center shrink-0">
               <User className="w-10 h-10 text-teal-500/50" />
            </div>
          </div>
        </div>

        {/* 2. Quick Actions Grid (Spans 5/12) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
          
          {/* Action: Book Specialist */}
          <button
            onClick={handleFindDoctor}
            className="group flex flex-col justify-center items-start text-left bg-[#051316] p-6 rounded-[2rem] border border-white/[0.05] hover:border-teal-500/30 hover:bg-white/[0.02] transition-colors relative overflow-hidden h-full min-h-[160px]"
          >
            <div className="w-12 h-12 rounded-xl bg-[#03090a] border border-white/[0.05] flex items-center justify-center mb-4 group-hover:bg-teal-500/10 group-hover:border-teal-500/20 transition-colors">
              <Search className="w-5 h-5 text-slate-400 group-hover:text-teal-400" />
            </div>
            <h3 className="font-semibold text-slate-200 text-lg group-hover:text-teal-400 transition-colors">Find Specialist</h3>
            <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">Browse our network of medical professionals.</p>
          </button>

          {/* Action: Medical Vault */}
          <button
            onClick={handleOpenVault}
            className="group flex flex-col justify-center items-start text-left bg-[#051316] p-6 rounded-[2rem] border border-white/[0.05] hover:border-cyan-500/30 hover:bg-white/[0.02] transition-colors relative overflow-hidden h-full min-h-[160px]"
          >
            <div className="w-12 h-12 rounded-xl bg-[#03090a] border border-white/[0.05] flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20 transition-colors">
              <FolderLock className="w-5 h-5 text-slate-400 group-hover:text-cyan-400" />
            </div>
            <h3 className="font-semibold text-slate-200 text-lg group-hover:text-cyan-400 transition-colors">Medical Records</h3>
            <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">Access your prescriptions & lab reports.</p>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM PORTION: AI TRIAGE                                 */}
      {/* ========================================================= */}
      <div className="flex-1 bg-[#051316] p-6 sm:p-8 rounded-[2rem] border border-white/[0.05] flex flex-col relative overflow-hidden min-h-[500px]">
        
        {/* Header */}
        <div className="mb-6 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#03090a] flex items-center justify-center border border-white/[0.05]">
                <Activity className="w-4 h-4 text-teal-400" />
              </div>
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                AI Assistant Ready
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-200 tracking-tight">
              Check Symptoms
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-xl">
              Describe how you are feeling below. Our AI assistant will generate a summary to help your doctor understand your condition better.
            </p>
          </div>
          
          {/* Action button if summary is ready */}
          {symptomSummary && (
            <button
              onClick={handleFindDoctor}
              className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold text-xs rounded-xl shadow-sm transition-colors uppercase tracking-widest whitespace-nowrap flex items-center gap-2 shrink-0"
            >
              <Stethoscope className="w-4 h-4" />
              Consult Specialist
            </button>
          )}
        </div>

        {/* The AI Component */}
        <div className="flex-1 flex flex-col relative z-10 w-full min-h-[400px]">
          <div className="bg-[#03090a] rounded-[1.5rem] border border-white/[0.05] p-2 flex-1 flex flex-col overflow-hidden">
            <AiSymptomBot />
          </div>
        </div>

      </div>

    </div>
  );
};

export default PatientDashboard;
