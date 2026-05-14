"use client";

import React, { useState } from "react";
import { useErp, QualityCheck, QCPriority, QCStatus } from "@/providers/ErpProvider";

const QualityPage = () => {
  const { qualityChecks, createQualityCheck, updateQualityCheckStatus, products } = useErp();
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState("open");

  const [newQC, setNewQC] = useState<Omit<QualityCheck, "id">>({
    name: "",
    productId: "",
    checkType: "incoming",
    priority: "major",
    status: "open",
    assignedTo: "",
    dueDate: new Date().toISOString().split("T")[0],
    description: "",
    result: "pending",
  });

  const getQCStats = () => ({
    open: qualityChecks.filter(q => q.status === "open").length,
    inProgress: qualityChecks.filter(q => q.status === "in_progress").length,
    resolved: qualityChecks.filter(q => q.status === "resolved").length,
    nonConformance: qualityChecks.filter(q => q.status === "non_conformance").length,
    pass: qualityChecks.filter(q => q.result === "pass").length,
    fail: qualityChecks.filter(q => q.result === "fail").length,
  });

  const stats = getQCStats();

  const getPriorityColor = (p: QCPriority) => {
    switch (p) {
      case "critical": return "bg-red-100 text-red-800";
      case "major": return "bg-yellow-100 text-yellow-800";
      case "minor": return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusColor = (s: QCStatus) => {
    switch (s) {
      case "open": return "bg-gray-100 text-gray-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "closed": return "bg-gray-100 text-gray-800";
      case "non_conformance": return "bg-red-100 text-red-800";
    }
  };

  const getResultColor = (r: "pass" | "fail" | "pending" | undefined) => {
    switch (r) {
      case "pass": return "bg-green-100 text-green-800";
      case "fail": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const qc: QualityCheck = {
      ...newQC,
      id: `QC${Date.now()}`,
    };
    createQualityCheck(qc);
    setShowCreate(false);
    setNewQC({
      name: "",
      productId: "",
      checkType: "incoming",
      priority: "major",
      status: "open",
      assignedTo: "",
      dueDate: new Date().toISOString().split("T")[0],
      description: "",
      result: "pending",
    });
  };

  const filteredChecks = qualityChecks.filter(qc => {
    if (activeTab === "open") return qc.status === "open" || qc.status === "in_progress";
    if (activeTab === "resolved") return qc.status === "resolved" || qc.status === "closed";
    if (activeTab === "non_conformance") return qc.status === "non_conformance" || qc.result === "fail";
    return true;
  });

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-50 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 capitalize">Quality Control</h1>
          <p className="text-gray-500 mt-1">Manage quality checks, non-conformances, and corrective actions.</p>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Check
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 transition-all">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">New Quality Check</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text"
              placeholder="Check Name"
              value={newQC.name}
              onChange={(e) => setNewQC({...newQC, name: e.target.value})}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
            <select 
              value={newQC.productId}
              onChange={(e) => setNewQC({...newQC, productId: e.target.value})}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            >
              <option value="">Select Product</option>
              {products.filter(p => p.active).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select 
              value={newQC.priority}
              onChange={(e) => setNewQC({...newQC, priority: e.target.value as QCPriority})}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="critical">Critical</option>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
            </select>
            <select 
              value={newQC.checkType}
              onChange={(e) => setNewQC({...newQC, checkType: e.target.value as "incoming" | "in_process" | "final"})}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="incoming">Incoming Inspection</option>
              <option value="in_process">In-Process Check</option>
              <option value="final">Final Inspection</option>
            </select>
            <input 
              type="date"
              value={newQC.dueDate}
              onChange={(e) => setNewQC({...newQC, dueDate: e.target.value})}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button 
              type="submit"
              className="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Create
            </button>
          </form>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-8">
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <p className="text-xs font-medium text-red-800 uppercase">Non-Conformance</p>
              <p className="text-2xl font-bold text-red-900">{stats.nonConformance}</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-xs font-medium text-yellow-800 uppercase">Open</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.open}</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-xs font-medium text-blue-800 uppercase">In Progress</p>
              <p className="text-2xl font-bold text-blue-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <p className="text-xs font-medium text-green-800 uppercase">Passed</p>
              <p className="text-2xl font-bold text-green-900">{stats.pass}</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-red-400 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <div>
              <p className="text-xs font-medium text-red-800 uppercase">Failed</p>
              <p className="text-2xl font-bold text-red-900">{stats.fail}</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <div>
              <p className="text-xs font-medium text-purple-800 uppercase">Total Checks</p>
              <p className="text-2xl font-bold text-purple-900">{qualityChecks.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Headers */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100">
        <button
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === "open" ? "bg-white border border-gray-200 border-b-white -mb-px" : "bg-gray-100 text-gray-500"}`}
          onClick={() => setActiveTab("open")}
        >
          Open ({stats.open + stats.inProgress})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === "resolved" ? "bg-white border border-gray-200 border-b-white -mb-px" : "bg-gray-100 text-gray-500"}`}
          onClick={() => setActiveTab("resolved")}
        >
          Resolved ({stats.resolved})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === "non_conformance" ? "bg-white border border-gray-200 border-b-white -mb-px" : "bg-gray-100 text-gray-500"}`}
          onClick={() => setActiveTab("non_conformance")}
        >
          Non-Conformance ({stats.nonConformance})
        </button>
      </div>

      {/* Quality Checks Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Result</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredChecks.map((qc) => (
                <tr key={qc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{qc.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{qc.productId}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${qc.checkType === "incoming" ? "bg-blue-100 text-blue-800" : qc.checkType === "in_process" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                      {qc.checkType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(qc.priority)}`}>
                      {qc.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(qc.status)}`}>
                      {qc.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {qc.result && (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getResultColor(qc.result)}`}>
                        {qc.result}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{qc.dueDate}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    {qc.status === "open" && (
                      <button 
                        onClick={() => updateQualityCheckStatus(qc.id, "in_progress")}
                        className="text-blue-600 hover:text-blue-800 font-medium mr-2"
                      >
                        Start
                      </button>
                    )}
                    {qc.status === "in_progress" && (
                      <>
                        <button 
                          onClick={() => updateQualityCheckStatus(qc.id, "resolved", "pass")}
                          className="text-green-600 hover:text-green-800 font-medium bg-green-50 px-2 py-1 rounded mr-2"
                        >
                          Pass
                        </button>
                        <button 
                          onClick={() => updateQualityCheckStatus(qc.id, "non_conformance", "fail")}
                          className="text-red-600 hover:text-red-800 font-medium bg-red-50 px-2 py-1 rounded"
                        >
                          Fail
                        </button>
                      </>
                    )}
                    {(qc.status === "resolved" || qc.status === "non_conformance") && (
                      <button 
                        onClick={() => updateQualityCheckStatus(qc.id, "closed")}
                        className="text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Close
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredChecks.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No quality checks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Non-Conformance Details */}
      {activeTab === "non_conformance" && qualityChecks.filter(q => q.status === "non_conformance" || q.result === "fail").length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Non-Conformance Details</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-red-50 border-b border-red-100">
                    <th className="px-6 py-4 text-xs font-semibold text-red-800 uppercase tracking-wider">Check</th>
                    <th className="px-6 py-4 text-xs font-semibold text-red-800 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-xs font-semibold text-red-800 uppercase tracking-wider">Corrective Action</th>
                    <th className="px-6 py-4 text-xs font-semibold text-red-800 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-100">
                  {qualityChecks.filter(q => q.status === "non_conformance" || q.result === "fail").map((qc) => (
                    <tr key={qc.id} className="hover:bg-red-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-red-900">{qc.name}</td>
                      <td className="px-6 py-4 text-sm text-red-700">{qc.description}</td>
                      <td className="px-6 py-4 text-sm text-red-700">{qc.correctiveAction || "Not yet assigned"}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(qc.status)}`}>
                          {qc.status.replace(/_/g, " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityPage;
