import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function AdminLayout({ children }) {
  const [quickActionTrigger, setQuickActionTrigger] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleQuickAction = (actionName) => {
    setQuickActionTrigger(actionName);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans antialiased overflow-hidden relative">
      {/* Sidebar navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onQuickAction={handleQuickAction}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto no-scrollbar">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-4">
          {children || <Outlet context={{ quickActionTrigger, setQuickActionTrigger }} />}
        </main>
      </div>
    </div>
  );
}

