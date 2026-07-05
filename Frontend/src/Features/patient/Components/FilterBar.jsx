import React from "react";

function FilterBar({ currentSearch, currentSpecialization, onFilterChange }) {
  // input field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({
      search: name === "search" ? value : currentSearch,
      specialization: name === "specialization" ? value : currentSpecialization,
    });
  };

  // filter reset or clear the logic 
  const handleClear = () => {
    onFilterChange({ search: "", specialization: "" });
  };

  // dummy specialization data, যা পরে API থেকে ডাইনামিকভাবে ফেচ করা যেতে পারে
  const specializations = [
    "Cardiology",
    "Dermatology",
    "Neurology",
    "Pediatrics",
    "Orthopedics",
    "General Medicine",
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end mb-6">
      {/* Search Input Box */}
      <div className="flex-1 w-full">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Search Doctor Name
        </label>
        <input
          type="text"
          name="search"
          value={currentSearch}
          onChange={handleChange}
          placeholder="Type doctor's name..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>

      {/* Specialization Dropdown */}
      <div className="w-full md:w-64">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Specialization
        </label>
        <select
          name="specialization"
          value={currentSpecialization}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
        >
          <option value="">All Specializations</option>
          {specializations.map((spec) => (
            <option key={spec} value={spec}>
              {spec}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters Button */}
      {(currentSearch || currentSpecialization) && (
        <button
          onClick={handleClear}
          className="w-full md:w-auto px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors h-[38px]"
        >
          Clear
        </button>
      )}
    </div>
  );
}

export default FilterBar;
