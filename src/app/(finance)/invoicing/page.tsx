"use client";

import React, { useState } from "react";
import { useErp, InvoiceStatus } from "@/providers/ErpProvider";
import { useCurrency } from "@/hooks/useCurrency";

const InvoicingPage = () => {
  const { invoices, updateInvoiceStatus, salesOrders, customers } = useErp();
  const { formatCurrency } = useCurrency();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedSO, setSelectedSO] = useState<string | null>(null);

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || id;
  const getSOById = (id: string) => salesOrders.find(so => so.id === id);

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "posted": return "bg-blue-100 text-blue-800";
      case "paid": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentMethodColor = (method: string) => {
    const colors: { [key: string]: string } = {
      cash: "bg-green-100 text-green-800",
      bank_transfer: "bg-blue-100 text-blue-800",
      credit_card: "bg-purple-100 text-purple-800",
      cheque: "bg-yellow-100 text-yellow-800",
    };
    return colors[method] || "bg-gray-100 text-gray-800";
  };

  const unpaidInvoices = invoices.filter(i => i.status === "posted" || i.status === "draft");
  const totalUnpaid = unpaidInvoices.reduce((acc, i) => acc + i.amountDue, 0);
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((acc, i) => acc + i.amountTotal, 0);

  const handleMarkAsPaid = (invoiceId: string) => {
    updateInvoiceStatus(invoiceId, "paid");
  };

  const handlePostInvoice = (invoiceId: string) => {
    updateInvoiceStatus(invoiceId, "posted");
  };

  // Available sales orders without invoices
  const availableSOs = salesOrders.filter(so => 
    so.status === "done" && !invoices.find(inv => inv.salesOrderId === so.id)
  );

  const handleCreateFromSO = (soId: string) => {
    const so = getSOById(soId);
    if (!so) return;

    // Create invoice logic handled by context
    setShowCreate(false);
    setSelectedSO(null);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 capitalize">Invoicing</h1>
          <p className="text-gray-500 mt-1">Manage customer invoices, track payments, and reconcile accounts.</p>
        </div>
        {availableSOs.length > 0 && (
          <button 
            onClick={() => setShowCreate(!showCreate)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Invoice
          </button>
        )}
      </div>

      {showCreate && availableSOs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 transition-all">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Create Invoice from Sales Order</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Sales Order</label>
            <select 
              value={selectedSO || ""}
              onChange={(e) => setSelectedSO(e.target.value)}
              className="w-full md:w-1/3 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Select a sales order...</option>
              {availableSOs.map(so => (
                <option key={so.id} value={so.id}>{so.name} - {getCustomerName(so.customerId)} ({formatCurrency(so.amountTotal)})</option>
              ))}
            </select>
          </div>
          {selectedSO && (
            <div className="flex gap-4 pt-2">
              <button 
                onClick={() => handleCreateFromSO(selectedSO)}
                className="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Create Invoice
              </button>
              <button 
                type="button" 
                onClick={() => { setShowCreate(false); setSelectedSO(null); }}
                className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Unpaid Invoices</p>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(totalUnpaid)}</p>
            <p className="text-xs text-gray-500 mt-1">{unpaidInvoices.length} invoices pending</p>
          </div>
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Paid</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
            <p className="text-xs text-gray-500 mt-1">{invoices.filter(i => i.status === "paid").length} invoices paid</p>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Recent Invoices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Source SO</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Due</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{inv.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{getCustomerName(inv.customerId)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{inv.salesOrderId?.toUpperCase() || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{inv.invoiceDate}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">{formatCurrency(inv.amountTotal)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-right">{formatCurrency(inv.amountDue)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(inv.status)}`}>
                      {inv.status}
                    </span>
                    {inv.paymentDate && (
                      <span className={`ml-2 px-2.5 py-1 rounded text-xs font-medium ${getPaymentMethodColor(inv.paymentMethod || 'bank_transfer')}`}>
                        {inv.paymentMethod}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    {inv.status === "draft" && (
                      <button 
                        onClick={() => handlePostInvoice(inv.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium mr-2"
                      >
                        Post
                      </button>
                    )}
                    {inv.status === "posted" && (
                      <button 
                        onClick={() => handleMarkAsPaid(inv.id)}
                        className="text-green-600 hover:text-green-800 font-medium bg-green-50 px-3 py-1 rounded"
                      >
                        Mark Paid
                      </button>
                    )}
                    {inv.status === "paid" && (
                      <span className="text-gray-400 text-sm">Paid</span>
                    )}
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No invoices found. Create one from completed sales orders.
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

export default InvoicingPage;
