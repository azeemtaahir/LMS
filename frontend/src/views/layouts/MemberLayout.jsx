import { useState } from "react";
import { Outlet } from "react-router-dom";
import MemberSidebar from "../components/MemberSidebar";
import Navbar from "../components/Navbar";

export default function MemberLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 font-sans antialiased overflow-hidden relative">
      {/* Member Sidebar Navigation Slider */}
      <MemberSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden no-scrollbar">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
