import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import api from "../../services/api";
import { Search, UploadCloud, CheckCircle, File, Loader2, ArrowRight } from "lucide-react";
import { uploadPatientReport } from "../staff/Slices/staffSlice";

const ReportManager = () => {
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await api.get(
          `/staff/patient-search?query=${searchTerm}`,
        );
        setSearchResults(response.data.data);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error("You can only upload a maximum of 5 files.");
      return;
    }
    setSelectedFiles(files);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedPatientId) {
      toast.error("Please search and select a patient from the list.");
      return;
    }
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one medical record.");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("patientId", selectedPatientId);

    selectedFiles.forEach((file) => {
      formData.append("recordFiles", file);
    });

    try {
      await dispatch(uploadPatientReport(formData)).unwrap();
      toast.success("Medical records securely linked to the patient.");

      setSelectedPatientId("");
      setSearchTerm("");
      setSearchResults([]);
      setSelectedFiles([]);
      document.getElementById("file-upload").value = "";
    } catch (error) {
      toast.error(error || "Database transaction failed. Try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatientId(patient._id);
    setSearchTerm(patient.fullName);
    setSearchResults([]); 
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-2">
          <File className="w-6 h-6 text-teal-400" />
          Medical Records Vault
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Securely upload and link lab reports to a patient's global health profile.
        </p>
      </div>

      <form onSubmit={handleUpload} className="space-y-6">
        
        {/* Patient Identity Engine */}
        <div className="bg-[#03090a] p-6 rounded-2xl border border-white/[0.05]">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Target Patient Identity <span className="text-teal-400">*</span>
          </label>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-500" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (selectedPatientId) setSelectedPatientId("");
              }}
              placeholder="Search by patient name or email..."
              className="w-full bg-[#051316] border border-white/[0.05] rounded-xl pl-11 pr-12 py-3 text-sm font-medium text-slate-200 focus:outline-none focus:border-teal-500/50"
              autoComplete="off"
              required
            />

            {isSearching && (
              <div className="absolute right-4 top-3.5">
                <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
              </div>
            )}

            {searchResults.length > 0 && (
              <ul className="absolute z-20 w-full bg-[#051316] border border-white/[0.1] rounded-xl shadow-2xl mt-2 max-h-60 overflow-y-auto divide-y divide-white/[0.05]">
                {searchResults.map((patient) => (
                  <li
                    key={patient._id}
                    onClick={() => handleSelectPatient(patient)}
                    className="p-3 hover:bg-white/[0.05] cursor-pointer transition-colors flex flex-col"
                  >
                    <span className="font-medium text-slate-200">
                      {patient.fullName}
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5">
                      {patient.email} {patient.phone ? `| Ph: ${patient.phone}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className={`text-xs mt-3 flex items-center gap-1 ${selectedPatientId ? "text-teal-400" : "text-slate-500"}`}>
            {selectedPatientId ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                Patient identity verified and locked.
              </>
            ) : (
              "Please search and select a verified patient profile from the list."
            )}
          </p>
        </div>

        {/* Secure Dropzone Area */}
        <div className="bg-[#03090a] p-8 rounded-2xl border border-white/[0.05] flex flex-col items-center justify-center text-center transition-colors">
          <div className="w-16 h-16 bg-[#051316] border border-white/[0.05] rounded-xl flex items-center justify-center mb-4">
             <UploadCloud className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-slate-200 mb-1">Select Medical Files</h3>
          <p className="text-sm text-slate-400 mb-6">
            Supported formats: PDF, PNG, JPG (Max 5 files)
          </p>
          
          <label className="cursor-pointer bg-[#051316] hover:bg-white/[0.05] px-6 py-3 border border-white/[0.1] rounded-xl text-sm font-medium text-slate-200 transition-colors">
            Browse Files
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*, .pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {selectedFiles.length > 0 && (
            <div className="mt-8 w-full max-w-md text-left bg-[#051316] p-4 rounded-xl border border-white/[0.05]">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                Staged Files ({selectedFiles.length})
              </h4>
              <ul className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isUploading}
            className="px-6 py-3 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-semibold rounded-xl transition-colors text-sm flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading to Vault...
              </>
            ) : (
              <>
                Confirm Upload
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportManager;