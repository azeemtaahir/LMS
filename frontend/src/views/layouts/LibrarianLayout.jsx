import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import LibrarianSidebar from '../components/LibrarianSidebar';
import LibrarianNavbar from '../components/LibrarianNavbar';

export default function LibrarianLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-[#F4F6F9] flex font-sans text-slate-800 overflow-hidden relative">
      <LibrarianSidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <LibrarianNavbar 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}