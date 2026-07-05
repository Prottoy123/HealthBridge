import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPendingDoctors,
  verifyDoctorAction,
  clearAdminState,
} from "./slices/adminSlice";
import PaginationController from "../../components/PaginationController";
import VerificationModal from "./component/VerificationModal";

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
    <div className="w-full bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Pending Verifications
      </h2>

      {status === "loading" && (
        <div className="text-center py-8 text-gray-500 font-medium">
          Loading pending doctors...
        </div>
      )}

      {status === "failed" && (
        <div className="text-center py-8 text-red-500 font-medium">
          Error: {error}
        </div>
      )}

      {status === "succeeded" && pendingDoctors.length === 0 && (
        <div className="text-center py-8 text-gray-500 font-medium">
          No pending doctors found. The queue is clear!
        </div>
      )}

      {status === "succeeded" && pendingDoctors.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b">
                <th className="p-4 font-semibold">Doctor Name</th>
                <th className="p-4 font-semibold">Email</th>
                {/* Update: BMDC Column Added */}
                <th className="p-4 font-semibold">BM&DC Reg No</th>
                <th className="p-4 font-semibold">Specialization</th>
                <th className="p-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingDoctors.map((doctor) => (
                <tr
                  key={doctor._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 font-medium text-gray-800">
                    {doctor.User_details?.fullName}
                  </td>
                  <td className="p-4 text-gray-600">
                    {doctor.User_details?.email}
                  </td>
                  {/* Update: BMDC Data Added with fallback */}
                  <td className="p-4 text-gray-800 font-mono bg-gray-50">
                    {doctor.bmdcRegistration || "N/A"}
                  </td>
                  <td className="p-4 text-gray-600">{doctor.specialization}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleReviewClick(doctor)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
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

      <div className="mt-6">
        <PaginationController
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>

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
