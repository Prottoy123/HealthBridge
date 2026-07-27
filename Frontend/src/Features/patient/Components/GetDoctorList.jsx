import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchDoctorList, clearDoctorsList } from "../Slices/doctorListSlice";
import FilterBar from "./FilterBar";
import PaginationController from "../../../components/PaginationController";
import { Loader2, SearchX, UserRound, ArrowRight, ShieldCheck, Stethoscope } from "lucide-react";

function GetDoctorList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { doctors, pagination, status, error } = useSelector(
    (state) => state.doctorList,
  );

  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "9"; // 3x3 grid
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
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 animate-in fade-in duration-700 flex flex-col md:flex-row gap-6 h-full min-h-[calc(100vh-8rem)]">
      
      {/* 
        ========================================================================
        LEFT SIDEBAR: FILTER BAR
        ========================================================================
      */}
      <div className="w-full md:w-80 shrink-0 flex flex-col h-full sticky top-24">
        <FilterBar
          currentSearch={search}
          currentSpecialization={specialization}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* 
        ========================================================================
        RIGHT PANE: DOCTOR GRID
        ========================================================================
      */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <div className="mb-6 relative z-10 bg-[#051316] p-6 sm:p-8 rounded-3xl border border-white/[0.05] shadow-sm overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
             <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center border border-teal-500/20 shadow-sm">
                 <Stethoscope className="w-6 h-6 text-teal-400" />
               </div>
               <div>
                  <h1 className="text-2xl font-bold text-slate-200 tracking-tight flex items-center gap-3">
                     Specialist Directory
                  </h1>
                  <p className="text-xs text-teal-400 font-semibold uppercase tracking-widest mt-1">
                     {pagination.totalDocuments || 0} Network Professionals Found
                  </p>
               </div>
             </div>
             {status === "loading" && (
                <div className="flex items-center gap-3 bg-[#03090a] px-4 py-2 rounded-xl border border-white/[0.05]">
                   <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 animate-pulse">Syncing...</span>
                </div>
             )}
          </div>
        </div>

        {/* Dynamic State Management Area */}
        <div className="flex-1 relative">
          
          {status === "failed" && (
            <div className="bg-[#051316] border border-rose-500/20 text-rose-400 p-8 rounded-3xl text-center max-w-lg mx-auto mt-10">
              <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-rose-500" />
              <h3 className="font-bold text-xl mb-2">Network Error</h3>
              <p className="text-sm font-medium opacity-80">{error || "Failed to fetch the directory."}</p>
            </div>
          )}

          {status === "succeeded" && doctors.length === 0 && (
            <div className="text-center py-24 bg-[#051316] border border-white/[0.05] rounded-3xl mt-2">
              <div className="w-16 h-16 bg-[#03090a] rounded-full flex items-center justify-center mx-auto mb-6 border border-white/[0.05]">
                 <SearchX className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="font-bold text-slate-300 text-xl tracking-tight mb-2">No Specialists Found</h3>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest max-w-sm mx-auto">Adjust your search parameters or select a different medical domain.</p>
            </div>
          )}

          {status === "succeeded" && doctors.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-2 pb-6">
              {doctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className="bg-[#051316] group rounded-3xl border border-white/[0.05] hover:border-teal-500/30 transition-colors flex flex-col relative overflow-hidden min-h-[340px]"
                >
                  {/* Doctor Profile Banner */}
                  <div className="p-6 relative z-10 flex-1 flex flex-col justify-between">
                    
                    <div className="flex items-start justify-between">
                       <div className="relative">
                          {doctor.User_details?.profileImage ? (
                            <img
                              src={doctor.User_details.profileImage}
                              alt={doctor.User_details?.name}
                              className="w-14 h-14 rounded-xl object-cover border border-white/[0.1] shadow-sm"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-[#03090a] border border-white/[0.05] flex items-center justify-center">
                              <UserRound className="w-6 h-6 text-slate-500" />
                            </div>
                          )}
                           <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-teal-500 border-2 border-[#051316] rounded-full"></div>
                       </div>
                       
                       <div className="bg-[#03090a] px-3 py-1.5 rounded-lg border border-white/[0.05]">
                          <span className="text-teal-400 font-bold uppercase tracking-widest text-[10px]">
                             ৳{doctor.consultationFee} <span className="text-slate-500">/ visit</span>
                          </span>
                       </div>
                    </div>

                    <div className="mt-4 flex-1">
                      <h3 className="font-bold text-lg text-slate-200 tracking-tight group-hover:text-teal-400 transition-colors truncate">
                        {doctor.User_details?.name}
                      </h3>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1 line-clamp-2 leading-relaxed h-8">
                        {doctor.qualifications?.join(", ") || "Medical Professional"}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="mt-4 grid grid-cols-2 gap-3 bg-[#03090a] p-3 rounded-xl border border-white/[0.05]">
                      <div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Experience</p>
                        <p className="font-bold text-slate-300 text-sm mt-0.5">{doctor.experienceYears} Yrs</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">BMDC Reg</p>
                        <p className="font-mono text-slate-300 text-xs font-bold mt-0.5 truncate">{doctor.bmdcRegistration || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="p-2 shrink-0 relative z-10">
                     <button
                       onClick={() => navigate(`/patient/book-appointment?doctorId=${doctor._id}`)}
                       className="w-full bg-[#03090a] hover:bg-teal-500 text-teal-400 hover:text-slate-900 font-bold py-3.5 px-4 rounded-2xl transition-colors uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 border border-white/[0.05] group-hover:border-teal-500/20"
                     >
                       Schedule Appointment
                       <ArrowRight className="w-4 h-4" />
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shared Pagination Component */}
        <div className="mt-6 dark-mode-pagination-wrapper shrink-0">
          <PaginationController
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
        
      </div>
    </div>
  );
}

export default GetDoctorList;
