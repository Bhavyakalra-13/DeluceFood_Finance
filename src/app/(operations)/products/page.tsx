"use client";
import React, { useState, useMemo } from "react";
import { useErp, Product, ProductType, ProductCategory } from "@/providers/ErpProvider";
import { useCurrency } from "@/hooks/useCurrency";

const CAT_COLORS: Record<string,string> = {
  wheat:"bg-yellow-100 text-yellow-800", pasta:"bg-orange-100 text-orange-800",
  nuts:"bg-amber-100 text-amber-800", makhana:"bg-lime-100 text-lime-800",
  spices:"bg-red-100 text-red-800", packaging:"bg-blue-100 text-blue-800",
  dairy:"bg-sky-100 text-sky-800", seasoning:"bg-purple-100 text-purple-800",
  baking:"bg-pink-100 text-pink-800",
};
const TYPE_BADGE: Record<string,string> = {
  raw_material:"bg-amber-50 text-amber-700 border border-amber-200",
  semi_finished:"bg-blue-50 text-blue-700 border border-blue-200",
  finished_good:"bg-emerald-50 text-emerald-700 border border-emerald-200",
};
const EMPTY: Partial<Product> = {
  name:"", description:"", defaultCode:"", type:"raw_material", category:"wheat",
  unit:"kg", quantityPerUnit:1, cost:0, price:0, minReorderQty:0, maxStockLevel:0, barcode:"", active:true,
  labourCost:0, electricityCost:0, gstRate:12, otherCosts:0,
};

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useErp();
  const { formatCurrency } = useCurrency();
  const [search, setSearch] = useState("");
  const [typeTab, setTypeTab] = useState<"all"|ProductType>("all");
  const [catFilter, setCatFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string|null>(null);
  const [form, setForm] = useState<Partial<Product>>(EMPTY);
  const [viewCard, setViewCard] = useState<Product|null>(null);
  const [deleteId, setDeleteId] = useState<string|null>(null);

  const filtered = useMemo(()=>products.filter(p=>{
    if(typeTab!=="all"&&p.type!==typeTab)return false;
    if(catFilter!=="all"&&p.category!==catFilter)return false;
    if(search&&!p.name.toLowerCase().includes(search.toLowerCase())&&!(p.defaultCode||"").toLowerCase().includes(search.toLowerCase())&&!(p.description||"").toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  }),[products,search,typeTab,catFilter]);

  const cats = Array.from(new Set(products.map(p=>p.category).filter(Boolean)));
  const openAdd = ()=>{ setEditId(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (p:Product)=>{ setEditId(p.id); setForm({...p}); setShowModal(true); };

  const handleSubmit = (e:React.FormEvent)=>{
    e.preventDefault();
    if(editId) updateProduct(editId, form as Partial<Product>);
    else addProduct({...form, id:`p${Date.now()}`} as Product);
    setShowModal(false);
  };

  // Compute total cost for finished goods
  const totalCost = (p:Product) => (p.cost||0)+(p.labourCost||0)+(p.electricityCost||0)+(p.otherCosts||0);
  const gstAmt = (p:Product) => totalCost(p)*(p.gstRate||0)/100;
  const margin = (p:Product) => p.price>0 ? ((p.price-totalCost(p)-gstAmt(p))/p.price*100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Product Catalog</h1>
          <p className="text-slate-500 text-sm mt-1">Global catalog — raw materials, trading goods &amp; manufactured products</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all hover:shadow-lg text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Add Product
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {l:"Total Products",v:products.length,c:"bg-indigo-600",i:"📦"},
          {l:"Raw Materials",v:products.filter(p=>p.type==="raw_material").length,c:"bg-amber-500",i:"🌾"},
          {l:"Finished Goods",v:products.filter(p=>p.type==="finished_good").length,c:"bg-emerald-600",i:"🍝"},
          {l:"Active Items",v:products.filter(p=>p.active).length,c:"bg-violet-600",i:"✅"},
        ].map((s,i)=>(
          <div key={i} className={`${s.c} text-white rounded-2xl p-4 shadow-md`}>
            <div className="text-xl mb-1">{s.i}</div>
            <div className="text-2xl font-bold">{s.v}</div>
            <div className="text-xs opacity-80">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-44">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, code or description…" className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          {(["all","raw_material","semi_finished","finished_good"] as const).map(t=>(
            <button key={t} onClick={()=>setTypeTab(t)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${typeTab===t?"bg-white shadow text-indigo-700":"text-slate-500 hover:text-slate-700"}`}>
              {t==="all"?"All":t.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}
            </button>
          ))}
        </div>
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="all">All Categories</option>
          {cats.map(c=><option key={c} value={c}>{String(c).charAt(0).toUpperCase()+String(c).slice(1)}</option>)}
        </select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} items</span>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
        {filtered.map(p=>{
          return (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all group flex flex-col">
              {/* Color header strip */}
              <div className={`h-1.5 w-full ${p.type==="finished_good"?"bg-emerald-400":p.type==="semi_finished"?"bg-blue-400":"bg-amber-400"}`}/>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${CAT_COLORS[p.category||""]||"bg-slate-100 text-slate-600"}`}>{p.category||"—"}</span>
                  <div className="flex gap-1 items-center">
                    <div className={`w-2 h-2 rounded-full ${p.active?"bg-emerald-400":"bg-red-400"}`}/>
                    <span className="text-xs text-slate-400">{p.active?"Active":"Inactive"}</span>
                  </div>
                </div>
                <h3 className="font-bold text-slate-800 text-base leading-tight mb-1">{p.name}</h3>
                <p className="text-xs text-slate-400 font-mono mb-2">{p.defaultCode||"—"}</p>
                {p.description&&<p className="text-xs text-slate-500 leading-relaxed mb-3 flex-1">{p.description}</p>}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-slate-50 rounded-xl p-2 text-center">
                    <div className="text-xs text-slate-400 mb-0.5">Cost</div>
                    <div className="text-sm font-bold text-slate-700">{formatCurrency(p.cost)}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2 text-center">
                    <div className="text-xs text-slate-400 mb-0.5">Price</div>
                    <div className="text-sm font-bold text-slate-700">{p.price>0?formatCurrency(p.price):"—"}</div>
                  </div>
                </div>
                <div className="text-xs text-slate-400 mb-3">Unit: <span className="text-slate-600 font-medium">{p.unit}</span></div>
                
                {p.type==="finished_good"&&<div className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg mb-3 cursor-pointer hover:bg-emerald-100 transition-colors" onClick={()=>setViewCard(p)}>📊 View Cost Breakdown →</div>}
              </div>
              <div className="px-5 pb-5 flex gap-2">
                <button onClick={()=>openEdit(p)} className="flex-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-2 rounded-xl transition-colors">Edit</button>
                <button onClick={()=>setDeleteId(p.id)} className="flex-1 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 py-2 rounded-xl transition-colors">Delete</button>
              </div>
            </div>
          );
        })}
        {filtered.length===0&&<div className="col-span-full py-20 text-center text-slate-400">No products match your filters.</div>}
      </div>

      {/* Add/Edit Modal */}
      {showModal&&(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-slate-800">{editId?"Edit Product":"Add New Product"}</h2>
              <button onClick={()=>setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 sm:p-6">
              <form id="pf" onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Product Name *</label>
                    <input required value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="e.g. Durum Wheat Semolina"/>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Description</label>
                    <textarea rows={2} value={form.description||""} onChange={e=>setForm({...form,description:e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" placeholder="Product details, quality specs, usage notes…"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Internal Code</label>
                    <input value={form.defaultCode||""} onChange={e=>setForm({...form,defaultCode:e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="DWS-001"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Barcode</label>
                    <input value={form.barcode||""} onChange={e=>setForm({...form,barcode:e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Scan or type barcode"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Product Type *</label>
                    <select value={form.type} onChange={e=>setForm({...form,type:e.target.value as ProductType})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      <option value="raw_material">Raw Material (Buy)</option>
                      <option value="semi_finished">Semi-Finished</option>
                      <option value="finished_good">Finished Good (Sell)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Category</label>
                    <select value={form.category} onChange={e=>setForm({...form,category:e.target.value as ProductCategory})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      <option value="wheat">Wheat</option>
                      <option value="pasta">Pasta</option>
                      <option value="nuts">Nuts</option>
                      <option value="makhana">Makhana</option>
                      <option value="spices">Spices</option>
                      <option value="packaging">Packaging</option>
                      <option value="dairy">Dairy</option>
                      <option value="seasoning">Seasoning</option>
                      <option value="baking">Baking</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Unit of Measure *</label>
                    <select required value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      <optgroup label="Standard"><option value="kg">kg</option><option value="g">g</option><option value="liter">Liter</option><option value="ml">ml</option><option value="pcs">Pieces</option><option value="box">Box</option></optgroup>
                      <optgroup label="Bags"><option value="bag_5kg">Bag (5kg)</option><option value="bag_10kg">Bag (10kg)</option><option value="bag_20kg">Bag (20kg)</option><option value="bag_25kg">Bag (25kg)</option><option value="bag_50kg">Bag (50kg)</option></optgroup>
                      <optgroup label="Cartons"><option value="carton_12">Carton (12)</option><option value="carton_24">Carton (24)</option><option value="carton_36">Carton (36)</option><option value="carton_48">Carton (48)</option></optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Quantity</label>
                    <input type="number" step="0.01" min="0" value={form.quantityPerUnit||1} onChange={e=>setForm({...form,quantityPerUnit:Number(e.target.value)})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="e.g. 5"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Cost Price</label>
                    <input type="number" step="0.01" min="0" value={form.cost||0} onChange={e=>setForm({...form,cost:Number(e.target.value)})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Sales Price</label>
                    <input type="number" step="0.01" min="0" value={form.price||0} onChange={e=>setForm({...form,price:Number(e.target.value)})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                  </div>
                </div>

                {form.type==="finished_good"&&(
                  <div className="border border-emerald-200 bg-emerald-50 rounded-2xl p-4 space-y-3">
                    <h4 className="text-sm font-bold text-emerald-800">Cost Breakdown (per unit)</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {l:"Labour Cost",k:"labourCost"},
                        {l:"Electricity Cost",k:"electricityCost"},
                        {l:"GST Rate (%)",k:"gstRate"},
                        {l:"Other Costs",k:"otherCosts"},
                      ].map(f=>(
                        <div key={f.k}>
                          <label className="block text-xs font-medium text-emerald-700 mb-1">{f.l}</label>
                          <input type="number" step="0.01" min="0" value={(form as Record<string,number|undefined>)[f.k]||0} onChange={e=>setForm({...form,[f.k]:Number(e.target.value)})} className="w-full border border-emerald-200 bg-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"/>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                  <input type="checkbox" id="ac" checked={!!form.active} onChange={e=>setForm({...form,active:e.target.checked})} className="w-4 h-4 text-indigo-600 rounded"/>
                  <label htmlFor="ac" className="text-sm font-medium text-slate-700 cursor-pointer">Product is Active</label>
                </div>
              </form>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-slate-50">
              <button type="button" onClick={()=>setShowModal(false)} className="px-5 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" form="pf" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-all hover:shadow-md">{editId?"Save Changes":"Create Product"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Finished Good Detail Card Popup */}
      {viewCard&&(()=>{
        const p = products.find(x=>x.id===viewCard.id)||viewCard;
        const tc = totalCost(p);
        const gst = gstAmt(p);
        const mar = margin(p);
        return (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="flex justify-between items-center px-6 py-4 border-b bg-emerald-50 rounded-t-2xl">
                <div>
                  <h2 className="text-lg font-bold text-emerald-900">{p.name}</h2>
                  <p className="text-xs text-emerald-600">{p.defaultCode} · {p.unit}</p>
                </div>
                <button onClick={()=>setViewCard(null)} className="text-slate-400 hover:text-slate-600 p-1"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
              </div>
              <div className="p-6 space-y-4">
                {p.description&&<p className="text-sm text-slate-500 bg-slate-50 rounded-xl p-3">{p.description}</p>}
                <div className="space-y-2">
                  {[
                    {l:"Raw Material Cost",v:formatCurrency(p.cost),c:"text-slate-700"},
                    {l:"Labour Cost",v:formatCurrency(p.labourCost||0),c:"text-slate-700"},
                    {l:"Electricity Cost",v:formatCurrency(p.electricityCost||0),c:"text-slate-700"},
                    {l:"Other Costs",v:formatCurrency(p.otherCosts||0),c:"text-slate-700"},
                    {l:"Total Cost",v:formatCurrency(tc),c:"font-bold text-slate-900 text-base"},
                    {l:`GST (${p.gstRate||0}%)`,v:formatCurrency(gst),c:"text-orange-600"},
                    {l:"Sales Price",v:formatCurrency(p.price),c:"font-bold text-indigo-700 text-base"},
                    {l:"Margin",v:`${mar.toFixed(1)}%`,c:mar>0?"font-bold text-emerald-600 text-lg":"font-bold text-red-600 text-lg"},
                  ].map((row,i)=>(
                    <div key={i} className={`flex justify-between py-1.5 border-b border-slate-50 ${row.c}`}>
                      <span className="text-sm text-slate-500">{row.l}</span>
                      <span className={`text-sm ${row.c}`}>{row.v}</span>
                    </div>
                  ))}
                </div>
                <button onClick={()=>{setViewCard(null);openEdit(p);}} className="w-full mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors">Edit Cost Breakdown</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Delete Confirm */}
      {deleteId&&(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div className="text-5xl mb-4">🗑️</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Product?</h3>
            <p className="text-slate-500 text-sm mb-6">This will permanently remove the product from your catalog.</p>
            <div className="flex gap-3">
              <button onClick={()=>setDeleteId(null)} className="flex-1 px-4 py-2.5 border rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium">Cancel</button>
              <button onClick={()=>{deleteProduct(deleteId);setDeleteId(null);}} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
