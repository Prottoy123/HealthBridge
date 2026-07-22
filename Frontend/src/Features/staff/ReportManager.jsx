import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../../services/api";

// Importing the required thunks from staffSlice
import {
  uploadPatientReport,
} from "../staff/Slices/staffSlice";

const ReportManager = () => {
  const dispatch = useDispatch();

  //Local States for Search Engine
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Local States Upload
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Debounced Search Effect
  useEffect(() => {
    // 1. If less than 2 characters, clear results to save API calls
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    // 2. Debounce Timer (Waits 500ms after user stops typing)
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

    // 3. Cleanup function to cancel the previous timer if user keeps typing
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // File Selection Protocol
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error("You can only upload a maximum of 5 files.");
      return;
    }
    setSelectedFiles(files);
  };

  // Upload Execution Protocol
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

      // Post-Upload System Reset
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

  // --- Search Result Selection Handler ---
  const handleSelectPatient = (patient) => {
    setSelectedPatientId(patient._id);
    setSearchTerm(patient.fullName); // Set input text to patient name
    setSearchResults([]); // Close the dropdown popup
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl border border-gray-200 shadow-sm mt-8">
      <div className="mb-8 border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Medical Records Vault
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Upload and link physical lab reports directly to a patient's global
          health profile.
        </p>
      </div>

      <form onSubmit={handleUpload} className="space-y-6">
        {/* --- Advanced Patient Search Engine --- */}
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <label className="block text-sm font-bold text-blue-900 mb-2">
            Search Patient Identity <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                // If user alters the name, clear the selected ID to enforce re-selection
                if (selectedPatientId) setSelectedPatientId("");
              }}
              placeholder="Type name or email to search..."
              className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-gray-700 shadow-sm"
              autoComplete="off"
              required
            />

            {/* Loading Indicator */}
            {isSearching && (
              <div className="absolute right-4 top-3.5 text-blue-500 text-sm font-medium">
                Searching...
              </div>
            )}

            {/* Search Results Dropdown Popup */}
            {searchResults.length > 0 && (
              <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                {searchResults.map((patient) => (
                  <li
                    key={patient._id}
                    onClick={() => handleSelectPatient(patient)}
                    className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors flex flex-col"
                  >
                    <span className="font-bold text-gray-800">
                      {patient.fullName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {patient.email}{" "}
                      {patient.phone ? `| Ph: ${patient.phone}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-xs text-blue-600 mt-2">
            {selectedPatientId
              ? "✅ Patient verified and locked for record upload."
              : "Search by name or email, then click on the correct profile from the list."}
          </p>
        </div>

        {/* --- Secure Dropzone Area --- */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors">
          <label className="cursor-pointer bg-white px-6 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
            Browse Medical Files
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*, .pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <p className="mt-3 text-xs font-medium text-gray-500">
            Supported formats: PDF, PNG, JPG (Max 5 files)
          </p>

          {/* Staged Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="mt-6 w-full text-left bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-bold text-gray-800 mb-3">
                Staged Files:
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 font-medium">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="truncate">{file.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* --- Transaction Submit Action --- */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={
              isUploading || selectedFiles.length === 0 || !selectedPatientId
            }
            className={`px-8 py-3 rounded-lg font-bold text-white transition-all shadow-md ${
              isUploading || selectedFiles.length === 0 || !selectedPatientId
                ? "bg-purple-300 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {isUploading ? "Uploading to Secure Vault..." : "Confirm Upload"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportManager;