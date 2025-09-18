import React, { useState } from "react";
import WarehouseManagement from "./WarehouseManagement";
import BatchTracking from "./BatchTracking";
import LowStockAlerts from "./LowStockAlerts";
import ReorderManagement from "./ReorderManagement";

const InventoryDashboard: React.FC = () => {
	const [activeTab, setActiveTab] = useState("warehouses");

	const tabs = [
		{ id: "warehouses", name: "Warehouses", icon: "🏢" },
		{ id: "batches", name: "Batch Tracking", icon: "📦" },
		{ id: "alerts", name: "Low Stock Alerts", icon: "⚠️" },
		{ id: "reorders", name: "Reorder Management", icon: "🔄" },
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
		<div className="p-6">
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
					Advanced Inventory Management
				</h1>
				<p className="text-gray-600 dark:text-gray-400">
					Manage warehouses, track batches, monitor stock levels, and
					handle reorders.
				</p>
			</div>

			<div className="mb-6">
				<div className="border-b border-gray-200 dark:border-gray-700">
					<nav className="-mb-px flex space-x-8 overflow-x-auto">
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
									activeTab === tab.id
										? "border-blue-500 text-blue-600 dark:text-blue-400"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
								}`}>
								<span className="mr-2">{tab.icon}</span>
								{tab.name}
							</button>
						))}
					</nav>
				</div>
			</div>

			{renderContent()}
		</div>
	);
};

export default InventoryDashboard;
