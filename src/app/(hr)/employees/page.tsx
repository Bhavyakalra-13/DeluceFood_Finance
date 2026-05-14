"use client";

import React, { useState } from "react";
import { useErp, Employee } from "@/providers/ErpProvider";

const EmployeesPage = () => {
  const { employees, addEmployee } = useErp();
  const [showCreate, setShowCreate] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    salary: 0,
    hireDate: new Date().toISOString().split("T")[0]
  });

  const departments = ["Production", "Quality", "Inventory", "HR", "Finance", "Sales", "Maintenance"];
  const positions = ["Manager", "Supervisor", "Technician", "Operator", "Clerk", "Engineer"];

  const handleAdd = () => {
    if (!newEmployee.name || !newEmployee.department) return;
    const newId = `emp${Date.now()}`;
    addEmployee({
      id: newId,
      name: newEmployee.name,
      email: newEmployee.email,
      phone: newEmployee.phone,
      department: newEmployee.department,
      position: newEmployee.position,
      salary: newEmployee.salary,
      hireDate: newEmployee.hireDate,
      status: "active",
      leaves: 0
    });
    setShowCreate(false);
    setNewEmployee({
      name: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      salary: 0,
      hireDate: new Date().toISOString().split("T")[0]
    });
  };

  const activeEmployees = employees.filter(e => e.status === "active");
  const avgSalary = activeEmployees.reduce((sum: number, e: Employee) => sum + (e.salary || 0), 0) / (activeEmployees.length || 1);

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 capitalize">Employee Management</h1>
          <p className="text-gray-500 mt-1">Centralize employee information and manage your team.</p>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Employee
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 transition-all">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Employee</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text"
              placeholder="Full Name"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input 
              type="email"
              placeholder="Email"
              value={newEmployee.email}
              onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input 
              type="tel"
              placeholder="Phone"
              value={newEmployee.phone}
              onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <select 
              value={newEmployee.department}
              onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Department</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select 
              value={newEmployee.position}
              onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Position</option>
              {positions.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <input 
              type="number"
              placeholder="Monthly Salary"
              value={newEmployee.salary || ""}
              onChange={(e) => setNewEmployee({...newEmployee, salary: Number(e.target.value)})}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button 
              onClick={handleAdd}
              className="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Add Employee
            </button>
            <button 
              onClick={() => setShowCreate(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <div>
              <p className="text-xs font-medium text-blue-800 uppercase">Total Employees</p>
              <p className="text-2xl font-bold text-blue-900">{activeEmployees.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-xs font-medium text-green-800 uppercase">Avg Salary</p>
              <p className="text-2xl font-bold text-green-900">${avgSalary.toFixed(0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <p className="text-xs font-medium text-orange-800 uppercase">Departments</p>
              <p className="text-2xl font-bold text-orange-900">{departments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Salary</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hire Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-medium text-sm">
                        {emp.name?.charAt(0) || '?'} 
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{emp.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{emp.email || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{emp.department || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{emp.position || '-'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">${(emp.salary || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{emp.hireDate || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${emp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm mr-3" onClick={() => {}}>View</button>
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm" onClick={() => {}}>Edit</button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No employees found. Add employees to manage your team.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeesPage;
