"use client";

import React, { useState } from "react";
import { useErp, SalesOrder, SalesOrderStatus } from "@/providers/ErpProvider";
import { useCurrency } from "@/hooks/useCurrency";
import useLocalStorage from "@/hooks/useLocalStorage";

const SalesPage = () => {
  const { products, salesOrders, createSO, updateSOStatus, customers } = useErp();
  const { formatCurrency } = useCurrency();
  const [showCreate, setShowCreate] = useState(false);
  
  const [companyInfo] = useLocalStorage("companyInfo", { defaultPaymentTerm: "Net 30" });
  
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState<{ productId: string; qty: number; unitPrice: number; discount: number }[]>([
    { productId: "", qty: 1, unitPrice: 0, discount: 0 }
  ]);
  const [paymentTerm, setPaymentTerm] = useState(companyInfo.defaultPaymentTerm || "Net 30");

  const finishedGoods = products.filter(p => p.type === "finished_good");

  const calculateLineTotal = (line: typeof lines[0]) => {
    return line.qty * line.unitPrice * (1 - line.discount / 100);
  };

  const subtotal = lines.reduce((sum, line) => sum + calculateLineTotal(line), 0);
  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const addLine = () => {
    setLines([...lines, { productId: "", qty: 1, unitPrice: 0, discount: 0 }]);
  };

  const updateLine = (index: number, field: keyof typeof lines[0], value: number | string) => {
    const newLines = [...lines];
    if (field === "productId") {
      newLines[index].productId = value as string;
      const product = products.find(p => p.id === value);
      if (product) {
        newLines[index].unitPrice = product.price;
      }
    } else if (field === "discount") {
      newLines[index].discount = typeof value === "number" ? value : parseFloat(value as string) || 0;
    } else if (field === "qty") {
      newLines[index].qty = typeof value === "number" ? value : parseInt(value as string) || 0;
    } else if (field === "unitPrice") {
      newLines[index].unitPrice = typeof value === "number" ? value : parseFloat(value as string) || 0;
    }
    setLines(newLines);
  };

  const removeLine = (index: number) => {
    const newLines = lines.filter((_, i) => i !== index);
    setLines(newLines.length ? newLines : [{ productId: "", qty: 1, unitPrice: 0, discount: 0 }]);
  };

  const handleCreateSO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || lines.length === 0 || lines.some(l => !l.productId || l.qty <= 0)) return;

    const soLines = lines.map(l => ({
      productId: l.productId,
      qty: l.qty,
      unitPrice: l.unitPrice,
      discount: l.discount,
      tax: l.unitPrice * l.qty * taxRate
    }));

    const newSo: SalesOrder = {
      id: `SO${Date.now()}`,
      name: `SO-${Date.now()}`,
      customerId,
      lines: soLines,
      amountUntaxed: subtotal,
      amountTax: tax,
      amountTotal: total,
      status: "sent",
      dateOrder: new Date().toISOString().split("T")[0],
      dateDelivery: new Date(Date.now() + 259200000).toISOString().split("T")[0],
      paymentTerm,
      note: ""
    };
    
    createSO(newSo);
    setShowCreate(false);
    setCustomerId("");
    setLines([{ productId: "", qty: 1, unitPrice: 0, discount: 0 }]);
    setPaymentTerm(companyInfo.defaultPaymentTerm || "Net 30");
  };

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || id;

  const getStatusColor = (status: SalesOrderStatus) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "sent": return "bg-blue-100 text-blue-800";
      case "sale": return "bg-green-100 text-green-800";
      case "done": return "bg-purple-100 text-purple-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 capitalize">Sales Orders</h1>
          <p className="text-gray-500 mt-1">Manage quotations, confirm orders, and track delivery.</p>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Quotation
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 transition-all">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">New Quotation</h2>
          <form onSubmit={handleCreateSO} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <select 
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">Select customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Term</label>
                <select 
                  value={paymentTerm}
                  onChange={(e) => setPaymentTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Net 30">Net 30</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Immediate">Immediate</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Unit Price</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Discount (%)</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="px-4 py-2">
                        <select 
                          value={line.productId}
                          onChange={(e) => updateLine(i, "productId", e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        >
                          <option value="">Select...</option>
                          {finishedGoods.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.price)})</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="number" 
                          value={line.qty}
                          onChange={(e) => updateLine(i, "qty", e.target.value)}
                          min="1"
                          className="w-20 border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="number" 
                          value={line.unitPrice}
                          onChange={(e) => updateLine(i, "unitPrice", e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-24 border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="number" 
                          value={line.discount}
                          onChange={(e) => updateLine(i, "discount", e.target.value)}
                          min="0"
                          max="100"
                          step="0.01"
                          className="w-20 border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm font-medium">
                        {formatCurrency(calculateLineTotal(line))}
                      </td>
                      <td className="px-4 py-2">
                        <button 
                          type="button"
                          onClick={() => removeLine(i)}
                          className="text-red-500 hover:text-red-700 text-sm"
                          disabled={lines.length <= 1}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button 
                type="button"
                onClick={addLine}
                className="w-full py-2 mt-2 text-indigo-600 hover:text-indigo-800 text-sm border border-dashed border-gray-300 rounded hover:border-indigo-300"
              >
                + Add another line
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (8%)</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t border-gray-300 pt-2">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button type="submit" className="flex-1 bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Save Quotation
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Ref</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {salesOrders.map((so) => (
                <tr key={so.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{so.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{getCustomerName(so.customerId)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{so.lines.reduce((sum, l) => sum + l.qty, 0)} items</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(so.amountTotal)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(so.status)}`}>
                      {so.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    {so.status === "sent" && (
                      <button 
                        onClick={() => updateSOStatus(so.id, "sale")}
                        className="text-blue-600 hover:text-blue-800 font-medium mr-4"
                      >
                        Confirm
                      </button>
                    )}
                    {so.status === "sale" && (
                      <button 
                        onClick={() => updateSOStatus(so.id, "done")}
                        className="text-purple-600 hover:text-purple-800 font-medium mr-4"
                        title="Deliver products & subtract from inventory"
                      >
                        Deliver
                      </button>
                    )}
                    {so.status === "done" && (
                      <span className="text-gray-400 text-sm">Completed</span>
                    )}
                    {so.status === "cancelled" && (
                      <span className="text-red-500 text-sm">Cancelled</span>
                    )}
                  </td>
                </tr>
              ))}
              {salesOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No sales orders found.
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

export default SalesPage;
