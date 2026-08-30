import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange, totalItems = 0, itemsPerPage = 50 }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const pages = getPageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 transition-all duration-300">
      {/* Left: Page summary text */}
      {totalItems > 0 && (
        <div className="text-xs text-slate-400 font-medium text-center sm:text-left shrink-0">
          Showing <span className="text-slate-200 font-bold">{startItem}–{endItem}</span> of <span className="text-slate-200 font-bold">{totalItems}</span> books
        </div>
      )}

      {/* Center & Right: Navigation Buttons Container */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 sm:px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer select-none ${
            currentPage === 1
              ? "border-slate-800/80 text-slate-600 bg-slate-950/40 cursor-not-allowed opacity-50"
              : "border-slate-700/80 text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-600/10 bg-slate-950/80 shadow-sm active:scale-95"
          }`}
        >
          <ChevronLeft size={15} />
          <span className="font-semibold">Previous</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 sm:gap-1.5 px-1 py-0.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
          {pages.map((page, idx) => {
            if (page === "...") {
              return (
                <span key={`dots-${idx}`} className="px-1.5 sm:px-2 text-xs font-bold text-slate-500 select-none">
                  ...
                </span>
              );
            }

            const isCurrent = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all duration-200 cursor-pointer select-none ${
                  isCurrent
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 sm:px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer select-none ${
            currentPage === totalPages
              ? "border-slate-800/80 text-slate-600 bg-slate-950/40 cursor-not-allowed opacity-50"
              : "border-slate-700/80 text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-600/10 bg-slate-950/80 shadow-sm active:scale-95"
          }`}
        >
          <span className="font-semibold">Next</span>
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
