import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSystemUsers,
  changeUserStatus,
  updateFilters,
} from "../slices/userGovernanceSlice";

function UserStatusManager() {
  const dispatch = useDispatch();

  // গ্লোবাল মেমরি এক্সট্র্যাকশন
  const { usersList, paginationMeta, filters, isLoadingUsers } = useSelector(
    (state) => state.userGovernance,
  );

  // লোকাল মেমরি
  const [localSearch, setLocalSearch] = useState(filters.search);

  // ১. দ্য ডিবাউন্স ইঞ্জিন (Network Shield)
  useEffect(() => {
    const timer = setTimeout(() => {
      // অযথাই প্রথমবার রেন্ডার হওয়া ঠেকাতে এই কন্ডিশনটি জরুরি
      if (filters.search !== localSearch) {
        dispatch(updateFilters({ search: localSearch }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, dispatch, filters.search]);

  // ২. দ্য রিঅ্যাক্টিভ অবসার্ভার (The Observer)
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
  }, [
    dispatch,
    paginationMeta.currentPage,
    filters.role,
    filters.status,
    filters.search,
  ]);

  // ৩. ইভেন্ট ডেলিগেশন (Action Handlers)
  const handleSearch = (e) => {
    setLocalSearch(e.target.value);
  };

  const handleFilterChange = (e) => {
    dispatch(updateFilters({ [e.target.name]: e.target.value }));
  };

  const handleStatusToggle = (userId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    dispatch(changeUserStatus({ userId, status: newStatus }));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* টপ কন্ট্রোল প্যানেল (Search & Filters) */}
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* সার্চ ইনপুট (SVG Removed & Padding Adjusted) */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={localSearch}
            onChange={handleSearch}
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
          />
        </div>

        {/* ফিল্টার ড্রপডাউনস */}
        <div className="flex items-center gap-3">
          <select
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
          >
            <option value="">All Roles</option>
            <option value="PATIENT">Patient</option>
            <option value="DOCTOR">Doctor</option>
            <option value="ADMIN">Admin</option>
          </select>

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>
      </div>

      {/* দ্য ডেটা টেবিল */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                User Info
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Role
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Registered
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* লোডিং স্টেট */}
            {isLoadingUsers ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-10 text-center text-gray-500"
                >
                  <div className="flex justify-center items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </td>
              </tr>
            ) : usersList.length === 0 ? (
              // এম্পটি স্টেট
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-10 text-center text-gray-500"
                >
                  No users found matching your criteria.
                </td>
              </tr>
            ) : (
              // একচুয়াল ডেটা রেন্ডারিং
              usersList.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* অপটিমিস্টিক টগল বাটন */}
                    <button
                      onClick={() => handleStatusToggle(user._id, user.status)}
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        user.status === "ACTIVE"
                          ? "bg-green-500"
                          : "bg-gray-300"
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

      {/* প্যাগিনেশন ফুটার */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <span className="text-sm text-gray-700">
          Showing page{" "}
          <span className="font-semibold">{paginationMeta.currentPage}</span> of{" "}
          <span className="font-semibold">{paginationMeta.totalPages}</span>
        </span>
        <div className="space-x-2">
          <button
            disabled={!paginationMeta.hasPrevPage}
            className="btn-secondary text-sm disabled:opacity-50 px-3 py-1 bg-white border border-gray-300 rounded-md"
          >
            Previous
          </button>
          <button
            disabled={!paginationMeta.hasNextPage}
            className="btn-secondary text-sm disabled:opacity-50 px-3 py-1 bg-white border border-gray-300 rounded-md"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserStatusManager;
