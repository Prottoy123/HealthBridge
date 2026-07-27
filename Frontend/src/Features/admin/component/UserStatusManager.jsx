import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSystemUsers,
  changeUserStatus,
  updateFilters,
} from "../slices/userGovernanceSlice";
import { Search, Shield, Filter, Loader2, UserX } from "lucide-react";

function UserStatusManager() {
  const dispatch = useDispatch();

  const { usersList, paginationMeta, filters, isLoadingUsers } = useSelector(
    (state) => state.userGovernance,
  );

  const [localSearch, setLocalSearch] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.search !== localSearch) {
        dispatch(updateFilters({ search: localSearch }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, dispatch, filters.search]);

  useEffect(() => {
    dispatch(
      fetchSystemUsers({
        page: paginationMeta.currentPage,
        limit: 10,
        search: filters.search,
        role: filters.role,
        status: filters.status,
      }),
    );
  }, [dispatch, paginationMeta.currentPage, filters.role, filters.status, filters.search]);

  const handleSearch = (e) => setLocalSearch(e.target.value);
  const handleFilterChange = (e) => dispatch(updateFilters({ [e.target.name]: e.target.value }));

  const handleStatusToggle = (userId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    dispatch(changeUserStatus({ userId, status: newStatus }));
  };

  return (
    <div className="bg-[#051316] rounded-2xl border border-white/[0.05] shadow-sm overflow-hidden flex flex-col h-full">
      {/* Top Control Panel (Search & Filters) */}
      <div className="p-4 sm:p-6 border-b border-white/[0.05] bg-[#03090a] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Search Engine */}
        <div className="relative w-full lg:w-96 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={localSearch}
            onChange={handleSearch}
            className="w-full bg-[#051316] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
          />
        </div>

        {/* Filter Engine */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-40">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Shield className="w-4 h-4 text-slate-500" />
            </div>
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="w-full bg-[#051316] border border-white/[0.05] rounded-xl pl-9 pr-8 py-2.5 text-sm font-medium text-slate-300 focus:outline-none focus:border-teal-500/50 appearance-none"
            >
              <option value="" className="bg-slate-800 text-white">All Roles</option>
              <option value="PATIENT" className="bg-slate-800 text-white">Patient</option>
              <option value="DOCTOR" className="bg-slate-800 text-white">Doctor</option>
              <option value="ADMIN" className="bg-slate-800 text-white">Admin</option>
              <option value="STAFF" className="bg-slate-800 text-white">Staff</option>
            </select>
          </div>

          <div className="relative flex-1 lg:w-40">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="w-4 h-4 text-slate-500" />
            </div>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full bg-[#051316] border border-white/[0.05] rounded-xl pl-9 pr-8 py-2.5 text-sm font-medium text-slate-300 focus:outline-none focus:border-teal-500/50 appearance-none"
            >
              <option value="" className="bg-slate-800 text-white">All Status</option>
              <option value="ACTIVE" className="bg-slate-800 text-white">Active</option>
              <option value="BLOCKED" className="bg-slate-800 text-white">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      {/* The Data Grid */}
      <div className="overflow-x-auto custom-scrollbar flex-1">
        <table className="w-full min-w-[700px] text-left border-collapse">
          <thead>
            <tr className="bg-[#03090a] text-slate-400 text-xs uppercase tracking-wider border-b border-white/[0.05]">
              <th className="px-6 py-4 font-semibold whitespace-nowrap">User Info</th>
              <th className="px-6 py-4 font-semibold whitespace-nowrap">Role</th>
              <th className="px-6 py-4 font-semibold whitespace-nowrap">Registered</th>
              <th className="px-6 py-4 font-semibold whitespace-nowrap">Status</th>
              <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Access Toggle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {isLoadingUsers ? (
              <tr>
                <td colSpan="5" className="px-6 py-16 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-500 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-400">Syncing identity database...</p>
                </td>
              </tr>
            ) : usersList.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-16 text-center text-slate-400">
                  <UserX className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                  <p className="font-medium">No users found matching criteria.</p>
                </td>
              </tr>
            ) : (
              usersList.map((user) => (
                <tr key={user._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-teal-500/10 border border-teal-500/20 rounded-full flex items-center justify-center text-teal-400 font-bold">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-200">
                          {user.fullName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white/[0.05] text-slate-300 border border-white/[0.1]">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${
                        user.status === "ACTIVE"
                          ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleStatusToggle(user._id, user.status)}
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                        user.status === "ACTIVE"
                          ? "bg-teal-500"
                          : "bg-slate-600"
                      }`}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                          user.status === "ACTIVE"
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 sm:px-6 py-4 bg-[#03090a] border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-sm text-slate-400">
          Showing page <span className="font-semibold text-slate-200">{paginationMeta.currentPage}</span> of{" "}
          <span className="font-semibold text-slate-200">{paginationMeta.totalPages}</span>
        </span>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            disabled={!paginationMeta.hasPrevPage}
            onClick={() => dispatch(fetchSystemUsers({ ...filters, page: paginationMeta.currentPage - 1 }))}
            className="flex-1 sm:flex-none text-sm disabled:opacity-50 px-4 py-2 bg-[#051316] hover:bg-white/[0.05] border border-white/[0.1] rounded-lg transition-colors text-slate-300 font-medium"
          >
            Previous
          </button>
          <button
            disabled={!paginationMeta.hasNextPage}
            onClick={() => dispatch(fetchSystemUsers({ ...filters, page: paginationMeta.currentPage + 1 }))}
            className="flex-1 sm:flex-none text-sm disabled:opacity-50 px-4 py-2 bg-[#051316] hover:bg-white/[0.05] border border-white/[0.1] rounded-lg transition-colors text-slate-300 font-medium"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserStatusManager;
