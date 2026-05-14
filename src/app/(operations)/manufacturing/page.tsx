"use client";

import React, { useState } from "react";
import { useErp, ManufacturingOrder, MOStatus } from "@/providers/ErpProvider";

const ManufacturingPage = () => {
  const { products, boms, manufacturingOrders, createMO, updateMOStatus } = useErp();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedBomId, setSelectedBomId] = useState("");
  const [quantity, setQuantity] = useState(10);
  const [priority, setPriority] = useState<"0" | "1" | "2">("1");

  // Processing Modal State
  const [processingMo, setProcessingMo] = useState<ManufacturingOrder | null>(null);
  const [processStep, setProcessStep] = useState<1 | 2 | 3>(1);
  const [actualConsumed, setActualConsumed] = useState<{productId: string, quantity: number}[]>([]);
  const [actualProduced, setActualProduced] = useState<number>(0);

  const getBomById = (id: string) => boms.find(b => b.id === id);
  const getProductById = (id: string) => products.find(p => p.id === id);
  const getProductName = (id: string) => getProductById(id)?.name || id;

  const handleCreateMO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBomId || quantity <= 0) return;

    const bom = getBomById(selectedBomId);
    if (!bom) return;

    const newMo: ManufacturingOrder = {
      id: `MO${Date.now()}`,
      name: `MO-${Date.now()}`,
      productId: bom.productId,
      productQty: Number(quantity),
      qtyProduced: 0,
      status: "draft",
      date: new Date().toISOString().split("T")[0],
      scheduledDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      bomId: bom.id,
      locationSrc: "dry_storage",
      locationDest: "finished_goods",
      priority,
      origin: "manual",
    };
    
    createMO(newMo);
    setShowCreate(false);
    setSelectedBomId("");
    setQuantity(10);
    setPriority("1");
  };

  const startProcessing = (mo: ManufacturingOrder) => {
    setProcessingMo(mo);
    setProcessStep(1);
    const bom = getBomById(mo.bomId);
    if (bom) {
      setActualConsumed(bom.components.map(c => ({
        productId: c.productId,
        quantity: c.quantity * mo.productQty * (1 + (c.wastePercentage || 0) / 100)
      })));
    }
    setActualProduced(mo.productQty);
    
    // Change status to progress if it was confirmed
    if (mo.status === "confirmed") {
      updateMOStatus(mo.id, "progress");
    }
  };

  const handleUpdateConsumed = (productId: string, val: number) => {
    setActualConsumed(prev => prev.map(c => c.productId === productId ? { ...c, quantity: val } : c));
  };

  const finishProcessing = () => {
    if (!processingMo) return;
    updateMOStatus(processingMo.id, "done", actualProduced, actualConsumed);
    setProcessingMo(null);
  };

  const getStatusColor = (status: MOStatus) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "progress": return "bg-yellow-100 text-yellow-800";
      case "done": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "0": return "bg-green-100 text-green-800";
      case "1": return "bg-yellow-100 text-yellow-800";
      case "2": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const rawMaterials = actualConsumed.filter(c => getProductById(c.productId)?.category !== 'packaging');
  const packagingMaterials = actualConsumed.filter(c => getProductById(c.productId)?.category === 'packaging');

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 capitalize">Manufacturing Unit</h1>
          <p className="text-gray-500 mt-1">Manage production runs, record actual consumption, and track WIP.</p>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New MO
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 transition-all">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">New Manufacturing Order</h2>
          <form onSubmit={handleCreateMO} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bill of Materials</label>
              <select 
                value={selectedBomId}
                onChange={(e) => setSelectedBomId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              >
                <option value="">Select a BOM...</option>
                {boms.filter(b => b.isActive).map(b => (
                  <option key={b.id} value={b.id}>{b.name} - {getProductName(b.productId)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input 
                type="number" 
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value as "0" | "1" | "2")}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="0">Low</option>
                <option value="1">Normal</option>
                <option value="2">High</option>
              </select>
            </div>
            <button 
              type="submit"
              className="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-lg font-medium transition-colors h-10"
            >
              Create
            </button>
          </form>
        </div>
      )}

      {/* Processing Modal */}
      {processingMo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Process Manufacturing Run</h2>
                <p className="text-sm text-gray-500">{processingMo.name} - {getProductName(processingMo.productId)}</p>
              </div>
              <button onClick={() => setProcessingMo(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              {/* Stepper */}
              <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 z-0 rounded-full"></div>
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-indigo-600 z-0 rounded-full transition-all duration-300" style={{ width: processStep === 1 ? '0%' : processStep === 2 ? '50%' : '100%' }}></div>
                
                {[1, 2, 3].map((step) => (
                  <div key={step} className={`relative z-10 flex flex-col items-center justify-center w-8 h-8 rounded-full font-bold text-sm border-2 ${processStep >= step ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-400 border-gray-300'}`}>
                    {step}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs font-medium text-gray-500 mb-6">
                <span>Raw Materials</span>
                <span>Packaging</span>
                <span>Finished Goods</span>
              </div>

              {processStep === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-lg font-semibold text-gray-800">Step 1: Raw Material Usage</h3>
                  <p className="text-sm text-gray-500 mb-4">Confirm or adjust the actual quantities of raw materials used during production.</p>
                  
                  {rawMaterials.length > 0 ? (
                    <div className="space-y-3">
                      {rawMaterials.map((c) => {
                        const product = getProductById(c.productId);
                        return (
                          <div key={c.productId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div>
                              <p className="font-medium text-gray-800">{product?.name || c.productId}</p>
                              <p className="text-xs text-gray-500">Expected: {c.quantity.toFixed(2)} {product?.unit}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                step="0.01" 
                                value={c.quantity} 
                                onChange={(e) => handleUpdateConsumed(c.productId, Number(e.target.value))}
                                className="w-24 border border-gray-300 rounded-md px-3 py-1.5 text-right focus:ring-indigo-500 focus:border-indigo-500"
                              />
                              <span className="text-sm text-gray-600">{product?.unit}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">No raw materials found in BOM.</div>
                  )}
                </div>
              )}

              {processStep === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-lg font-semibold text-gray-800">Step 2: Packaging Materials</h3>
                  <p className="text-sm text-gray-500 mb-4">Confirm or adjust the packaging items consumed.</p>
                  
                  {packagingMaterials.length > 0 ? (
                    <div className="space-y-3">
                      {packagingMaterials.map((c) => {
                        const product = getProductById(c.productId);
                        return (
                          <div key={c.productId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div>
                              <p className="font-medium text-gray-800">{product?.name || c.productId}</p>
                              <p className="text-xs text-gray-500">Expected: {c.quantity.toFixed(2)} {product?.unit}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                step="0.01" 
                                value={c.quantity} 
                                onChange={(e) => handleUpdateConsumed(c.productId, Number(e.target.value))}
                                className="w-24 border border-gray-300 rounded-md px-3 py-1.5 text-right focus:ring-indigo-500 focus:border-indigo-500"
                              />
                              <span className="text-sm text-gray-600">{product?.unit}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">No packaging materials found in BOM.</div>
                  )}
                </div>
              )}

              {processStep === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-lg font-semibold text-gray-800">Step 3: Finished Product Yield</h3>
                  <p className="text-sm text-gray-500 mb-4">Enter the final quantity of finished goods produced. These will be automatically added to <strong>company stock</strong>.</p>
                  
                  <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 flex flex-col items-center justify-center space-y-3">
                    <p className="font-medium text-indigo-900 text-lg">{getProductName(processingMo.productId)}</p>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        step="0.01" 
                        value={actualProduced} 
                        onChange={(e) => setActualProduced(Number(e.target.value))}
                        className="w-32 text-xl font-bold border border-indigo-300 rounded-lg px-4 py-2 text-center text-indigo-900 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <span className="text-lg font-medium text-indigo-800">{getProductById(processingMo.productId)?.unit}</span>
                    </div>
                    <p className="text-sm text-indigo-700">Target Quantity: {processingMo.productQty}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              {processStep > 1 ? (
                <button onClick={() => setProcessStep(s => (s - 1) as 1 | 2 | 3)} className="px-5 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors shadow-sm">
                  Back
                </button>
              ) : (
                <div></div>
              )}
              
              {processStep < 3 ? (
                <button onClick={() => setProcessStep(s => (s + 1) as 1 | 2 | 3)} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm">
                  Next Step
                </button>
              ) : (
                <button onClick={finishProcessing} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Confirm & Complete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BoM List Summary */}
      {boms.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Active Bill of Materials</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">BOM Name</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Components</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {boms.filter(b => b.isActive).map((bom) => (
                  <tr key={bom.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{bom.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{getProductName(bom.productId)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {bom.components.map((c, i) => (
                        <span key={i} className="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-1">
                          {c.quantity} {c.unit} {getProductName(c.productId)}
                          {c.wastePercentage ? ` (+${c.wastePercentage}% waste)` : ''}
                        </span>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${bom.type === 'normal' ? 'bg-blue-100 text-blue-800' : bom.type === 'phantom' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>
                        {bom.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Produced</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">BOM</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {manufacturingOrders.map((mo) => {
                const product = getProductById(mo.productId);
                const bom = getBomById(mo.bomId);
                return (
                  <tr key={mo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{mo.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{product?.name || "Unknown"}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{mo.productQty} {product?.unit}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{mo.qtyProduced} {product?.unit}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{bom?.name || mo.bomId}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{mo.scheduledDate}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(mo.priority)}`}>
                        {mo.priority === "0" ? "Low" : mo.priority === "1" ? "Normal" : "High"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(mo.status)}`}>
                        {mo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      {mo.status === "draft" && (
                        <button 
                          onClick={() => updateMOStatus(mo.id, "confirmed")}
                          className="text-blue-600 hover:text-blue-800 font-medium mr-4"
                        >
                          Confirm
                        </button>
                      )}
                      {mo.status === "confirmed" && (
                        <button 
                          onClick={() => startProcessing(mo)}
                          className="text-yellow-600 hover:text-yellow-800 font-medium mr-4"
                        >
                          Process Run
                        </button>
                      )}
                      {mo.status === "progress" && (
                        <button 
                          onClick={() => startProcessing(mo)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 px-3 py-1 rounded-md mr-4"
                        >
                          Continue
                        </button>
                      )}
                      {(mo.status === "progress" || mo.status === "confirmed") && (
                        <button 
                          onClick={() => updateMOStatus(mo.id, "cancelled")}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {manufacturingOrders.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    No manufacturing orders found. Create one to get started.
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

export default ManufacturingPage;
