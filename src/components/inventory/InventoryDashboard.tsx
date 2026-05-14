import React, { useState } from "react";
import WarehouseManagement from "./WarehouseManagement";
import BatchTracking from "./BatchTracking";
import LowStockAlerts from "./LowStockAlerts";
import ReorderManagement from "./ReorderManagement";

const InventoryDashboard: React.FC = () => {
	const [activeTab, setActiveTab] = useState("warehouses");

	const tabs = [
		{ id: "warehouses", name: "Warehouses", icon: (
			<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
			</svg>
		)},
		{ id: "batches", name: "Batch Tracking", icon: (
			<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
			</svg>
		)},
		{ id: "alerts", name: "Low Stock Alerts", icon: (
			<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
			</svg>
		)},
		{ id: "reorders", name: "Reorder", icon: (
			<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
			</svg>
		)},
	];

	const renderContent = () => {
		switch (activeTab) {
			case "warehouses":
				return <WarehouseManagement />;
			case "batches":
				return <BatchTracking />;
			case "alerts":
				return <LowStockAlerts />;
			case "reorders":
				return <ReorderManagement />;
			default:
				return null;
		}
	};

	return (
		<div>
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-black dark:text-white mb-1">
					Inventory Management
				</h1>
				<p className="text-body dark:text-bodydark">
					Manage warehouses, track batches, monitor stock levels, and
					handle reorders.
				</p>
			</div>

			{/* Tab Navigation - Pill Style */}
			<div className="mb-6">
				<div className="flex gap-1 p-1.5 bg-gray dark:bg-meta-4/50 rounded-2xl overflow-x-auto no-scrollbar w-fit">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-200 ${
								activeTab === tab.id
									? "bg-white dark:bg-boxdark text-black dark:text-white shadow-sm"
									: "text-body dark:text-bodydark hover:text-black dark:hover:text-white hover:bg-white/50 dark:hover:bg-boxdark/50"
							}`}>
							{tab.icon}
							{tab.name}
						</button>
					))}
				</div>
			</div>

			<div className="animate-in">{renderContent()}</div>
		</div>
	);
};

export default InventoryDashboard;
