import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyRecords,
  fetchMyPrescriptions,
  clearVaultData,
} from "./Slices/patientVaultSlice";
import RecordGrid from "./Components/RecordGrid";
import UploadRecordModal from "./Components/UploadRecordModal";
import AiPrescriptionDecoder from "./Components/AiPrescriptionDecoder";
import { FolderLock, FileText, ClipboardList, Upload, ChevronRight, Loader2, AlertCircle, ChevronLeft } from "lucide-react";

const Vault = () => {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("REPORTS");
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedRecordForAI, setSelectedRecordForAI] = useState(null);

  const vaultState = useSelector((state) => state.patientVault);
  const currentData =
    activeTab === "REPORTS"
      ? vaultState.medicalRecords
      : vaultState.prescriptions;
  const { data: records, pagination, status, error } = currentData;

  useEffect(() => {
    if (activeTab === "REPORTS") {
      dispatch(fetchMyRecords({ page: currentPage, limit: 8 }));
    } else {
      dispatch(fetchMyPrescriptions({ page: currentPage, limit: 8 }));
    }
  }, [activeTab, currentPage, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearVaultData());
    };
  }, [dispatch]);

  const handleTabChange = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      setCurrentPage(1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (pagination.hasPrevPage) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto p-2">
      
      {/* LEFT SIDEBAR: VAULT NAVIGATION */}
      <div className="w-full md:w-72 shrink-0 flex flex-col gap-6">
        
        {/* Storage / Header Info */}
        <div className="bg-[#051316] p-6 rounded-2xl border border-white/[0.05] shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 bg-[#03090a] rounded-xl flex items-center justify-center border border-white/[0.05]">
                  <FolderLock className="w-5 h-5 text-teal-400" />
               </div>
               <div>
                  <h1 className="text-xl font-bold text-slate-200 tracking-tight">Secure Vault</h1>
                  <p className="text-[10px] font-bold text-teal-500 uppercase tracking-widest mt-0.5">Encrypted</p>
               </div>
            </div>
            
            <p className="text-xs text-slate-400 mt-4 leading-relaxed font-medium">
              Your decentralized repository for medical reports and prescriptions.
            </p>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="mt-6 w-full bg-teal-500 hover:bg-teal-600 text-slate-900 px-4 py-3 rounded-xl font-bold shadow-sm transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Upload className="w-4 h-4" />
              Upload File
            </button>
          </div>
        </div>

        {/* Folder Navigation */}
        <div className="bg-[#051316] p-4 rounded-2xl border border-white/[0.05] shadow-sm flex-1">
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2 mt-2">Locations</h2>
          
          <div className="space-y-2">
            <button
              onClick={() => handleTabChange("REPORTS")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === "REPORTS"
                  ? "bg-[#03090a] border border-white/[0.05]"
                  : "hover:bg-[#03090a]/50 border border-transparent"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${activeTab === "REPORTS" ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : "bg-[#051316] text-slate-400 border-white/[0.05]"}`}>
                <FileText className="w-4 h-4" />
              </div>
              <div className="text-left flex-1">
                <p className={`text-sm font-semibold ${activeTab === "REPORTS" ? "text-slate-200" : "text-slate-400"}`}>Lab Reports</p>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5">Test Results & Scans</p>
              </div>
            </button>

            <button
              onClick={() => handleTabChange("PRESCRIPTIONS")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === "PRESCRIPTIONS"
                  ? "bg-[#03090a] border border-white/[0.05]"
                  : "hover:bg-[#03090a]/50 border border-transparent"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${activeTab === "PRESCRIPTIONS" ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : "bg-[#051316] text-slate-400 border-white/[0.05]"}`}>
                <ClipboardList className="w-4 h-4" />
              </div>
              <div className="text-left flex-1">
                <p className={`text-sm font-semibold ${activeTab === "PRESCRIPTIONS" ? "text-slate-200" : "text-slate-400"}`}>Prescriptions</p>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5">Medication Scripts</p>
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* RIGHT PANE: FILE EXPLORER VIEW */}
      <div className="flex-1 flex flex-col bg-[#051316] rounded-2xl border border-white/[0.05] p-6 md:p-8 shadow-sm relative min-h-[600px]">

        {/* Directory Header Path */}
        <div className="flex items-center gap-2 mb-8 relative z-10 shrink-0">
          <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Vault</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="font-bold uppercase tracking-widest text-xs text-slate-200">
            {activeTab === "REPORTS" ? "Lab Reports" : "Prescriptions"}
          </span>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative z-10">
          {status === "loading" ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
               <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
               <p className="text-slate-400 font-semibold tracking-widest uppercase text-xs">
                  Decrypting Sector...
               </p>
            </div>
          ) : status === "failed" ? (
            <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center">
              <div className="w-16 h-16 bg-[#03090a] rounded-2xl flex items-center justify-center border border-rose-500/20 mb-4">
                <AlertCircle className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-rose-400 font-bold text-lg mb-2">Access Denied</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                {error || "Failed to establish a secure connection to the vault. Please try again."}
              </p>
            </div>
          ) : (
            <RecordGrid
              records={records}
              isPrescriptionTab={activeTab === "PRESCRIPTIONS"}
              onDecodeClick={(record) => setSelectedRecordForAI(record)}
            />
          )}
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="shrink-0 mt-8 pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <p className="text-sm text-slate-500 font-semibold tracking-widest text-[10px] uppercase">
              Directory Page{" "}
              <span className="text-teal-400">
                {pagination.currentPage}
              </span>{" "}
              of{" "}
              <span className="text-slate-200">
                {pagination.totalPages}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 bg-[#03090a] border border-white/[0.05] rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.05] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>
              <button
                onClick={handleNextPage}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 bg-[#03090a] border border-white/[0.05] rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.05] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals Mounting Zone */}
      {isUploadModalOpen && (
        <UploadRecordModal onClose={() => setIsUploadModalOpen(false)} />
      )}

      {selectedRecordForAI && (
        <AiPrescriptionDecoder
          record={selectedRecordForAI}
          onClose={() => setSelectedRecordForAI(null)}
        />
      )}
    </div>
  );
};

export default Vault;
