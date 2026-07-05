import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchDoctorList, clearDoctorsList } from "./slices/doctorListSlice";
import FilterBar from "./components/FilterBar";
import PaginationController from "../../components/PaginationController"
import { useNavigate } from "react-router-dom";

function GetDoctorList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { doctors, pagination, status, error } = useSelector(
    (state) => state.doctorList,
  );

  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";
  const specialization = searchParams.get("specialization") || "";
  const search = searchParams.get("search") || "";

  useEffect(() => {
    dispatch(fetchDoctorList({ page, limit, specialization, search }));

    return () => {
      dispatch(clearDoctorsList());
    };
  }, [dispatch, page, limit, specialization, search]);

  const handleFilterChange = (newFilters) => {
    const params = new URLSearchParams(searchParams);

    Object.keys(newFilters).forEach((key) => {
      const value = newFilters[key];
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    params.set("page", "1");
    setSearchParams(params);
  };

  const handlePageChange = (newPageNumber) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPageNumber.toString());
    setSearchParams(params);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6">
      <FilterBar
        currentSearch={search}
        currentSpecialization={specialization}
        onFilterChange={handleFilterChange}
      />

      {status === "loading" && (
        <div className="text-center py-10 font-semibold text-gray-500">
          Loading doctors...
        </div>
      )}

      {status === "failed" && (
        <div className="text-center py-10 font-semibold text-red-600">
          Error: {error}
        </div>
      )}

      {status === "succeeded" && doctors.length === 0 && (
        <div className="text-center py-10 font-semibold text-gray-500">
          No doctors found matching your criteria.
        </div>
      )}

      {status === "succeeded" && doctors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor._id}
              className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={
                      doctor.User_details?.profileImage ||
                      "https://via.placeholder.com/150"
                    }
                    alt={doctor.User_details?.name}
                    className="w-16 h-16 rounded-full object-cover border border-gray-100"
                  />
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {doctor.User_details?.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">
                      {doctor.qualifications?.join(", ")}
                    </p>
                  </div>
                </div>

                <div className="mb-4 text-sm text-gray-600 space-y-1.5">
                  {/* Update: BM&DC Registration Number UI-তে অ্যাড করা হলো */}
                  <p>
                    <span className="font-semibold">BM&DC Reg No:</span>{" "}
                    <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-800">
                      {doctor.bmdcRegistration || "N/A"}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold">Experience:</span>{" "}
                    {doctor.experienceYears} Years
                  </p>
                  <p>
                    <span className="font-semibold text-blue-600">
                      Consultation Fee:
                    </span>{" "}
                    ৳{doctor.consultationFee}
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  navigate(`/patient/book-appointment?doctorId=${doctor._id}`)
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors mt-2"
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <PaginationController
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

export default GetDoctorList;
