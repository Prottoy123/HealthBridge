import React from "react";
import { Filter, Search } from "lucide-react";
import { MEDICAL_DOMAINS } from "../../../constants/medicalDomains";

function FilterBar({ currentSearch, currentSpecialization, onFilterChange }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({
      search: name === "search" ? value : currentSearch,
      specialization: name === "specialization" ? value : currentSpecialization,
    });
  };

  const handleClear = () => {
    onFilterChange({ search: "", specialization: "" });
  };

  const specializations = MEDICAL_DOMAINS;

  return (
    <div className="bg-[#051316] p-6 rounded-3xl shadow-sm border border-white/[0.05] relative overflow-hidden h-full flex flex-col group">
      
      <h2 className="text-xl font-bold text-slate-200 tracking-tight mb-8 relative z-10 flex items-center gap-3">
         <div className="w-8 h-8 bg-teal-500/10 rounded-lg flex items-center justify-center border border-teal-500/20">
            <Filter className="w-4 h-4 text-teal-400" />
         </div>
         Search Filters
      </h2>

      <div className="space-y-6 flex-1 relative z-10 flex flex-col min-h-0">
         {/* Search Input Box */}
         <div className="w-full">
           <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
             Doctor Identity
           </label>
           <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                 <Search className="w-4 h-4" />
              </div>
              <input
               type="text"
               name="search"
               value={currentSearch}
               onChange={handleChange}
               placeholder="Enter name..."
               className="w-full pl-11 pr-4 py-3.5 bg-[#03090a] border border-white/[0.05] rounded-xl focus:outline-none focus:border-teal-500/50 text-sm text-slate-200 font-medium placeholder-slate-600 transition-colors"
             />
           </div>
         </div>

         {/* Specialization Dropdown */}
         <div className="w-full flex-1 flex flex-col min-h-0">
           <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 shrink-0">
             Medical Domain
           </label>
           <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2 flex-1">
              <label className={`block p-3 rounded-xl border transition-colors cursor-pointer ${currentSpecialization === "" ? "bg-teal-500/10 border-teal-500/30 text-teal-400" : "bg-[#03090a] border-white/[0.05] text-slate-400 hover:bg-white/[0.05]"}`}>
                 <input type="radio" name="specialization" value="" checked={currentSpecialization === ""} onChange={handleChange} className="hidden" />
                 <span className="text-sm font-semibold tracking-wide">All Domains</span>
              </label>
              {specializations.map((spec) => (
                 <label key={spec} className={`block p-3 rounded-xl border transition-colors cursor-pointer ${currentSpecialization === spec ? "bg-teal-500/10 border-teal-500/30 text-teal-400" : "bg-[#03090a] border-white/[0.05] text-slate-400 hover:bg-white/[0.05]"}`}>
                    <input type="radio" name="specialization" value={spec} checked={currentSpecialization === spec} onChange={handleChange} className="hidden" />
                    <span className="text-sm font-semibold tracking-wide">{spec}</span>
                 </label>
              ))}
           </div>
         </div>
      </div>

      {/* Clear Filters Button */}
      <div className="mt-8 shrink-0 relative z-10 border-t border-white/[0.05] pt-6">
         <button
           onClick={handleClear}
           disabled={!currentSearch && !currentSpecialization}
           className={`w-full px-6 py-3.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 ${
             currentSearch || currentSpecialization
               ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20"
               : "bg-[#03090a] text-slate-600 border border-white/[0.05] cursor-not-allowed"
           }`}
         >
           Reset Parameters
         </button>
      </div>
    </div>
  );
}

export default FilterBar;
