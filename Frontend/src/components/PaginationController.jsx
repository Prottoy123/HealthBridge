import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function PaginationController({ currentPage, totalPages, onPageChange }) {
  const current = Number(currentPage) || 1;
  const total = Number(totalPages) || 0;

  if (total <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-6 py-4">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(current - 1)}
        disabled={current === 1}
        className="flex items-center gap-1 px-4 py-2 bg-[#051316] border border-white/[0.05] rounded-xl text-sm font-medium text-slate-300 hover:bg-white/[0.05] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {Array.from({ length: total }, (_, index) => {
          const pageNum = index + 1;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-3.5 py-2 border rounded-xl text-sm font-semibold transition-colors ${
                current === pageNum
                  ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                  : "bg-[#051316] text-slate-400 hover:bg-white/[0.05] border-white/[0.05]"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(current + 1)}
        disabled={current === total}
        className="flex items-center gap-1 px-4 py-2 bg-[#051316] border border-white/[0.05] rounded-xl text-sm font-medium text-slate-300 hover:bg-white/[0.05] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default PaginationController;
