"use client";

import React, { useState, useEffect } from "react";
import { useErp, WarehouseLocation } from "@/providers/ErpProvider";

const BarcodePage = () => {
  const { products, inventory, updateInventory } = useErp();
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [actionType, setActionType] = useState<"info" | "add" | "remove">("info");
  const [qty, setQty] = useState(1);
  const [location, setLocation] = useState<WarehouseLocation>("dry_storage");
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    // Search by barcode or default code
    const product = products.find(p => p.barcode === barcodeInput || p.defaultCode === barcodeInput);
    
    if (product) {
      setScannedProduct(product);
      
      if (actionType === "add") {
        updateInventory(product.id, location, qty);
        setLastAction(`Added ${qty} ${product.unit} to ${location.replace("_", " ")}`);
        setBarcodeInput("");
      } else if (actionType === "remove") {
        updateInventory(product.id, location, -qty);
        setLastAction(`Removed ${qty} ${product.unit} from ${location.replace("_", " ")}`);
        setBarcodeInput("");
      } else {
        setLastAction("Product found.");
      }
    } else {
      setScannedProduct(null);
      setLastAction("Product not found. Please try again.");
    }
  };

  const getProductInventory = (productId: string) => {
    return inventory.filter(i => i.productId === productId);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col">
      <h1 className="text-3xl font-bold text-gray-800 mb-2 capitalize">Barcode Scanner</h1>
      <p className="text-gray-500 mb-8">Scan items to quickly update stock or view details.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Scanner Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[500px]">
          <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 animate-[scan_2s_ease-in-out_infinite]"></div>
            <div className="text-center p-6">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <p className="text-gray-500 font-medium">Ready to scan...</p>
            </div>
          </div>

          <div className="mb-4 flex gap-2 border-b border-gray-200 pb-4">
            <button 
              onClick={() => setActionType("info")} 
              className={`flex-1 py-2 rounded-md font-medium text-sm transition-colors ${actionType === "info" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Get Info
            </button>
            <button 
              onClick={() => setActionType("add")} 
              className={`flex-1 py-2 rounded-md font-medium text-sm transition-colors ${actionType === "add" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Add Stock
            </button>
            <button 
              onClick={() => setActionType("remove")} 
              className={`flex-1 py-2 rounded-md font-medium text-sm transition-colors ${actionType === "remove" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Remove
            </button>
          </div>

          {(actionType === "add" || actionType === "remove") && (
            <div className="flex gap-4 mb-4">
              <div className="w-1/3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                <input 
                  type="number" 
                  value={qty} 
                  onChange={(e) => setQty(Number(e.target.value) || 1)}
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                <select 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value as WarehouseLocation)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
                >
                  <option value="dry_storage">Dry Storage</option>
                  <option value="cold_storage">Cold Storage</option>
                  <option value="finished_goods">Finished Goods</option>
                  <option value="factory">Factory Floor</option>
                </select>
              </div>
            </div>
          )}

          <form onSubmit={handleScan} className="flex gap-2">
            <input
              type="text"
              autoFocus
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Scan or type barcode (e.g. 123456789)"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Submit
            </button>
          </form>
          
          {lastAction && (
            <p className={`mt-4 text-sm font-medium ${lastAction.includes("not found") ? "text-red-600" : "text-green-600"}`}>
              {lastAction}
            </p>
          )}
        </div>

        {/* Results Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-[500px] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Product Information</h2>
          
          {scannedProduct ? (
            <div>
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold ${
                  scannedProduct.type === "finished_good" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {scannedProduct.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{scannedProduct.name}</h3>
                  <p className="text-gray-500 font-mono">{scannedProduct.defaultCode} | Barcode: {scannedProduct.barcode}</p>
                  <span className="inline-block mt-2 px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium capitalize">
                    {scannedProduct.category} • {scannedProduct.type.replace("_", " ")}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Standard Cost</p>
                  <p className="text-xl font-bold text-gray-900">${scannedProduct.cost.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Sales Price</p>
                  <p className="text-xl font-bold text-gray-900">${scannedProduct.price.toFixed(2)}</p>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3">Inventory Across Locations</h4>
              <div className="space-y-3">
                {getProductInventory(scannedProduct.id).length > 0 ? (
                  getProductInventory(scannedProduct.id).map((inv, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{inv.location.replace("_", " ")}</p>
                        {inv.lotNumber && <p className="text-xs text-gray-500 font-mono">Lot: {inv.lotNumber}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-indigo-600 text-lg">{inv.quantity} <span className="text-sm font-normal text-gray-500">{scannedProduct.unit}</span></p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic p-4 bg-gray-50 rounded-lg text-center">No inventory found for this product.</p>
                )}
                
                {getProductInventory(scannedProduct.id).length > 0 && (
                  <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg mt-2">
                    <p className="font-semibold text-indigo-900">Total On Hand</p>
                    <p className="font-bold text-indigo-700 text-xl">
                      {getProductInventory(scannedProduct.id).reduce((sum, i) => sum + i.quantity, 0)} <span className="text-sm font-normal">{scannedProduct.unit}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-50">
              <svg className="w-24 h-24 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-gray-500 text-lg">Scan a product to see details</p>
            </div>
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}} />
    </div>
  );
};

export default BarcodePage;
