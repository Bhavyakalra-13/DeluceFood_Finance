import React, { useState, useEffect } from "react";
import {
	collection,
	addDoc,
	deleteDoc,
	doc,
	getDocs,
	updateDoc,
	query,
	orderBy,
} from "firebase/firestore";
import db from "@/utils/firestore";
import { LowStockAlert, InventoryItem, Warehouse } from "@/types/inventory";

interface Product {
	id: string;
	name: string;
	sku: string;
	unit: string;
}

const LowStockAlerts: React.FC = () => {
	const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
	const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [filterStatus, setFilterStatus] = useState<string>("");
	const [filterPriority, setFilterPriority] = useState<string>("");

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			// Fetch alerts
			const alertsQuery = query(
				collection(db, "lowStockAlerts"),
				orderBy("createdAt", "desc")
			);
			const alertsSnapshot = await getDocs(alertsQuery);
			const alertsData = alertsSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as LowStockAlert[];

			// Fetch products
			const productsSnapshot = await getDocs(collection(db, "products"));
			const productsData = productsSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Product[];

			// Fetch warehouses
			const warehousesSnapshot = await getDocs(
				collection(db, "warehouses")
			);
			const warehousesData = warehousesSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Warehouse[];

			// Fetch inventory items
			const inventorySnapshot = await getDocs(
				collection(db, "inventoryItems")
			);
			const inventoryData = inventorySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as InventoryItem[];

			setAlerts(alertsData);
			setProducts(productsData);
			setWarehouses(warehousesData);
			setInventoryItems(inventoryData);
			setLoading(false);
		} catch (error) {
			console.error("Error fetching data: ", error);
			setLoading(false);
		}
	};

	const generateLowStockAlerts = async () => {
		try {
			// Clear existing alerts
			const existingAlerts = await getDocs(
				collection(db, "lowStockAlerts")
			);
			const deletePromises = existingAlerts.docs.map((doc) =>
				deleteDoc(doc.ref)
			);
			await Promise.all(deletePromises);

			// Generate new alerts based on inventory items
			const newAlerts: Omit<LowStockAlert, "id">[] = [];

			for (const item of inventoryItems) {
				if (item.currentStock <= item.reorderPoint) {
					const product = products.find(
						(p) => p.id === item.productId
					);
					const warehouse = warehouses.find(
						(w) => w.id === item.warehouseId
					);

					if (product && warehouse) {
						const priority =
							item.currentStock === 0
								? "critical"
								: item.currentStock <= item.reorderPoint * 0.5
									? "high"
									: item.currentStock <= item.reorderPoint * 0.8
										? "medium"
										: "low";

						newAlerts.push({
							productId: item.productId,
							productName: product.name,
							warehouseId: item.warehouseId,
							warehouseName: warehouse.name,
							currentStock: item.currentStock,
							reorderPoint: item.reorderPoint,
							reorderQuantity: item.reorderQuantity,
							priority,
							status: "active",
							createdAt: new Date().toISOString(),
						});
					}
				}
			}

			// Add new alerts to database
			const addPromises = newAlerts.map((alert) =>
				addDoc(collection(db, "lowStockAlerts"), alert)
			);
			await Promise.all(addPromises);

			fetchData();
		} catch (error) {
			console.error("Error generating alerts: ", error);
		}
	};

	const handleAcknowledge = async (alertId: string) => {
		try {
			await updateDoc(doc(db, "lowStockAlerts", alertId), {
				status: "acknowledged",
				acknowledgedAt: new Date().toISOString(),
				acknowledgedBy: "Current User", // In real app, get from auth context
			});
			fetchData();
		} catch (error) {
			console.error("Error acknowledging alert: ", error);
		}
	};

	const handleResolve = async (alertId: string) => {
		try {
			await updateDoc(doc(db, "lowStockAlerts", alertId), {
				status: "resolved",
				resolvedAt: new Date().toISOString(),
				resolvedBy: "Current User", // In real app, get from auth context
			});
			fetchData();
		} catch (error) {
			console.error("Error resolving alert: ", error);
		}
	};

	const handleDelete = async (alertId: string) => {
		if (window.confirm("Are you sure you want to delete this alert?")) {
			try {
				await deleteDoc(doc(db, "lowStockAlerts", alertId));
				fetchData();
			} catch (error) {
				console.error("Error deleting alert: ", error);
			}
		}
	};

	const getPriorityColor = (priority: LowStockAlert["priority"]) => {
		switch (priority) {
			case "critical":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
			case "high":
				return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
			case "medium":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
			case "low":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
		}
	};

	const getStatusColor = (status: LowStockAlert["status"]) => {
		switch (status) {
			case "active":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
			case "acknowledged":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
			case "resolved":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
		}
	};

	const filteredAlerts = alerts.filter((alert) => {
		const matchesStatus = !filterStatus || alert.status === filterStatus;
		const matchesPriority =
			!filterPriority || alert.priority === filterPriority;
		return matchesStatus && matchesPriority;
	});

	const activeAlertsCount = alerts.filter(
		(alert) => alert.status === "active"
	).length;
	const criticalAlertsCount = alerts.filter(
		(alert) => alert.priority === "critical" && alert.status === "active"
	).length;

	if (loading) {
		return <div className="text-center py-8">Loading alerts...</div>;
	}

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
						Low Stock Alerts
					</h2>
					<p className="text-gray-600 dark:text-gray-400 mt-1">
						Monitor and manage low stock situations across all
						warehouses
					</p>
				</div>
				<button
					onClick={generateLowStockAlerts}
					className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300">
					Generate Alerts
				</button>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
					<div className="flex items-center">
						<div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
							<span className="text-red-600 dark:text-red-400 text-2xl">
								⚠️
							</span>
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
								Active Alerts
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{activeAlertsCount}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
					<div className="flex items-center">
						<div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
							<span className="text-red-600 dark:text-red-400 text-2xl">
								🚨
							</span>
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
								Critical Alerts
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{criticalAlertsCount}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
					<div className="flex items-center">
						<div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
							<span className="text-green-600 dark:text-green-400 text-2xl">
								✅
							</span>
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
								Resolved
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{
									alerts.filter(
										(alert) => alert.status === "resolved"
									).length
								}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Filter by Status
						</label>
						<select
							value={filterStatus}
							onChange={(e) => setFilterStatus(e.target.value)}
							className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
							<option value="">All Statuses</option>
							<option value="active">Active</option>
							<option value="acknowledged">Acknowledged</option>
							<option value="resolved">Resolved</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Filter by Priority
						</label>
						<select
							value={filterPriority}
							onChange={(e) => setFilterPriority(e.target.value)}
							className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
							<option value="">All Priorities</option>
							<option value="critical">Critical</option>
							<option value="high">High</option>
							<option value="medium">Medium</option>
							<option value="low">Low</option>
						</select>
					</div>
					<div className="flex items-end">
						<button
							onClick={() => {
								setFilterStatus("");
								setFilterPriority("");
							}}
							className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-300">
							Clear Filters
						</button>
					</div>
				</div>
			</div>

			{/* Alerts Table */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
					<thead className="bg-gray-50 dark:bg-gray-700">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Product & Warehouse
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Stock Levels
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Priority
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Status
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Created
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
						{filteredAlerts.map((alert) => (
							<tr key={alert.id}>
								<td className="px-6 py-4 whitespace-nowrap">
									<div>
										<div className="text-sm font-medium text-gray-900 dark:text-white">
											{alert.productName}
										</div>
										<div className="text-sm text-gray-500 dark:text-gray-400">
											{alert.warehouseName}
										</div>
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-900 dark:text-white">
										Current: {alert.currentStock}
									</div>
									<div className="text-sm text-gray-500 dark:text-gray-400">
										Reorder Point: {alert.reorderPoint}
									</div>
									<div className="text-sm text-gray-500 dark:text-gray-400">
										Reorder Qty: {alert.reorderQuantity}
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
											alert.priority
										)}`}>
										{alert.priority.toUpperCase()}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
											alert.status
										)}`}>
										{alert.status.toUpperCase()}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
									{new Date(
										alert.createdAt
									).toLocaleDateString()}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<div className="flex space-x-2">
										{alert.status === "active" && (
											<button
												onClick={() =>
													handleAcknowledge(alert.id)
												}
												className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300">
												Acknowledge
											</button>
										)}
										{alert.status === "acknowledged" && (
											<button
												onClick={() =>
													handleResolve(alert.id)
												}
												className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
												Resolve
											</button>
										)}
										<button
											onClick={() =>
												handleDelete(alert.id)
											}
											className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
											Delete
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{filteredAlerts.length === 0 && (
					<div className="text-center py-8 text-gray-500 dark:text-gray-400">
						No alerts found. Generate alerts to see low stock
						situations.
					</div>
				)}
			</div>
		</div>
	);
};

export default LowStockAlerts;
