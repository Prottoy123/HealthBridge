import React, { useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import api from "../../../services/api";
import {
  fetchMyRecords,
  fetchMyPrescriptions,
} from "../Slices/patientVaultSlice";
import { UploadCloud, X, Check, Lock, Loader2, Upload } from "lucide-react";

const UploadRecordModal = ({ onClose }) => {
  const dispatch = useDispatch();

  // Local States
  const [uploadType, setUploadType] = useState("REPORT"); // "REPORT" | "PRESCRIPTION"
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Metadata States
  const [title, setTitle] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [recordDate, setRecordDate] = useState("");

  // Validation & Selection Logic
  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);

    if (uploadType === "PRESCRIPTION" && selected.length > 1) {
      toast.error("You can only upload one prescription image at a time.");
      return;
    }
    setFiles(selected);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (isUploading) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (uploadType === "PRESCRIPTION" && droppedFiles.length > 1) {
      toast.error("You can only upload one prescription image at a time.");
      return;
    }
    setFiles(droppedFiles);
  };

  // Execution Engine (Dual API Routing)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();

    try {
      if (uploadType === "PRESCRIPTION") {
        if (!title || !doctorName || !recordDate) {
          toast.error(
            "Title, Doctor Name, and Date are required for prescriptions.",
          );
          setIsUploading(false);
          return;
        }

        formData.append("title", title);
        formData.append("doctorName", doctorName);
        formData.append("prescriptionDate", recordDate);
        formData.append("prescriptionImage", files[0]);

        await api.post("/prescription/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Prescription securely encrypted and saved!");
        dispatch(fetchMyPrescriptions({ page: 1, limit: 8 }));
      } else {
        files.forEach((file) => {
          formData.append("recordFiles", file);
        });

        formData.append("description", title);
        formData.append("recordType", "LAB_REPORT");

        await api.post("/patient/medical-records/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Lab report securely encrypted and saved!");
        dispatch(fetchMyRecords({ page: 1, limit: 8 }));
      }

      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Encryption failed. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#03090a]/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-[#051316] border border-white/[0.05] rounded-3xl w-full max-w-4xl overflow-hidden shadow-sm animate-in zoom-in-95 duration-500 relative flex flex-col md:flex-row">
        
        {/* Left Column: Context / Instructions */}
        <div className="w-full md:w-5/12 bg-[#03090a] p-8 md:p-10 relative overflow-hidden flex flex-col justify-between shrink-0 border-r border-white/[0.05]">
          
          <div className="relative z-10">
            <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center border border-teal-500/20 mb-6 shadow-sm">
               <UploadCloud className="w-6 h-6 text-teal-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-200 tracking-tight leading-none mb-2">
              Secure Upload
            </h2>
            <p className="text-xs text-teal-400 font-semibold uppercase tracking-widest mb-6">
              End-to-End Encryption
            </p>
            
            <div className="space-y-4 text-xs text-slate-400 leading-relaxed font-medium">
              <p>
                All files uploaded to this vault are encrypted immediately upon transfer. Only you and authorized medical personnel can decrypt them.
              </p>
              <div className="bg-[#051316] border border-white/[0.05] p-4 rounded-xl">
                 <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px] mb-2">Supported Types</p>
                 <ul className="list-disc list-inside space-y-1 text-slate-500">
                    <li>Lab Reports: PDF, JPG, PNG (Multiple)</li>
                    <li>Prescriptions: JPG, PNG (Single for AI)</li>
                 </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-8 relative z-10 text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-2">
             <Lock className="w-3.5 h-3.5" />
             Ready to Upload
          </div>
        </div>

        {/* Right Column: Form Wizard */}
        <div className="w-full md:w-7/12 p-8 md:p-10 relative z-10">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-[#03090a] hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 font-bold transition-colors rounded-xl border border-white/[0.05] hover:border-rose-500/20 z-20"
            disabled={isUploading}
          >
            <X className="w-5 h-5" />
          </button>

          <form onSubmit={handleSubmit} className="flex flex-col h-full mt-6">
            
            {/* Type Selector OS Style */}
            <div className="flex bg-[#03090a] p-1.5 rounded-xl border border-white/[0.05] mb-6">
              <button
                type="button"
                onClick={() => setUploadType("REPORT")}
                className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  uploadType === "REPORT"
                    ? "bg-[#051316] text-teal-400 border border-white/[0.05] shadow-sm"
                    : "border border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                Lab Report
              </button>
              <button
                type="button"
                onClick={() => setUploadType("PRESCRIPTION")}
                className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  uploadType === "PRESCRIPTION"
                    ? "bg-[#051316] text-teal-400 border border-white/[0.05] shadow-sm"
                    : "border border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                Prescription
              </button>
            </div>

            <div className="space-y-4 flex-1">
               {/* Shared Title */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                  Document Identity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={uploadType === "REPORT" ? "e.g., Blood Panel Q3" : "e.g., Fever Medication"}
                  className="w-full px-5 py-3.5 border border-white/[0.05] rounded-xl text-slate-200 font-medium placeholder-slate-600 bg-[#03090a] focus:outline-none focus:border-teal-500/50 transition-colors text-sm"
                  required
                />
              </div>

              {/* Prescription specifics */}
              {uploadType === "PRESCRIPTION" && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                      Prescribing Doctor <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      placeholder="Dr. Smith"
                      className="w-full px-5 py-3.5 border border-white/[0.05] rounded-xl text-slate-200 font-medium placeholder-slate-600 bg-[#03090a] focus:outline-none focus:border-teal-500/50 transition-colors text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                      Date Issued <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={recordDate}
                      onChange={(e) => setRecordDate(e.target.value)}
                      className="w-full px-5 py-3.5 border border-white/[0.05] rounded-xl text-slate-200 font-medium placeholder-slate-600 bg-[#03090a] focus:outline-none focus:border-teal-500/50 transition-colors text-sm"
                      required
                      style={{ colorScheme: "dark" }}
                    />
                  </div>
                </div>
              )}

              {/* Drag and Drop Zone */}
              <div 
                className="mt-2 border border-dashed border-white/[0.1] rounded-2xl p-8 text-center bg-[#03090a]/50 hover:bg-[#03090a] transition-colors relative group"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  multiple={uploadType === "REPORT"}
                  accept={uploadType === "PRESCRIPTION" ? "image/jpeg, image/png, image/webp" : "*/*"}
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  disabled={isUploading}
                />
                
                <div className="flex flex-col items-center justify-center pointer-events-none relative z-10">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                    files.length > 0 ? "bg-teal-500/10 border border-teal-500/20 text-teal-400" : "bg-[#051316] border border-white/[0.05] text-slate-500 group-hover:text-teal-400"
                  }`}>
                    {files.length > 0 ? (
                       <Check className="w-6 h-6" />
                    ) : (
                       <Upload className="w-6 h-6" />
                    )}
                  </div>
                  
                  <div className="font-bold text-slate-200 text-sm">
                    {files.length > 0 ? (
                      <span className="text-teal-400">{files.length} file(s) attached</span>
                    ) : (
                      "Drag & Drop or Browse"
                    )}
                  </div>
                  
                  {files.length > 0 && (
                     <p className="text-xs text-slate-500 mt-2 font-medium truncate max-w-xs">
                        {files.map(f => f.name).join(', ')}
                     </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="mt-8 shrink-0">
               <button
                 type="submit"
                 disabled={isUploading || files.length === 0}
                 className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex justify-center items-center gap-3 ${
                   isUploading || files.length === 0
                     ? "bg-[#03090a] text-slate-600 border border-white/[0.05] cursor-not-allowed"
                     : "bg-teal-500 text-slate-900 hover:bg-teal-600 shadow-sm"
                 }`}
               >
                 {isUploading ? (
                    <>
                     <Loader2 className="w-4 h-4 animate-spin text-teal-900" />
                     Uploading...
                   </>
                 ) : (
                    <>
                       <Upload className="w-4 h-4" />
                       Upload File
                    </>
                 )}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadRecordModal;
