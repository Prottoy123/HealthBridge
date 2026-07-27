import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPendingDoctors,
  verifyDoctorAction,
  clearAdminState,
} from "../slices/adminSlice";
import PaginationController from "../../../components/PaginationController";
import VerificationModal from "./VerificationModal";
import { CheckCircle, ShieldAlert, Loader2, User, Mail, FileCheck } from "lucide-react";

function PendingDoctorTable() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const { pendingDoctors, pagination, status, error } = useSelector(
    (state) => state.admin,
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";

  useEffect(() => {
    dispatch(fetchPendingDoctors({ page, limit }));

    return () => {
      dispatch(clearAdminState());
    };
  }, [dispatch, page, limit]);

  const handlePageChange = (newPageNumber) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPageNumber.toString());
    setSearchParams(params);
  };

  const handleReviewClick = (doctorObject) => {
    setSelectedDoctor(doctorObject);
    setIsModalOpen(true);
  };

  const executeVerification = () => {
    dispatch(verifyDoctorAction(selectedDoctor._id));
    setIsModalOpen(false);
    setSelectedDoctor(null);
  };

  return (
    <div className="w-full bg-[#051316] p-4 sm:p-6 rounded-2xl border border-white/[0.05] relative">
      <div className="flex items-center gap-2 mb-6">
        <ShieldAlert className="w-5 h-5 text-amber-400" />
        <h2 className="text-lg sm:text-xl font-semibold text-slate-200">
          Pending Verifications
        </h2>
      </div>

      {status === "loading" && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500 mb-4" />
          <p className="text-sm font-medium">Fetching pending approvals...</p>
        </div>
      )}

      {status === "failed" && (
        <div className="text-center py-8 text-red-400 bg-red-400/10 rounded-xl border border-red-400/20 font-medium text-sm">
          Error: {error}
        </div>
      )}

      {status === "succeeded" && pendingDoctors.length === 0 && (
        <div className="text-center py-12 text-slate-400 bg-[#03090a] rounded-xl border border-white/[0.02]">
          <CheckCircle className="w-12 h-12 mx-auto text-teal-500/50 mb-3" />
          <p className="font-medium">No pending doctors found.</p>
          <p className="text-xs text-slate-500 mt-1">The verification queue is clear!</p>
        </div>
      )}

      {status === "succeeded" && pendingDoctors.length > 0 && (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#03090a] text-slate-400 text-xs uppercase tracking-wider border-y border-white/[0.05]">
                <th className="p-4 font-semibold whitespace-nowrap"><div className="flex items-center gap-2"><User className="w-4 h-4"/> Doctor Name</div></th>
                <th className="p-4 font-semibold whitespace-nowrap"><div className="flex items-center gap-2"><Mail className="w-4 h-4"/> Email</div></th>
                <th className="p-4 font-semibold whitespace-nowrap"><div className="flex items-center gap-2"><FileCheck className="w-4 h-4"/> BM&DC Reg No</div></th>
                <th className="p-4 font-semibold whitespace-nowrap">Specialization</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {pendingDoctors.map((doctor) => (
                <tr
                  key={doctor._id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="p-4 font-medium text-slate-200 whitespace-nowrap">
                    {doctor.User_details?.fullName}
                  </td>
                  <td className="p-4 text-slate-400 text-sm whitespace-nowrap">
                    {doctor.User_details?.email}
                  </td>
                  <td className="p-4 text-teal-400 font-mono text-sm whitespace-nowrap">
                    {doctor.bmdcRegistration || "N/A"}
                  </td>
                  <td className="p-4 text-slate-400 text-sm whitespace-nowrap">{doctor.specialization}</td>
                  <td className="p-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => handleReviewClick(doctor)}
                      className="bg-teal-500/10 hover:bg-teal-500 hover:text-slate-900 text-teal-400 border border-teal-500/20 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                    >
                      Review Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {status === "succeeded" && pendingDoctors.length > 0 && (
        <div className="mt-6">
          <PaginationController
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <VerificationModal
        isOpen={isModalOpen}
        doctor={selectedDoctor}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDoctor(null);
        }}
        onVerify={executeVerification}
      />
    </div>
  );
}

export default PendingDoctorTable;
