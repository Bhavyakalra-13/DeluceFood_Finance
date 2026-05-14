"use client";
import React, { useState, ReactNode } from "react";
import Sidebar from "@components/Sidebar";
import Header from "@components/Header";

export default function DefaultLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      {/* <!-- ===== Page Wrapper Start ===== --> */}
      <div className="min-h-screen relative overflow-x-hidden">
        {/* <!-- ===== Sidebar Start ===== --> */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {/* <!-- ===== Sidebar End ===== --> */}

        {/* <!-- ===== Content Area Start ===== --> */}
        <div className={`relative flex flex-1 flex-col transition-all duration-300 min-w-0 ${sidebarOpen ? 'lg:ml-72.5' : 'lg:ml-72.5'}`}>
          {/* <!-- ===== Header Start ===== --> */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {/* <!-- ===== Header End ===== --> */}

          {/* <!-- ===== Main Content Start ===== --> */}
          <main className="flex-1">
            <div className="p-3 md:p-4 lg:p-6 xl:p-8 bg-gray-2 text-black dark:bg-boxdark-2 dark:text-bodydark">
              {children}
            </div>
          </main>
          {/* <!-- ===== Main Content End ===== --> */}
        </div>
        {/* <!-- ===== Content Area End ===== --> */}
      </div>
      {/* <!-- ===== Page Wrapper End ===== --> */}
    </>
  );
}