import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, maxWidth = "max-w-5xl", children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-full ${maxWidth} overflow-hidden transform transition-all scale-100 my-auto max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className="bg-slate-900 px-5 sm:px-6 py-4 flex items-center justify-between text-white shrink-0 border-b border-slate-800">
          <h3 className="font-bold text-sm sm:text-base tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}


