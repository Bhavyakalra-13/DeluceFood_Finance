"use client";

import React, { useState } from "react";
import { useErp, Account, JournalEntry } from "@/providers/ErpProvider";

const AccountingPage = () => {
  const { accounts, journalEntries, createAccount, createJournalEntry, postJournalEntry } = useErp();
  const [activeTab, setActiveTab] = useState("chart");
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);

  const assetAccounts = accounts.filter(a => a.type === "asset");
  const liabilityAccounts = accounts.filter(a => a.type === "liability");
  const equityAccounts = accounts.filter(a => a.type === "equity");
  const revenueAccounts = accounts.filter(a => a.type === "revenue");
  const expenseAccounts = accounts.filter(a => a.type === "expense");

  const totalAssets = assetAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = liabilityAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalEquity = equityAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalRevenue = revenueAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalExpenses = expenseAccounts.reduce((sum, a) => sum + a.balance, 0);

  const [newAccount, setNewAccount] = useState({
    code: "",
    name: "",
    type: "asset" as "asset" | "liability" | "equity" | "revenue" | "expense",
    category: "cash" as Account["category"],
    isActive: true,
    balance: 0,
  });

  const [newJournalEntry, setNewJournalEntry] = useState({
    name: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    lines: [{ id: `jel-${Date.now()}`, accountId: "", debit: 0, credit: 0, description: "" }],
  });

  const addJournalLine = () => {
    setNewJournalEntry({
      ...newJournalEntry,
      lines: [...newJournalEntry.lines, { id: `jel-${Date.now()}`, accountId: "", debit: 0, credit: 0, description: "" }],
    });
  };

  const updateJournalLine = (index: number, field: string, value: string | number) => {
    const newLines = [...newJournalEntry.lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setNewJournalEntry({ ...newJournalEntry, lines: newLines });
  };

  const removeJournalLine = (index: number) => {
    const newLines = newJournalEntry.lines.filter((_, i) => i !== index);
    setNewJournalEntry({ ...newJournalEntry, lines: newLines });
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const account: Account = {
      ...newAccount,
      id: `acc${Date.now()}`,
    };
    createAccount(account);
    setShowAccountModal(false);
    setNewAccount({ code: "", name: "", type: "asset", category: "cash", isActive: true, balance: 0 });
  };

  const handleCreateJournalEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: JournalEntry = {
      ...newJournalEntry,
      id: `je${Date.now()}`,
      type: "manual",
      reference: "",
      posted: false,
    };
    createJournalEntry(entry);
    setShowJournalModal(false);
    setNewJournalEntry({
      name: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      lines: [{ id: `jel-${Date.now()}`, accountId: "", debit: 0, credit: 0, description: "" }],
    });
  };

  const trialBalance = accounts.map(a => ({
    ...a,
    debitBalance: a.type === "asset" || a.type === "expense" ? a.balance : 0,
    creditBalance: a.type === "liability" || a.type === "equity" || a.type === "revenue" ? a.balance : 0,
  }));

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 capitalize">Financial Accounting</h1>
          <p className="text-gray-500 mt-1">General ledger, journal entries, bank reconciliation, and financial reports.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowJournalModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Journal Entry
          </button>
          <button 
            onClick={() => setShowAccountModal(true)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Account
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[{key: "chart", label: "Chart of Accounts"}, {key: "trial", label: "Trial Balance"}, {key: "journal", label: "Journal Entries"}].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === tab.key ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "chart" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-sm font-medium text-blue-800 uppercase">Assets</h3>
              <p className="text-2xl font-bold text-blue-900 mt-2">${totalAssets.toFixed(2)}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="text-sm font-medium text-red-800 uppercase">Liabilities</h3>
              <p className="text-2xl font-bold text-red-900 mt-2">${totalLiabilities.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="text-sm font-medium text-green-800 uppercase">Equity</h3>
              <p className="text-2xl font-bold text-green-900 mt-2">${totalEquity.toFixed(2)}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <h3 className="text-sm font-medium text-purple-800 uppercase">Revenue</h3>
              <p className="text-2xl font-bold text-purple-900 mt-2">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <h3 className="text-sm font-medium text-orange-800 uppercase">Expenses</h3>
              <p className="text-2xl font-bold text-orange-900 mt-2">${totalExpenses.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Accounts</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Code</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Account Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {accounts.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{a.code}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{a.name}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${a.type === "asset" ? "bg-blue-100 text-blue-800" : a.type === "liability" ? "bg-red-100 text-red-800" : a.type === "equity" ? "bg-green-100 text-green-800" : a.type === "revenue" ? "bg-purple-100 text-purple-800" : "bg-orange-100 text-orange-800"}`}>
                          {a.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 capitalize">{a.category}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">${a.balance.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "trial" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Trial Balance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Account</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Debit</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {trialBalance.filter(a => a.debitBalance > 0 || a.creditBalance > 0).map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <span className="font-medium text-gray-900">{a.code} {a.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                      {a.debitBalance > 0 ? `$${a.debitBalance.toFixed(2)}` : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                      {a.creditBalance > 0 ? `$${a.creditBalance.toFixed(2)}` : "-"}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold">
                  <td className="px-6 py-4 text-sm text-gray-900">Totals</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">${trialBalance.reduce((s, a) => s + a.debitBalance, 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">${trialBalance.reduce((s, a) => s + a.creditBalance, 0).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "journal" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Journal Entries</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Reference</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Debit</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Credit</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {journalEntries.map(je => (
                  <tr key={je.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{je.date}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{je.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{je.description}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">${je.lines.reduce((s, l) => s + l.debit, 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">${je.lines.reduce((s, l) => s + l.credit, 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${je.posted ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                        {je.posted ? "Posted" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {!je.posted && (
                        <button 
                          onClick={() => postJournalEntry(je.id)}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Post
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Create New Account</h2>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Code</label>
                  <input 
                    type="text" 
                    value={newAccount.code}
                    onChange={(e) => setNewAccount({...newAccount, code: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                  <select 
                    value={newAccount.type}
                    onChange={(e) => setNewAccount({...newAccount, type: e.target.value as "asset" | "liability" | "equity" | "revenue" | "expense"})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="asset">Asset</option>
                    <option value="liability">Liability</option>
                    <option value="equity">Equity</option>
                    <option value="revenue">Revenue</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                <input 
                  type="text" 
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opening Balance</label>
                  <input 
                    type="number" 
                    value={newAccount.balance}
                    onChange={(e) => setNewAccount({...newAccount, balance: parseFloat(e.target.value) || 0})}
                    step="0.01"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    value={newAccount.category}
                    onChange={(e) => setNewAccount({...newAccount, category: e.target.value as Account["category"]})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                    <option value="receivable">Accounts Receivable</option>
                    <option value="payable">Accounts Payable</option>
                    <option value="stock">Inventory</option>
                    <option value="cost_of_goods_sold">COGS</option>
                    <option value="revenue">Revenue</option>
                    <option value="expense">Expense</option>
                    <option value="tax">Tax</option>
                    <option value="retained_earnings">Retained Earnings</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Create Account
                </button>
                <button type="button" onClick={() => setShowAccountModal(false)} className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showJournalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Create Journal Entry</h2>
            <form onSubmit={handleCreateJournalEntry} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entry Name</label>
                  <input 
                    type="text" 
                    value={newJournalEntry.name}
                    onChange={(e) => setNewJournalEntry({...newJournalEntry, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={newJournalEntry.date}
                    onChange={(e) => setNewJournalEntry({...newJournalEntry, date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={newJournalEntry.description}
                  onChange={(e) => setNewJournalEntry({...newJournalEntry, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Journal Lines</label>
                  <button type="button" onClick={addJournalLine} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">+ Add Line</button>
                </div>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-500">Account</th>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-500">Description</th>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-500 text-right">Debit</th>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-500 text-right">Credit</th>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-500"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {newJournalEntry.lines.map((line, i) => (
                        <tr key={line.id} className="border-t border-gray-100">
                          <td className="px-4 py-2">
                            <select 
                              value={line.accountId}
                              onChange={(e) => updateJournalLine(i, "accountId", e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                              required
                            >
                              <option value="">Select Account</option>
                              {accounts.map(a => (
                                <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <input 
                              type="text" 
                              value={line.description}
                              onChange={(e) => updateJournalLine(i, "description", e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input 
                              type="number" 
                              value={line.debit || ""}
                              onChange={(e) => updateJournalLine(i, "debit", parseFloat(e.target.value) || 0)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-right"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input 
                              type="number" 
                              value={line.credit || ""}
                              onChange={(e) => updateJournalLine(i, "credit", parseFloat(e.target.value) || 0)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-right"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <button 
                              type="button"
                              onClick={() => removeJournalLine(i)}
                              className="text-red-500 hover:text-red-700 text-sm"
                              disabled={newJournalEntry.lines.length <= 1}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-2 text-sm">
                  <span className="text-gray-600 mr-4">Debit Total: ${newJournalEntry.lines.reduce((s, l) => s + l.debit, 0).toFixed(2)}</span>
                  <span className="text-gray-600">Credit Total: ${newJournalEntry.lines.reduce((s, l) => s + l.credit, 0).toFixed(2)}</span>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Create Entry
                </button>
                <button type="button" onClick={() => setShowJournalModal(false)} className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingPage;