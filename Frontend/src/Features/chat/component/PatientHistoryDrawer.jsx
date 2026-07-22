import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearPatientHistory,
  fetchPatientPrescriptions,
  fetchPatientRecords,
} from "../../doctor/Slices/PatientHistorySlice";

const PatientHistoryDrawer = ({ isOpen, onClose, patientId }) => {
  const dispatch = useDispatch();

  const { records, isRecordsLoading, prescriptions, isPrescriptionsLoading } =
    useSelector((state) => state.patientHistory);

  const [activeTab, setActiveTab] = useState("RECORDS");

  // দ্য ডেটা হাইড্রেটর
  useEffect(() => {
    if (isOpen && patientId) {
      if (activeTab === "RECORDS") {
        dispatch(fetchPatientRecords({ patientId }));
      } else {
        dispatch(fetchPatientPrescriptions({ patientId }));
      }
    }
  }, [dispatch, activeTab, isOpen, patientId]);

  // দ্য ক্লিনআপ ইঞ্জিন
  useEffect(() => {
    if (!isOpen) {
      dispatch(clearPatientHistory());
      setActiveTab("RECORDS");
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* ওভারলে */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* ড্রয়ার প্যানেল */}
      <div className="relative w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col animate-slide-in-right z-50">
        {/* হেডার */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Patient Vault</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
          >
            ✕
          </button>
        </div>

        {/* ট্যাব কন্ট্রোলার */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => handleTabChange("RECORDS")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === "RECORDS"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Medical Records
          </button>
          <button
            onClick={() => handleTabChange("PRESCRIPTIONS")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === "PRESCRIPTIONS"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Prescriptions
          </button>
        </div>

        {/* কন্টেন্ট এরিয়া */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {/* রেকর্ডস ভিউ (পিডিএফ ও অন্যান্য রিপোর্ট) */}
          {activeTab === "RECORDS" && (
            <div>
              {isRecordsLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : records?.length === 0 ? (
                <div className="text-center text-slate-500 py-10">
                  No medical records found.
                </div>
              ) : (
                <div className="space-y-4">
                  {records?.map((record) => (
                    <div
                      key={record._id}
                      className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col group hover:border-blue-300 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {/* পিডিএফ আইকন */}
                          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500 shrink-0">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              ></path>
                            </svg>
                          </div>
                          <div>
                            {/* ডাটাবেসের recordType */}
                            <h4 className="font-bold text-slate-700 text-sm">
                              {record.recordType.replace("_", " ")}
                            </h4>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {new Date(record.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <a
                          href={record.fileUrl} // ডাটাবেসের fileUrl
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg group-hover:bg-blue-600 group-hover:text-white transition"
                        >
                          View
                        </a>
                      </div>

                      {/* ডাটাবেসের description */}
                      {record.description && (
                        <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                          <span className="font-semibold">Note:</span>{" "}
                          {record.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* প্রেসক্রিপশন ভিউ (ইমেজ রেন্ডারিং) */}
          {activeTab === "PRESCRIPTIONS" && (
            <div>
              {isPrescriptionsLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : prescriptions?.length === 0 ? (
                <div className="text-center text-slate-500 py-10">
                  No prescriptions uploaded.
                </div>
              ) : (
                <div className="space-y-6">
                  {prescriptions?.map((rx) => (
                    <div
                      key={rx._id}
                      className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <div className="flex justify-between items-start">
                          <div>
                            {/* ডাটাবেসের title ও doctorName */}
                            <h3 className="font-bold text-slate-800 text-sm">
                              {rx.title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                              By: {rx.doctorName}
                            </p>
                          </div>
                          <span className="text-xs font-semibold text-slate-600 bg-slate-200 px-2 py-1 rounded">
                            {new Date(rx.prescriptionDate).toLocaleDateString()}
                          </span>
                        </div>

                        {/* ডাটাবেসের note */}
                        {rx.note && (
                          <p className="text-xs text-slate-600 mt-2 italic">
                            "{rx.note}"
                          </p>
                        )}
                      </div>

                      {/* ডাটাবেসের fileUrl (Image) */}
                      <div className="p-2 cursor-pointer bg-slate-100">
                        <a href={rx.fileUrl} target="_blank" rel="noreferrer">
                          <img
                            src={rx.fileUrl}
                            alt={rx.title}
                            className="w-full h-48 object-cover rounded shadow-sm hover:opacity-90 transition"
                            loading="lazy"
                          />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientHistoryDrawer;
