"use client";

import React, { useState } from "react";
import { useErp, PurchaseOrder, PurchaseOrderStatus, WarehouseLocation } from "@/providers/ErpProvider";
import { useCurrency } from "@/hooks/useCurrency";

const PurchasePage = () => {
  const { products, purchaseOrders, createPO, updatePOStatus, vendors, addVendor } = useErp();
  const { formatCurrency } = useCurrency();
  const [showCreate, setShowCreate] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  
  const [vendorId, setVendorId] = useState("");
  const [taxInclusive, setTaxInclusive] = useState(false);
  const [taxRatePct, setTaxRatePct] = useState(10);
  const [destination, setDestination] = useState<WarehouseLocation>("dry_storage");
  const [billPdf, setBillPdf] = useState("");

  const [newVendor, setNewVendor] = useState({
    name: "", email: "", phone: "", address: "", paymentTerm: "", bankDetails: "", companyDetails: ""
  });

  const [lines, setLines] = useState<{ productId: string; qty: number; unitPrice: number; discount: number; expectedDate: string }[]>(
    [{ productId: "", qty: 1, unitPrice: 0, discount: 0, expectedDate: new Date(Date.now() + 259200000).toISOString().split("T")[0] }]
  );

  const rawMaterials = products.filter(p => p.type === "raw_material" || p.type === "semi_finished");

  const calculateLineTotal = (line: typeof lines[0]) => {
    return line.qty * line.unitPrice * (1 - line.discount / 100);
  };

  const subtotal = lines.reduce((sum, line) => sum + calculateLineTotal(line), 0);
  const taxRate = taxRatePct / 100;
  
  // If inclusive, subtotal already includes tax.
  // Tax = Subtotal - (Subtotal / (1 + TaxRate))
  const tax = taxInclusive ? subtotal - (subtotal / (1 + taxRate)) : subtotal * taxRate;
  const total = taxInclusive ? subtotal : subtotal + tax;
  const untaxed = taxInclusive ? subtotal - tax : subtotal;

  const addLine = () => {
    setLines([...lines, { productId: "", qty: 1, unitPrice: 0, discount: 0, expectedDate: new Date(Date.now() + 259200000).toISOString().split("T")[0] }]);
  };

  const updateLine = (index: number, field: keyof typeof lines[0], value: number | string) => {
    const newLines = [...lines];
    if (field === "productId") {
      newLines[index].productId = value as string;
      const product = products.find(p => p.id === value);
      if (product) {
        newLines[index].unitPrice = product.cost;
      }
    } else if (field === "discount") {
      newLines[index].discount = typeof value === "number" ? value : parseFloat(value as string) || 0;
    } else if (field === "qty") {
      newLines[index].qty = typeof value === "number" ? value : parseInt(value as string) || 0;
    } else if (field === "unitPrice") {
      newLines[index].unitPrice = typeof value === "number" ? value : parseFloat(value as string) || 0;
    } else if (field === "expectedDate") {
      newLines[index].expectedDate = value as string;
    }
    setLines(newLines);
  };

  const removeLine = (index: number) => {
    const newLines = lines.filter((_, i) => i !== index);
    setLines(newLines.length ? newLines : [{ productId: "", qty: 1, unitPrice: 0, discount: 0, expectedDate: new Date(Date.now() + 259200000).toISOString().split("T")[0] }]);
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId || lines.length === 0 || lines.some(l => !l.productId || l.qty <= 0)) return;

    const poLines = lines.map(l => ({
      productId: l.productId,
      qty: l.qty,
      unitPrice: l.unitPrice,
      discount: l.discount,
      expectedDate: l.expectedDate,
    }));

    const newPO: PurchaseOrder = {
      id: `PO${Date.now()}`,
      name: `PO-${Date.now()}`,
      vendorId,
      lines: poLines,
      amountUntaxed: untaxed,
      amountTax: tax,
      amountTotal: total,
      status: "sent",
      dateOrder: new Date().toISOString().split("T")[0],
      datePlanned: new Date(Date.now() + 259200000).toISOString().split("T")[0],
      taxInclusive,
      billPdf,
    };
    
    createPO(newPO);
    setShowCreate(false);
    setVendorId("");
    setBillPdf("");
    setLines([{ productId: "", qty: 1, unitPrice: 0, discount: 0, expectedDate: new Date(Date.now() + 259200000).toISOString().split("T")[0] }]);
  };

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor.name) return;
    addVendor({
      id: `VEN${Date.now()}`,
      ...newVendor
    });
    setShowVendorModal(false);
    setNewVendor({ name: "", email: "", phone: "", address: "", paymentTerm: "", bankDetails: "", companyDetails: "" });
  };

  const getPOStatusColor = (status: PurchaseOrderStatus) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "sent": return "bg-blue-100 text-blue-800";
      case "purchase": return "bg-green-100 text-green-800";
      case "done": return "bg-purple-100 text-purple-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 capitalize">Purchase Management</h1>
          <p className="text-gray-500 mt-1">Manage RFQs, purchase orders, vendor relationships, and goods receipt.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowVendorModal(true)}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Add Vendor
          </button>
          {vendors.length > 0 && (
            <button 
              onClick={() => setShowCreate(!showCreate)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New PO
            </button>
          )}
        </div>
      </div>

      {showVendorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">Add New Vendor</h2>
            <form onSubmit={handleCreateVendor} className="space-y-4">
              <div><label className="block text-sm">Company Name</label><input required value={newVendor.name} onChange={e=>setNewVendor({...newVendor, name: e.target.value})} className="w-full border rounded p-2" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm">Email</label><input type="email" value={newVendor.email} onChange={e=>setNewVendor({...newVendor, email: e.target.value})} className="w-full border rounded p-2" /></div>
                <div><label className="block text-sm">Phone</label><input value={newVendor.phone} onChange={e=>setNewVendor({...newVendor, phone: e.target.value})} className="w-full border rounded p-2" /></div>
              </div>
              <div><label className="block text-sm">Address</label><textarea value={newVendor.address} onChange={e=>setNewVendor({...newVendor, address: e.target.value})} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm">Company Details / Tax ID</label><input value={newVendor.companyDetails} onChange={e=>setNewVendor({...newVendor, companyDetails: e.target.value})} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm">Bank Details (Account / Routing)</label><input value={newVendor.bankDetails} onChange={e=>setNewVendor({...newVendor, bankDetails: e.target.value})} className="w-full border rounded p-2" /></div>
              <div className="flex gap-3 justify-end mt-4">
                <button type="button" onClick={() => setShowVendorModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {vendors.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">No Vendors Configured</h3>
              <p className="text-yellow-700">Add vendors before creating purchase orders. Vendors are needed for procurement.</p>
            </div>
          </div>
        </div>
      )}

      {showCreate && vendors.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 transition-all">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">New Purchase Order</h2>
          <form onSubmit={handleCreatePO} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <select 
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">Select vendor...</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Destination (On Receive)</label>
                <select 
                  value={destination}
                  onChange={(e) => setDestination(e.target.value as WarehouseLocation)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="raw_material">Raw Material Stock</option>
                  <option value="packaging_material">Packaging Material Stock</option>
                  <option value="dry_storage">General Dry Storage</option>
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
                          {rawMaterials.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.cost)})</option>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={taxInclusive} onChange={e => setTaxInclusive(e.target.checked)} />
                    Prices Include Tax
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    Tax Rate %:
                    <input type="number" value={taxRatePct} onChange={e => setTaxRatePct(Number(e.target.value))} className="w-16 border rounded px-2 py-1" />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Bill PDF (Optional)</label>
                  <input type="file" accept="application/pdf" onChange={e => setBillPdf(e.target.files?.[0]?.name || "")} className="text-sm" />
                  {billPdf && <p className="text-xs text-indigo-600 mt-1">Attached: {billPdf}</p>}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2 ml-auto w-full max-w-sm">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Untaxed Amount</span>
                  <span className="font-medium">{formatCurrency(untaxed)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax ({taxRatePct}%)</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-gray-300 pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button type="submit" className="flex-1 bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Save Order
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PO Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800 uppercase">Total POs</p>
            <p className="text-2xl font-bold text-blue-900">{purchaseOrders.length}</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-green-800 uppercase">Completed</p>
            <p className="text-2xl font-bold text-green-900">{purchaseOrders.filter(po => po.status === "done").length}</p>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-orange-800 uppercase">Pending</p>
            <p className="text-2xl font-bold text-orange-900">{purchaseOrders.filter(po => po.status === "sent" || po.status === "purchase").length}</p>
          </div>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Purchase Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">PO#</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {purchaseOrders.map((po) => {
                const vendor = vendors.find(v => v.id === po.vendorId);
                return (
                  <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {po.name} {po.billPdf && <span title={`Bill Attached: ${po.billPdf}`} className="ml-1 text-red-500">📄</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{vendor?.name || po.vendorId}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{po.lines.length} items</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(po.amountTotal)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{po.dateOrder}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{po.datePlanned}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getPOStatusColor(po.status)}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      {(po.status === "sent" || po.status === "purchase") && (
                        <button 
                          onClick={() => updatePOStatus(po.id, "done")}
                          className="text-green-600 hover:text-green-800 font-medium bg-green-50 px-3 py-1 rounded"
                          title="Mark as received"
                        >
                          Received
                        </button>
                      )}
                      {po.status === "done" && (
                        <span className="text-gray-400 text-sm">Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {purchaseOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No purchase orders found.
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

export default PurchasePage;