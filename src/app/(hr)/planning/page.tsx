"use client";

import React, { useState } from "react";
import { useErp } from "@/providers/ErpProvider";

const PlanningPage = () => {
  const { manufacturingOrders, employees, purchaseOrders, stockMoves } = useErp();
  const [view, setView] = useState<"production" | "shifts">("production");

  // Get dates for the next 7 days
  const today = new Date();
  const next7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const getDayName = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" });
  };

  const activeEmployees = employees.filter(e => e.status === "active");

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 capitalize">Master Planning</h1>
          <p className="text-gray-500 mt-1">Schedule production orders, employee shifts, and view incoming stock.</p>
        </div>
        <div className="flex bg-gray-200 rounded-lg p-1">
          <button 
            onClick={() => setView("production")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === "production" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Production Load
          </button>
          <button 
            onClick={() => setView("shifts")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === "shifts" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Team Shifts
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Open MOs</h3>
          <p className="text-3xl font-bold text-indigo-600">{manufacturingOrders.filter(mo => mo.status !== "done" && mo.status !== "cancelled").length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Pending Deliveries (POs)</h3>
          <p className="text-3xl font-bold text-green-600">{purchaseOrders.filter(po => po.status === "sent" || po.status === "purchase").length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Pending Stock Moves</h3>
          <p className="text-3xl font-bold text-amber-600">{stockMoves.filter(sm => sm.status === "draft" || sm.status === "confirmed").length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Active Team Size</h3>
          <p className="text-3xl font-bold text-blue-600">{activeEmployees.length}</p>
        </div>
      </div>

      {view === "production" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">7-Day Production Schedule</h2>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[800px] flex divide-x divide-gray-100">
              {next7Days.map(date => {
                const dayMOs = manufacturingOrders.filter(mo => mo.scheduledDate === date && mo.status !== "cancelled");
                const dayPOs = purchaseOrders.filter(po => po.datePlanned === date && po.status !== "done" && po.status !== "cancelled");
                
                return (
                  <div key={date} className="flex-1 min-h-[400px] flex flex-col">
                    <div className="p-3 bg-gray-50 border-b border-gray-100 text-center">
                      <p className="text-xs font-semibold text-gray-500 uppercase">{getDayName(date)}</p>
                      <p className="text-lg font-bold text-gray-800">{new Date(date).getDate()}</p>
                    </div>
                    <div className="p-3 flex-1 flex flex-col gap-3 bg-white">
                      {dayMOs.length === 0 && dayPOs.length === 0 && (
                        <div className="flex-1 flex items-center justify-center">
                          <p className="text-xs text-gray-400 text-center">No schedule</p>
                        </div>
                      )}
                      
                      {dayMOs.map(mo => (
                        <div key={mo.id} className={`p-3 rounded-lg border-l-4 shadow-sm text-sm ${mo.status === "done" ? "border-green-500 bg-green-50" : mo.priority === "2" ? "border-red-500 bg-red-50" : "border-indigo-500 bg-indigo-50"}`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-gray-900">{mo.name}</span>
                            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-white">{mo.productQty} units</span>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-1">{mo.status}</p>
                        </div>
                      ))}

                      {dayPOs.map(po => (
                        <div key={po.id} className="p-3 rounded-lg border-l-4 border-amber-500 bg-amber-50 shadow-sm text-sm">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-gray-900">Inbound PO</span>
                            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-white text-amber-800">{po.name}</span>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-1">Expected Delivery</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {view === "shifts" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Team Allocation Overview</h2>
          </div>
          <div className="p-6">
            {activeEmployees.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No active employees found to schedule. Add employees in the HR module first.
              </div>
            ) : (
              <div className="space-y-6">
                {["Production", "Quality", "Inventory"].map(dept => {
                  const deptEmps = activeEmployees.filter(e => e.department === dept);
                  if (deptEmps.length === 0) return null;
                  
                  return (
                    <div key={dept} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-800">{dept} Department</h3>
                      </div>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {deptEmps.map(emp => (
                          <div key={emp.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                              {emp.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{emp.name}</p>
                              <p className="text-xs text-gray-500">{emp.position}</p>
                            </div>
                            <div className="ml-auto">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Assigned
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanningPage;
