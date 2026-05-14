"use client";

import React, { useState, useEffect } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { menuGroups } from "@/components/Sidebar";
import { useErp } from "@/providers/ErpProvider";

const defaultCompanyInfo = {
  name: "Deluce Food Industry",
  taxId: "TAX-123456",
  registrationNumber: "REG-987654321",
  phone: "+1 (555) 123-4567",
  email: "admin@delucefood.com",
  website: "https://www.delucefood.com",
  address: "123 Manufacturing Lane, Food City, FC 90210",
  currency: "USD",
  timezone: "UTC-5 (Eastern Time)",
  dateFormat: "MM/DD/YYYY",
  defaultPaymentTerm: "Net 30",
  theme: "system",
  emailNotifications: true,
  inAppNotifications: true,
};

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<"general" | "modules">("general");
  const [hiddenModules, setHiddenModules] = useLocalStorage<string[]>("hiddenModules", []);
  
  const [companyInfo, setCompanyInfo] = useLocalStorage("companyInfo", defaultCompanyInfo);
  
  // Use a draft state so changes only apply when "Save Settings" is clicked
  const [draftInfo, setDraftInfo] = useState(defaultCompanyInfo);
  const [draftHiddenModules, setDraftHiddenModules] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync draft when companyInfo mounts
  useEffect(() => {
    setDraftInfo({ ...defaultCompanyInfo, ...companyInfo });
    setDraftHiddenModules(hiddenModules);
  }, [companyInfo, hiddenModules]);

  const { products, inventory, customers, vendors } = useErp();

  const toggleModule = (label: string) => {
    // Prevent hiding the settings page itself to avoid lock-out
    if (label === "Settings") return;

    if (draftHiddenModules.includes(label)) {
      setDraftHiddenModules(draftHiddenModules.filter((m) => m !== label));
    } else {
      setDraftHiddenModules([...draftHiddenModules, label]);
    }
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    // Simulate a network delay for premium UX feel
    setTimeout(() => {
      setCompanyInfo(draftInfo);
      setHiddenModules(draftHiddenModules);
      setIsSaving(false);
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  const handleExportData = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      companyInfo,
      systemState: {
        productsCount: products.length,
        inventoryCount: inventory.length,
        customersCount: customers.length,
        vendorsCount: vendors.length
      }
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `deluce-erp-backup-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 capitalize">Settings</h1>
          <p className="text-gray-500 mt-1">Configure your ERP system, company profile, and layout preferences.</p>
        </div>
        
        {/* Global Save Button */}
        <div className="flex items-center gap-4">
          {saveSuccess && (
            <span className="text-sm font-medium text-green-600 flex items-center gap-1 animate-in fade-in slide-in-from-right-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Settings Saved!
            </span>
          )}
          <button 
            onClick={handleSaveSettings}
            disabled={isSaving}
            className={`px-6 py-2.5 rounded-lg font-medium text-white shadow-sm transition-all flex items-center gap-2 ${
              isSaving ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 hover:shadow"
            }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        {/* Settings Navigation */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 px-6 pt-4">
          <button 
            onClick={() => setActiveTab("general")}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === "general" ? "border-indigo-600 text-indigo-700 bg-white rounded-t-lg" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
          >
            General Profile
          </button>
          <button 
            onClick={() => setActiveTab("modules")}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === "modules" ? "border-indigo-600 text-indigo-700 bg-white rounded-t-lg" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
          >
            App Modules
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto">
          {activeTab === "general" && (
            <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
              {/* Company Info Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  Company Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50/50 rounded-xl border border-gray-100">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input 
                      type="text" 
                      value={draftInfo.name}
                      onChange={(e) => setDraftInfo({...draftInfo, name: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID / VAT</label>
                    <input 
                      type="text" 
                      value={draftInfo.taxId}
                      onChange={(e) => setDraftInfo({...draftInfo, taxId: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                    <input 
                      type="text" 
                      value={draftInfo.registrationNumber}
                      onChange={(e) => setDraftInfo({...draftInfo, registrationNumber: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={draftInfo.email}
                      onChange={(e) => setDraftInfo({...draftInfo, email: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={draftInfo.phone}
                      onChange={(e) => setDraftInfo({...draftInfo, phone: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                    <input 
                      type="url" 
                      value={draftInfo.website}
                      onChange={(e) => setDraftInfo({...draftInfo, website: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Physical Address</label>
                    <textarea 
                      value={draftInfo.address}
                      onChange={(e) => setDraftInfo({...draftInfo, address: e.target.value})}
                      rows={2}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none" 
                    />
                  </div>
                </div>
              </div>

              {/* System Configuration Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  System Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-50/50 rounded-xl border border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
                    <select 
                      value={draftInfo.currency}
                      onChange={(e) => setDraftInfo({...draftInfo, currency: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <select 
                      value={draftInfo.timezone}
                      onChange={(e) => setDraftInfo({...draftInfo, timezone: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="UTC">UTC</option>
                      <option value="UTC-5 (Eastern Time)">UTC-5 (Eastern Time)</option>
                      <option value="UTC-8 (Pacific Time)">UTC-8 (Pacific Time)</option>
                      <option value="UTC+5:30 (India)">UTC+5:30 (IST)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                    <select 
                      value={draftInfo.dateFormat}
                      onChange={(e) => setDraftInfo({...draftInfo, dateFormat: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Payment Term</label>
                    <select 
                      value={draftInfo.defaultPaymentTerm}
                      onChange={(e) => setDraftInfo({...draftInfo, defaultPaymentTerm: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="Immediate">Immediate</option>
                      <option value="Net 15">Net 15 Days</option>
                      <option value="Net 30">Net 30 Days</option>
                      <option value="Net 60">Net 60 Days</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UI Theme Preference</label>
                    <select 
                      value={draftInfo.theme}
                      onChange={(e) => setDraftInfo({...draftInfo, theme: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="light">Light Mode</option>
                      <option value="dark">Dark Mode</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Notifications Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  Alerts & Notifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-gray-50/50 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-800">Email Notifications</p>
                      <p className="text-xs text-gray-500">Receive daily digest and critical alerts.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setDraftInfo({...draftInfo, emailNotifications: !draftInfo.emailNotifications})}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${draftInfo.emailNotifications ? "bg-indigo-600" : "bg-gray-300"}`}
                      role="switch"
                      aria-checked={draftInfo.emailNotifications}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${draftInfo.emailNotifications ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-800">In-App Notifications</p>
                      <p className="text-xs text-gray-500">Show toast alerts inside the ERP dashboard.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setDraftInfo({...draftInfo, inAppNotifications: !draftInfo.inAppNotifications})}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${draftInfo.inAppNotifications ? "bg-indigo-600" : "bg-gray-300"}`}
                      role="switch"
                      aria-checked={draftInfo.inAppNotifications}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${draftInfo.inAppNotifications ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Management Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                  Data Management
                </h3>
                <div className="flex flex-col md:flex-row gap-6 p-6 bg-gray-50/50 rounded-xl border border-gray-100">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">Export Database Backup</h4>
                    <p className="text-sm text-gray-500 mb-4">Download a JSON snapshot of your current ERP state, including products, orders, and company settings.</p>
                    <button 
                      onClick={handleExportData}
                      className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Download JSON Backup
                    </button>
                  </div>
                  <div className="hidden md:block w-px bg-gray-200"></div>
                  <div className="flex-1">
                    <h4 className="font-medium text-red-700 mb-1">Clear Local Cache</h4>
                    <p className="text-sm text-gray-500 mb-4">Reset all local storage preferences including your hidden modules list and company info.</p>
                    <button 
                      onClick={() => {
                        if(confirm("Are you sure you want to clear your local preferences?")) {
                          window.localStorage.clear();
                          window.location.reload();
                        }
                      }}
                      className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Reset Preferences
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "modules" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Sidebar Configuration</h3>
                <p className="text-sm text-gray-500 mt-1">Turn off modules you don't need to simplify your sidebar navigation. These changes are saved automatically.</p>
              </div>
              <div className="space-y-8">
                {menuGroups.map((group, groupIdx) => (
                  <div key={groupIdx}>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 pl-2">{group.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {group.menuItems.map((item, itemIdx) => {
                        const isHidden = draftHiddenModules.includes(item.label);
                        const isSettings = item.label === "Settings";
                        
                        return (
                          <div 
                            key={itemIdx} 
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isHidden ? "bg-gray-50 border-gray-200" : "bg-white border-indigo-100 shadow-sm ring-1 ring-black/5"}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isHidden ? "bg-gray-200 text-gray-400" : "bg-indigo-50 text-indigo-600"}`}>
                                {item.icon}
                              </div>
                              <span className={`font-medium ${isHidden ? "text-gray-400" : "text-gray-800"}`}>{item.label}</span>
                            </div>
                            
                            <button 
                              type="button"
                              onClick={() => toggleModule(item.label)}
                              disabled={isSettings}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${!isHidden ? "bg-indigo-600" : "bg-gray-300"} ${isSettings ? "opacity-50 cursor-not-allowed" : ""}`}
                              role="switch"
                              aria-checked={!isHidden}
                            >
                              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${!isHidden ? "translate-x-5" : "translate-x-0"}`} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
