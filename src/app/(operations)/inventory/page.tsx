"use client";

import React, { useState, useMemo } from "react";
import { useErp } from "@/providers/ErpProvider";
import type { WarehouseLocation, StockMoveType } from "@/providers/ErpProvider";
import { useCurrency } from "@/hooks/useCurrency";
import { useToast } from "@/components/Toast";

const LOCATION_LABELS: Record<string, string> = {
  dry_storage: "Dry Storage",
  raw_material: "Raw Material",
  finished_goods: "Finished Goods",
  shipping_area: "Shipping Area",
  factory: "Factory",
  packaging_material: "Packaging Material",
};

const LOCATION_COLORS: Record<string, string> = {
  dry_storage: "bg-amber-100 text-amber-800",
  raw_material: "bg-sky-100 text-sky-800",
  finished_goods: "bg-emerald-100 text-emerald-800",
  shipping_area: "bg-violet-100 text-violet-800",
  factory: "bg-orange-100 text-orange-800",
  packaging_material: "bg-indigo-100 text-indigo-800",
};

interface StockEdit {
  id: string;
  productId: string;
  productName: string;
  productUnit: string;
  quantity: number;
  location: string;
  date: string;
  time: string;
  type: "purchase";
  lotNumber?: string;
}

interface StockTransfer {
  id: string;
  productId: string;
  productName: string;
  productUnit: string;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  moveType: string;
  date: string;
  time: string;
  lotNumber?: string;
}

export default function InventoryPage() {
  const { products, inventory, stockMoves, manufacturingOrders, boms, processStockMove, updateInventory, updateProduct } = useErp();
  const { formatCurrency } = useCurrency();
  const { addToast } = useToast();

  const [tab, setTab] = useState<"all" | "raw_material" | "finished_good">("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showLast5only, setShowLast5only] = useState(true);
  const [editingStockMove, setEditingStockMove] = useState<StockEdit | null>(null);
  const [editingTransfer, setEditingTransfer] = useState<StockTransfer | null>(null);
  const [historyTab, setHistoryTab] = useState<"additions" | "transfers">("additions");
  const [historyDateFilter, setHistoryDateFilter] = useState("");
  const [historyLotFilter, setHistoryLotFilter] = useState("");
  const [historyYearFilter, setHistoryYearFilter] = useState("");
  const [historyMonthFilter, setHistoryMonthFilter] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "addition" | "transfer", id: string } | null>(null);
  const [deletedIds, setDeletedIds] = useState<Record<string, boolean>>({});

  const [buyForm, setBuyForm] = useState({
    productId: "",
    productQty: 0,
    locationDest: "dry_storage" as WarehouseLocation,
    lotNumber: ""
  });

  const [moveForm, setMoveForm] = useState({
    productId: "",
    productQty: 0,
    locationSrc: "dry_storage" as WarehouseLocation,
    locationDest: "finished_goods" as WarehouseLocation,
    moveType: "internal" as StockMoveType,
    lotNumber: ""
  });

  const getProduct = (id: string) => products.find(p => p.id === id);

  const getCurrentStock = (productId: string) => {
    return inventory.filter(i => i.productId === productId).reduce((s, i) => s + i.quantity, 0);
  };

  const getRawMaterialStock = () => {
    return inventory
      .filter(i => {
        const p = getProduct(i.productId);
        return p?.type === "raw_material";
      })
      .reduce((s, i) => s + i.quantity, 0);
  };

  const getFinishedGoodsStock = () => {
    return inventory
      .filter(i => {
        const p = getProduct(i.productId);
        return p?.type === "finished_good";
      })
      .reduce((s, i) => s + i.quantity, 0);
  };

  const allInventoryItems = useMemo(() => {
    return inventory.map(item => {
      const product = getProduct(item.productId);
      return { ...item, product };
    });
  }, [inventory, products]);

  const filtered = useMemo(() => {
    return allInventoryItems.filter(item => {
      if (!item.product) return false;
      if (tab === "raw_material" && item.product.type !== "raw_material") return false;
      if (tab === "finished_good" && item.product.type !== "finished_good") return false;
      if (locationFilter !== "all" && item.location !== locationFilter) return false;
      if (search && !item.product.name.toLowerCase().includes(search.toLowerCase()) && !(item.lotNumber || "").toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allInventoryItems, tab, locationFilter, search]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayPurchases = stockMoves.filter(m => m.origin === "Manual Purchase" && m.date === today);
    const todayTransfers = stockMoves.filter(m => m.origin !== "Manual Purchase" && m.date === today);

    const rawItems = inventory.filter(i => {
      const p = products.find(pr => pr.id === i.productId);
      return p?.type === "raw_material";
    });
    const finishedItems = inventory.filter(i => {
      const p = products.find(pr => pr.id === i.productId);
      return p?.type === "finished_good";
    });

    return {
      rawMaterialStock: getRawMaterialStock(),
      finishedGoodsStock: getFinishedGoodsStock(),
      rawMaterialValue: rawItems.reduce((s, i) => {
        const p = products.find(pr => pr.id === i.productId);
        return s + (p?.cost || 0) * i.quantity;
      }, 0),
      finishedGoodsValue: finishedItems.reduce((s, i) => {
        const p = products.find(pr => pr.id === i.productId);
        return s + (p?.cost || 0) * i.quantity;
      }, 0),
      totalSkus: new Set(inventory.map(i => i.productId)).size,
      lowStockCount: products.filter(p => {
        const qty = getCurrentStock(p.id);
        return qty < p.minReorderQty && p.active;
      }).length,
      todayPurchaseCount: todayPurchases.length,
      todayTransferCount: todayTransfers.length,
      todayPurchaseValue: todayPurchases.reduce((s, m) => s + (getProduct(m.productId)?.cost || 0) * m.productQty, 0),
      todayTransferValue: todayTransfers.reduce((s, m) => s + (getProduct(m.productId)?.cost || 0) * m.productQty, 0),
    };
  }, [inventory, products, stockMoves]);

  const lowStockProducts = useMemo(() => products.filter(p => {
    const qty = getCurrentStock(p.id);
    return qty < p.minReorderQty && p.active;
  }).map(p => ({
    ...p,
    currentQty: getCurrentStock(p.id)
  })), [products, inventory]);

  const stockAdditions = useMemo((): StockEdit[] => {
    const now = new Date();
    return stockMoves
      .filter(m => m.origin === "Manual Purchase" && !deletedIds[m.id])
      .map(m => ({
        id: m.id,
        productId: m.productId,
        productName: getProduct(m.productId)?.name || m.productId,
        productUnit: getProduct(m.productId)?.unit || "",
        quantity: m.productQty,
        location: LOCATION_LABELS[m.locationDest] || m.locationDest,
        date: m.date,
        time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        type: "purchase" as const,
        lotNumber: m.lotNumber || ""
      }))
      .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(b.time));
  }, [stockMoves, deletedIds]);

  const stockTransfers = useMemo((): StockTransfer[] => {
    const now = new Date();
    return stockMoves
      .filter(m => m.origin !== "Manual Purchase" && !deletedIds[m.id])
      .map(m => ({
        id: m.id,
        productId: m.productId,
        productName: getProduct(m.productId)?.name || m.productId,
        productUnit: getProduct(m.productId)?.unit || "",
        quantity: m.productQty,
        fromLocation: LOCATION_LABELS[m.locationSrc] || m.locationSrc,
        toLocation: LOCATION_LABELS[m.locationDest] || m.locationDest,
        moveType: m.moveType,
        date: m.date,
        time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        lotNumber: m.lotNumber || ""
      }))
      .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(b.time));
  }, [stockMoves, deletedIds]);

  const filteredAdditions = useMemo(() => {
    return stockAdditions.filter(a => {
      if (deletedIds[a.id]) return false;
      if (historyDateFilter && a.date !== historyDateFilter) return false;
      if (historyYearFilter && !a.date.startsWith(historyYearFilter)) return false;
      if (historyMonthFilter && !a.date.substring(0, 7).includes(`-${historyMonthFilter}`)) return false;
      if (historyLotFilter && !a.lotNumber?.toLowerCase().includes(historyLotFilter.toLowerCase())) return false;
      return true;
    });
  }, [stockAdditions, historyDateFilter, historyYearFilter, historyMonthFilter, historyLotFilter, deletedIds]);

  const filteredTransfers = useMemo(() => {
    return stockTransfers.filter(t => {
      if (deletedIds[t.id]) return false;
      if (historyDateFilter && t.date !== historyDateFilter) return false;
      if (historyYearFilter && !t.date.startsWith(historyYearFilter)) return false;
      if (historyMonthFilter && !t.date.substring(0, 7).includes(`-${historyMonthFilter}`)) return false;
      if (historyLotFilter && !t.lotNumber?.toLowerCase().includes(historyLotFilter.toLowerCase())) return false;
      return true;
    });
  }, [stockTransfers, historyDateFilter, historyYearFilter, historyMonthFilter, historyLotFilter, deletedIds]);

  const handleBuyStock = (e: React.FormEvent) => {
    e.preventDefault();
    const { productId, productQty, locationDest, lotNumber } = buyForm;
    const product = getProduct(productId);

    if (editingStockMove) {
      const diff = productQty - editingStockMove.quantity;
      updateInventory(productId, locationDest, diff, lotNumber);
      addToast({ type: "success", title: "Stock Updated", message: `Updated ${product?.name} by ${diff > 0 ? "+" : ""}${diff} units` });
    } else {
      updateInventory(productId, locationDest, productQty, lotNumber);
      addToast({ type: "success", title: "Purchase Recorded", message: `Added ${productQty} ${product?.unit} of ${product?.name}` });
    }

    processStockMove({
      id: editingStockMove ? editingStockMove.id : `sm-${Date.now()}`,
      productId,
      productQty,
      locationSrc: "shipping_area",
      locationDest,
      moveType: "incoming",
      status: "done",
      date: new Date().toISOString().split("T")[0],
      origin: "Manual Purchase",
      lotNumber
    });

    setShowBuyModal(false);
    setBuyForm({ productId: "", productQty: 0, locationDest: "dry_storage", lotNumber: "" });
    setEditingStockMove(null);
  };

  const handleMoveStock = (e: React.FormEvent) => {
    e.preventDefault();
    const { productId, productQty, locationSrc, locationDest, moveType, lotNumber } = moveForm;
    const product = getProduct(productId);

    if (editingTransfer) {
      const diff = productQty - editingTransfer.quantity;
      updateInventory(productId, locationSrc, -diff, lotNumber);
      updateInventory(productId, locationDest, diff, lotNumber);
      addToast({ type: "success", title: "Transfer Updated", message: `Updated ${product?.name} transfer by ${diff > 0 ? "+" : ""}${diff}` });
    } else {
      if (moveType === "outgoing" || moveType === "internal") {
        updateInventory(productId, locationSrc, -productQty, lotNumber);
      }
      if (moveType === "internal") {
        updateInventory(productId, locationDest, productQty, lotNumber);
      }
      addToast({ type: "success", title: "Stock Moved", message: `${productQty} ${product?.unit} transferred` });
    }

    processStockMove({
      id: editingTransfer ? editingTransfer.id : `sm-${Date.now()}`,
      productId,
      productQty,
      locationSrc,
      locationDest,
      moveType,
      status: "done",
      date: new Date().toISOString().split("T")[0],
      origin: "Manual Transfer",
      lotNumber
    });

    setShowMoveModal(false);
    setMoveForm({ productId: "", productQty: 0, locationSrc: "dry_storage", locationDest: "finished_goods", moveType: "internal", lotNumber: "" });
    setEditingTransfer(null);
  };

  const openEditBuy = (edit: StockEdit) => {
    setEditingStockMove(edit);
    setBuyForm({
      productId: edit.productId,
      productQty: edit.quantity,
      locationDest: Object.entries(LOCATION_LABELS).find(([_, v]) => v === edit.location)?.[0] as WarehouseLocation || "dry_storage",
      lotNumber: ""
    });
    setShowBuyModal(true);
  };

  const openEditMove = (edit: StockTransfer) => {
    setEditingTransfer(edit);
    setMoveForm({
      productId: edit.productId,
      productQty: edit.quantity,
      locationSrc: Object.entries(LOCATION_LABELS).find(([_, v]) => v === edit.fromLocation)?.[0] as WarehouseLocation || "dry_storage",
      locationDest: Object.entries(LOCATION_LABELS).find(([_, v]) => v === edit.toLocation)?.[0] as WarehouseLocation || "finished_goods",
      moveType: edit.moveType as StockMoveType,
      lotNumber: ""
    });
    setShowMoveModal(true);
  };

  const handleDelete = (type: "addition" | "transfer", id: string) => {
    setDeleteConfirm({ type, id });
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;

    const { type, id } = deleteConfirm;
    const stockMove = stockMoves.find(m => m.id === id);
    if (!stockMove) {
      setDeleteConfirm(null);
      return;
    }

    if (type === "addition") {
      updateInventory(stockMove.productId, stockMove.locationDest, -stockMove.productQty, stockMove.lotNumber);
      addToast({ type: "warning", title: "Stock Deleted", message: `Removed ${stockMove.productQty} units from inventory` });
    } else {
      if (stockMove.moveType === "outgoing" || stockMove.moveType === "internal") {
        updateInventory(stockMove.productId, stockMove.locationSrc, stockMove.productQty, stockMove.lotNumber);
      }
      if (stockMove.moveType === "internal") {
        updateInventory(stockMove.productId, stockMove.locationDest, -stockMove.productQty, stockMove.lotNumber);
      }
      addToast({ type: "warning", title: "Transfer Deleted", message: `Reversed transfer of ${stockMove.productQty} units` });
    }

    setDeletedIds(prev => ({ ...prev, [id]: true }));
    setDeleteConfirm(null);
  };

  const selectedBuyProduct = buyForm.productId ? getProduct(buyForm.productId) : null;
  const buyCurrentStock = selectedBuyProduct ? getCurrentStock(buyForm.productId) : 0;
  const now = new Date();

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Inventory Management</h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">Real-time stock levels & warehouse tracking</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowHistory(true)} className="inline-flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl font-semibold shadow transition-all bg-slate-600 hover:bg-slate-700 text-white text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <span className="hidden sm:inline">History</span>
          </button>
          <button onClick={() => { setEditingStockMove(null); setBuyForm({ productId: "", productQty: 0, locationDest: "dry_storage", lotNumber: "" }); setShowBuyModal(true); }} className="inline-flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl font-semibold shadow transition-all bg-amber-500 hover:bg-amber-600 text-white text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span className="hidden sm:inline">Add Stock</span>
          </button>
          <button onClick={() => { setEditingTransfer(null); setMoveForm({ productId: "", productQty: 0, locationSrc: "dry_storage", locationDest: "finished_goods", moveType: "internal", lotNumber: "" }); setShowMoveModal(true); }} className="inline-flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl font-semibold shadow transition-all bg-indigo-500 hover:bg-indigo-600 text-white text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            <span className="hidden sm:inline">Transfer</span>
          </button>
        </div>
      </div>

      {/* Redesigned Stats Cards - Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-4 mb-6 sm:mb-8">
        {/* Card 1: Today's Purchases */}
        <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">📥</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Today</span>
          </div>
          <p className="text-3xl font-bold">{stats.todayPurchaseCount}</p>
          <p className="text-xs text-white/80">Purchases</p>
        </div>

        {/* Card 2: Today's Transfers */}
        <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">↔</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Today</span>
          </div>
          <p className="text-3xl font-bold">{stats.todayTransferCount}</p>
          <p className="text-xs text-white/80">Transfers</p>
        </div>

        {/* Card 3: Raw Materials */}
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🌾</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Stock</span>
          </div>
          <p className="text-3xl font-bold">{stats.rawMaterialStock.toFixed(0)}</p>
          <p className="text-xs text-white/80">Raw Materials</p>
        </div>

        {/* Card 4: Finished Goods */}
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">📦</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Stock</span>
          </div>
          <p className="text-3xl font-bold">{stats.finishedGoodsStock.toFixed(0)}</p>
          <p className="text-xs text-white/80">Finished Goods</p>
        </div>

        {/* Card 5: Low Stock */}
        <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">⚠️</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Alert</span>
          </div>
          <p className="text-3xl font-bold">{stats.lowStockCount}</p>
          <p className="text-xs text-white/80">Low Stock</p>
        </div>

        {/* Card 6: Total SKUs */}
        <div className="bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">📋</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Active</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalSkus}</p>
          <p className="text-xs text-white/80">Total SKUs</p>
        </div>
      </div>

      {/* Value Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl">💰</div>
            <div>
              <h3 className="font-bold text-slate-800">Stock Value</h3>
              <p className="text-xs text-slate-500">Total inventory value</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-xs text-amber-600 uppercase tracking-wider">Raw Materials</p>
              <p className="text-xl font-bold text-amber-800">{formatCurrency(stats.rawMaterialValue)}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4">
              <p className="text-xs text-emerald-600 uppercase tracking-wider">Finished Goods</p>
              <p className="text-xl font-bold text-emerald-800">{formatCurrency(stats.finishedGoodsValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-xl">📊</div>
            <div>
              <h3 className="font-bold text-slate-800">Today's Activity</h3>
              <p className="text-xs text-slate-500">Movement summary</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-xs text-amber-600 uppercase tracking-wider">Purchased</p>
              <p className="text-xl font-bold text-amber-800">{formatCurrency(stats.todayPurchaseValue)}</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4">
              <p className="text-xs text-indigo-600 uppercase tracking-wider">Transferred</p>
              <p className="text-xl font-bold text-indigo-800">{formatCurrency(stats.todayTransferValue)}</p>
            </div>
          </div>
        </div>
      </div>



      {/* Low Stock Alert Banner */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <h3 className="font-bold text-red-800">Low Stock Alert — {lowStockProducts.length} item{lowStockProducts.length > 1 ? "s" : ""} need restocking</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map(p => {
              const pct = Math.min((p.currentQty / p.minReorderQty) * 100, 100);
              return (
                <div key={p.id} className="bg-white rounded-xl p-4 border border-red-100">
                  <div className="flex justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.defaultCode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-600 font-bold text-sm">{p.currentQty.toFixed(1)}</p>
                      <p className="text-xs text-slate-400">/ {p.minReorderQty} min</p>
                    </div>
                  </div>
                  <div className="w-full bg-red-100 rounded-full h-1.5 mb-2">
                    <div className="bg-red-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <input
                      type="number" min="0" value={p.minReorderQty}
                      onChange={e => {
                        const v = Number(e.target.value);
                        updateProduct(p.id, { minReorderQty: v });
                        if (p.currentQty < v) addToast({ type: "warning", title: "Restock Needed", message: `${p.name} stock (${p.currentQty}) is below new threshold (${v}).` });
                      }}
                      className="w-20 border border-slate-200 rounded-lg px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      title="Alert Threshold"
                    />
                    <button
                      onClick={() => { setBuyForm({ productId: p.id, productQty: p.minReorderQty - p.currentQty, locationDest: "dry_storage", lotNumber: "" }); setShowBuyModal(true); }}
                      className="text-xs text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1 rounded-lg font-medium transition-colors"
                    >
                      + Restock
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs + Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl gap-1">
          {[
            { key: "all", label: "All Stock" },
            { key: "raw_material", label: "Raw Materials" },
            { key: "finished_good", label: "Finished Goods" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === t.key ? "bg-white shadow text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-48" />
          </div>
          <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="all">All Locations</option>
            {Object.entries(LOCATION_LABELS).filter(([k]) => k !== "company_stock").map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Product", "Category", "Location", "Lot / Batch", "Qty On Hand", "Alert Qty", "Unit Cost", "Total Value"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(item => {
                const p = item.product!;
                const totalQty = getCurrentStock(p.id);
                const isLow = totalQty < p.minReorderQty;
                return (
                  <tr key={`${item.productId}-${item.location}-${item.lotNumber}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${p.active ? "bg-emerald-400" : "bg-slate-300"}`} />
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{p.name}</p>
                          <p className="text-xs font-mono text-slate-400">{p.defaultCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium capitalize bg-slate-100 text-slate-600">{p.category || "—"}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${LOCATION_COLORS[item.location] || "bg-slate-100 text-slate-600"}`}>
                        {LOCATION_LABELS[item.location] || item.location}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 font-mono">{item.lotNumber || "—"}</td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-bold ${isLow ? "text-red-600" : "text-slate-800"}`}>
                        {item.quantity.toFixed(2)} <span className="text-xs font-normal text-slate-400">{p.unit}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <input type="number" min="0" value={p.minReorderQty}
                        onChange={e => {
                          const v = Number(e.target.value);
                          updateProduct(p.id, { minReorderQty: v });
                          if (totalQty < v) addToast({ type: "warning", title: "Restock Alert", message: `${p.name} qty (${totalQty}) below new threshold (${v}).` });
                        }}
                        className="w-20 border border-slate-200 rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      />
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatCurrency(p.cost)}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-800">{formatCurrency(p.cost * item.quantity)}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-16 text-center text-slate-400">No inventory records match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Stock Activity Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-400 text-white rounded-lg flex items-center justify-center text-sm">📋</span>
            Recent Stock Activity
          </h2>
          <div className="flex flex-wrap gap-3 items-center">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showLast5only}
                onChange={e => setShowLast5only(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Show last 5 only
            </label>
            <button
              onClick={() => setShowHistory(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              View Full History
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Additions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 border-b border-amber-100">
              <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                📥 Recent Stock Additions
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Product", "Qty", "Location", "Date"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(showLast5only? stockAdditions.slice(0, 5) : stockAdditions).map(move => (
                    <tr key={move.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-3 text-sm font-medium text-slate-800">{move.productName}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-amber-600">{move.quantity.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{move.location}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{move.date}</td>
                    </tr>
                  ))}
                  {stockAdditions.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No recent additions</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Transfers */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 border-b border-indigo-100">
              <h3 className="font-semibold text-indigo-800 flex items-center gap-2">
                ↔ Recent Stock Transfers
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Product", "Qty", "From → To", "Type", "Date"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(showLast5only? stockTransfers.slice(0, 5) : stockTransfers).map(move => (
                    <tr key={move.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-slate-800">{move.productName}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-indigo-600">{move.quantity.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{move.fromLocation.split(" ")[0]} → {move.toLocation.split(" ")[0]}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${move.moveType === "internal" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}`}>
                          {move.moveType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{move.date}</td>
                    </tr>
                  ))}
                  {stockTransfers.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No recent transfers</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {showLast5only&& (stockAdditions.length > 5 || stockTransfers.length > 5) && (
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-500">
              Showing 5 of {stockAdditions.length} additions and {stockTransfers.length} transfers
            </p>
          </div>
        )}
      </div>

      {/* Add Stock Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">{editingStockMove ? "Edit Stock Addition" : "Add Stock"}</h2>
                <button onClick={() => { setShowBuyModal(false); setEditingStockMove(null); }} className="text-slate-400 hover:text-slate-600 p-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleBuyStock} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Product</label>
                <select required value={buyForm.productId} onChange={e => setBuyForm({ ...buyForm, productId: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                  <option value="">Select product…</option>
                  {products.filter(p => p.active).map(p => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
                </select>
              </div>

              {selectedBuyProduct && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Current Stock</p>
                      <p className="text-lg font-bold text-slate-800">{buyCurrentStock.toFixed(2)} {selectedBuyProduct.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Unit Type</p>
                      <p className="text-sm font-semibold text-slate-700">{selectedBuyProduct.unit}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Quantity</label>
                  <input required type="number" min="0.01" step="0.01" value={buyForm.productQty || ""} onChange={e => setBuyForm({ ...buyForm, productQty: Number(e.target.value) })} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Store in</label>
                  <select value={buyForm.locationDest} onChange={e => setBuyForm({ ...buyForm, locationDest: e.target.value as WarehouseLocation })} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                    <option value="dry_storage">Dry Storage</option>
                    <option value="raw_material">Raw Material</option>
                    <option value="finished_goods">Finished Goods</option>
                    <option value="packaging_material">Packaging Material</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Lot / Batch</label>
                <input type="text" value={buyForm.lotNumber || ""} onChange={e => setBuyForm({ ...buyForm, lotNumber: e.target.value })} placeholder="Optional" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-slate-500">Date</p>
                    <p className="font-medium text-slate-800">{now.toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Time</p>
                    <p className="font-medium text-slate-800">{now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm shadow transition-all hover:shadow-md">
                  {editingStockMove ? "Update Stock" : "Add Stock"}
                </button>
                <button type="button" onClick={() => { setShowBuyModal(false); setEditingStockMove(null); }} className="px-6 py-2.5 border border-slate-200 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Stock Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">{editingTransfer ? "Edit Transfer" : "Transfer Stock"}</h2>
                <button onClick={() => { setShowMoveModal(false); setEditingTransfer(null); }} className="text-slate-400 hover:text-slate-600 p-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleMoveStock} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Product</label>
                <select required value={moveForm.productId} onChange={e => setMoveForm({ ...moveForm, productId: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="">Select product…</option>
                  {products.filter(p => p.active).map(p => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Quantity</label>
                  <input required type="number" min="0.01" step="0.01" value={moveForm.productQty || ""} onChange={e => setMoveForm({ ...moveForm, productQty: Number(e.target.value) })} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Transfer Type</label>
                  <select value={moveForm.moveType} onChange={e => setMoveForm({ ...moveForm, moveType: e.target.value as StockMoveType })} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option value="internal">Internal Transfer</option>
                    <option value="outgoing">Outgoing (Shipment)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">From</label>
                  <select value={moveForm.locationSrc} onChange={e => setMoveForm({ ...moveForm, locationSrc: e.target.value as WarehouseLocation })} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    {Object.entries(LOCATION_LABELS).filter(([k]) => k !== "company_stock").map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">To</label>
                  <select value={moveForm.locationDest} onChange={e => setMoveForm({ ...moveForm, locationDest: e.target.value as WarehouseLocation })} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    {Object.entries(LOCATION_LABELS).filter(([k]) => k !== "company_stock").map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Lot / Batch</label>
                <input type="text" value={moveForm.lotNumber || ""} onChange={e => setMoveForm({ ...moveForm, lotNumber: e.target.value })} placeholder="Optional" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-slate-500">Date</p>
                    <p className="font-medium text-slate-800">{now.toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Time</p>
                    <p className="font-medium text-slate-800">{now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow transition-all hover:shadow-md">
                  {editingTransfer ? "Update Transfer" : "Transfer Stock"}
                </button>
                <button type="button" onClick={() => { setShowMoveModal(false); setEditingTransfer(null); }} className="px-6 py-2.5 border border-slate-200 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Confirm Delete</h3>
              <p className="text-slate-500 mb-6">
                Are you sure you want to delete this {deleteConfirm.type === "addition" ? "stock addition" : "stock transfer"}?
                This will also reverse the inventory changes.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDeleteConfirm(null)} className="px-6 py-2.5 border border-slate-200 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button onClick={confirmDelete} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm shadow transition-all">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Stock History</h2>
                <p className="text-sm text-slate-500">View and manage all stock additions and transfers</p>
              </div>
              <button onClick={() => { setShowHistory(false); setHistoryDateFilter(""); setHistoryLotFilter(""); setHistoryYearFilter(""); setHistoryMonthFilter(""); }} className="text-slate-400 hover:text-slate-600 p-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-4 border-b border-slate-100">
              <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "additions", label: "Stock Additions", icon: "📥" },
                    { key: "transfers", label: "Stock Transfers", icon: "↔" },
                  ].map(t => (
                    <button key={t.key} onClick={() => setHistoryTab(t.key as typeof historyTab)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${historyTab === t.key ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <select
                    value={historyYearFilter}
                    onChange={e => setHistoryYearFilter(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="">All Years</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                  <select
                    value={historyMonthFilter}
                    onChange={e => setHistoryMonthFilter(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="">All Months</option>
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                  <div className="relative">
                    <input
                      type="date"
                      value={historyDateFilter}
                      onChange={e => setHistoryDateFilter(e.target.value)}
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                    <input
                      type="text"
                      value={historyLotFilter}
                      onChange={e => setHistoryLotFilter(e.target.value)}
                      placeholder="Search Lot/Batch..."
                      className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-48"
                    />
                  </div>
                  {(historyDateFilter || historyLotFilter || historyYearFilter || historyMonthFilter) && (
                    <button
                      onClick={() => { setHistoryDateFilter(""); setHistoryLotFilter(""); setHistoryYearFilter(""); setHistoryMonthFilter(""); }}
                      className="text-xs text-red-600 hover:text-red-800 font-medium px-2"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {historyTab === "additions" ? (
                <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {["Product", "Quantity", "Unit", "Location", "Lot/Batch", "Date", "Time", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredAdditions.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-800">{item.productName}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-amber-600">{item.quantity.toFixed(2)}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{item.productUnit}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{item.location}</td>
                        <td className="px-4 py-3 text-xs text-slate-500 font-mono">{item.lotNumber || "—"}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{item.date}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{item.time}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setShowHistory(false); openEditBuy(item); }} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Edit</button>
                            <button onClick={() => handleDelete("addition", item.id)} className="text-xs text-red-600 hover:text-red-800 font-medium">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredAdditions.length === 0 && (
                      <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">No stock additions found matching your filters.</td></tr>
                    )}
                  </tbody>
                </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {["Product", "Quantity", "Unit", "From", "To", "Type", "Lot/Batch", "Date", "Time", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredTransfers.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-800">{item.productName}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-indigo-600">{item.quantity.toFixed(2)}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{item.productUnit}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{item.fromLocation}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{item.toLocation}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.moveType === "internal" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}`}>
                            {item.moveType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 font-mono">{item.lotNumber || "—"}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{item.date}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{item.time}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setShowHistory(false); openEditMove(item); }} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Edit</button>
                            <button onClick={() => handleDelete("transfer", item.id)} className="text-xs text-red-600 hover:text-red-800 font-medium">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredTransfers.length === 0 && (
                      <tr><td colSpan={10} className="px-4 py-12 text-center text-slate-400">No stock transfers found matching your filters.</td></tr>
                    )}
                  </tbody>
                </table>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <div className="flex justify-between items-center text-sm text-slate-500">
                <span>Showing {historyTab === "additions" ? filteredAdditions.length : filteredTransfers.length} of {historyTab === "additions" ? stockAdditions.length : stockTransfers.length} records</span>
                <button onClick={() => { setShowHistory(false); setHistoryDateFilter(""); setHistoryLotFilter(""); setHistoryYearFilter(""); setHistoryMonthFilter(""); }} className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}