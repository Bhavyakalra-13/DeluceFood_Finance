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
import { ReorderRequest, InventoryItem, Warehouse } from "@/types/inventory";

interface Product {
	id: string;
	name: string;
	sku: string;
	unit: string;
	price: number;
}

const ReorderManagement: React.FC = () => {
	const [reorderRequests, setReorderRequests] = useState<ReorderRequest[]>(
		[]
	);
	const [products, setProducts] = useState<Product[]>([]);
	const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
	const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [showForm, setShowForm] = useState<boolean>(false);
	const [filterStatus, setFilterStatus] = useState<string>("");
	const [filterWarehouse, setFilterWarehouse] = useState<string>("");
	const [formData, setFormData] = useState<{
		productId: string;
		warehouseId: string;
		reorderQuantity: number;
		notes: string;
	}>({
		productId: "",
		warehouseId: "",
		reorderQuantity: 0,
		notes: "",
	});

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			// Fetch reorder requests
			const requestsQuery = query(
				collection(db, "reorderRequests"),
				orderBy("requestedAt", "desc")
			);
			const requestsSnapshot = await getDocs(requestsQuery);
			const requestsData = requestsSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as ReorderRequest[];

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

			setReorderRequests(requestsData);
			setProducts(productsData);
			setWarehouses(warehousesData);
			setInventoryItems(inventoryData);
			setLoading(false);
		} catch (error) {
			console.error("Error fetching data: ", error);
			setLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const product = products.find((p) => p.id === formData.productId);
			const warehouse = warehouses.find(
				(w) => w.id === formData.warehouseId
			);
			const inventoryItem = inventoryItems.find(
				(item) =>
					item.productId === formData.productId &&
					item.warehouseId === formData.warehouseId
			);

			if (!product || !warehouse || !inventoryItem) {
				alert("Invalid product or warehouse selection");
				return;
			}

			const reorderRequest: Omit<ReorderRequest, "id"> = {
				productId: formData.productId,
				productName: product.name,
				warehouseId: formData.warehouseId,
				warehouseName: warehouse.name,
				currentStock: inventoryItem.currentStock,
				reorderQuantity: formData.reorderQuantity,
				estimatedCost: formData.reorderQuantity * product.price,
				status: "pending",
				requestedBy: "Current User", // In real app, get from auth context
				requestedAt: new Date().toISOString(),
				notes: formData.notes,
			};

			await addDoc(collection(db, "reorderRequests"), reorderRequest);
			resetForm();
			fetchData();
		} catch (error) {
			console.error("Error creating reorder request: ", error);
		}
	};

	const handleStatusChange = async (
		requestId: string,
		newStatus: ReorderRequest["status"]
	) => {
		try {
			const updateData: { status: ReorderRequest["status"]; updatedAt: string; approvedBy?: string; approvedAt?: string; orderedAt?: string; receivedAt?: string; } = {
				status: newStatus,
				updatedAt: new Date().toISOString(),
			};

			if (newStatus === "approved") {
				updateData.approvedBy = "Current User"; // In real app, get from auth context
				updateData.approvedAt = new Date().toISOString();
			} else if (newStatus === "ordered") {
				updateData.orderedAt = new Date().toISOString();
			} else if (newStatus === "received") {
				updateData.receivedAt = new Date().toISOString();
			}

			await updateDoc(doc(db, "reorderRequests", requestId), updateData);
			fetchData();
		} catch (error) {
			console.error("Error updating reorder request: ", error);
		}
	};

	const handleDelete = async (requestId: string) => {
		if (
			window.confirm(
				"Are you sure you want to delete this reorder request?"
			)
		) {
			try {
				await deleteDoc(doc(db, "reorderRequests", requestId));
				fetchData();
			} catch (error) {
				console.error("Error deleting reorder request: ", error);
			}
		}
	};

	const resetForm = () => {
		setFormData({
			productId: "",
			warehouseId: "",
			reorderQuantity: 0,
			notes: "",
		});
		setShowForm(false);
	};

	const getStatusColor = (status: ReorderRequest["status"]) => {
		switch (status) {
			case "pending":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
			case "approved":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
			case "ordered":
				return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
			case "received":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
			case "cancelled":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
		}
	};

	const filteredRequests = reorderRequests.filter((request) => {
		const matchesStatus = !filterStatus || request.status === filterStatus;
		const matchesWarehouse =
			!filterWarehouse || request.warehouseId === filterWarehouse;
		return matchesStatus && matchesWarehouse;
	});

	const pendingRequestsCount = reorderRequests.filter(
		(request) => request.status === "pending"
	).length;
	const totalEstimatedCost = reorderRequests
		.filter(
			(request) =>
				request.status === "pending" || request.status === "approved"
		)
		.reduce((sum, request) => sum + request.estimatedCost, 0);

	if (loading) {
		return (
			<div className="text-center py-8">Loading reorder requests...</div>
		);
	}

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
						Reorder Management
					</h2>
					<p className="text-gray-600 dark:text-gray-400 mt-1">
						Manage reorder requests and track procurement
					</p>
				</div>
				<button
					onClick={() => setShowForm(true)}
					className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300">
					Create Reorder Request
				</button>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
					<div className="flex items-center">
						<div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
							<span className="text-yellow-600 dark:text-yellow-400 text-2xl">
								⏳
							</span>
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
								Pending Requests
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{pendingRequestsCount}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
					<div className="flex items-center">
						<div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
							<span className="text-blue-600 dark:text-blue-400 text-2xl">
								💰
							</span>
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
								Estimated Cost
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								₹{totalEstimatedCost.toFixed(2)}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
					<div className="flex items-center">
						<div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
							<span className="text-green-600 dark:text-green-400 text-2xl">
								📦
							</span>
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
								Total Requests
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{reorderRequests.length}
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
							<option value="pending">Pending</option>
							<option value="approved">Approved</option>
							<option value="ordered">Ordered</option>
							<option value="received">Received</option>
							<option value="cancelled">Cancelled</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Filter by Warehouse
						</label>
						<select
							value={filterWarehouse}
							onChange={(e) => setFilterWarehouse(e.target.value)}
							className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
							<option value="">All Warehouses</option>
							{warehouses.map((warehouse) => (
								<option key={warehouse.id} value={warehouse.id}>
									{warehouse.name}
								</option>
							))}
						</select>
					</div>
					<div className="flex items-end">
						<button
							onClick={() => {
								setFilterStatus("");
								setFilterWarehouse("");
							}}
							className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-300">
							Clear Filters
						</button>
					</div>
				</div>
			</div>

			{/* Reorder Request Form Modal */}
			{showForm && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full">
						<div className="p-6">
							<h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
								Create Reorder Request
							</h3>

							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Product *
									</label>
									<select
										value={formData.productId}
										onChange={(e) =>
											setFormData({
												...formData,
												productId: e.target.value,
											})
										}
										className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
										required>
										<option value="">Select Product</option>
										{products.map((product) => (
											<option
												key={product.id}
												value={product.id}>
												{product.name} ({product.sku})
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Warehouse *
									</label>
									<select
										value={formData.warehouseId}
										onChange={(e) =>
											setFormData({
												...formData,
												warehouseId: e.target.value,
											})
										}
										className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
										required>
										<option value="">
											Select Warehouse
										</option>
										{warehouses.map((warehouse) => (
											<option
												key={warehouse.id}
												value={warehouse.id}>
												{warehouse.name}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Reorder Quantity *
									</label>
									<input
										type="number"
										value={formData.reorderQuantity}
										onChange={(e) =>
											setFormData({
												...formData,
												reorderQuantity:
													parseInt(e.target.value) ||
													0,
											})
										}
										className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
										min="1"
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Notes
									</label>
									<textarea
										value={formData.notes}
										onChange={(e) =>
											setFormData({
												...formData,
												notes: e.target.value,
											})
										}
										className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
										rows={3}
									/>
								</div>

								<div className="flex justify-end space-x-2 pt-4">
									<button
										type="button"
										onClick={resetForm}
										className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
										Cancel
									</button>
									<button
										type="submit"
										className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
										Create Request
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Reorder Requests Table */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
					<thead className="bg-gray-50 dark:bg-gray-700">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Product & Warehouse
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Stock Info
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Reorder Details
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Status
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Requested
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
						{filteredRequests.map((request) => (
							<tr key={request.id}>
								<td className="px-6 py-4 whitespace-nowrap">
									<div>
										<div className="text-sm font-medium text-gray-900 dark:text-white">
											{request.productName}
										</div>
										<div className="text-sm text-gray-500 dark:text-gray-400">
											{request.warehouseName}
										</div>
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-900 dark:text-white">
										Current: {request.currentStock}
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-900 dark:text-white">
										Qty: {request.reorderQuantity}
									</div>
									<div className="text-sm text-gray-500 dark:text-gray-400">
										Cost: ₹
										{request.estimatedCost.toFixed(2)}
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<select
										value={request.status}
										onChange={(e) =>
											handleStatusChange(
												request.id,
												e.target
													.value as ReorderRequest["status"]
											)
										}
										className={`text-xs px-2 py-1 rounded-full border-0 ${getStatusColor(
											request.status
										)}`}>
										<option value="pending">Pending</option>
										<option value="approved">
											Approved
										</option>
										<option value="ordered">Ordered</option>
										<option value="received">
											Received
										</option>
										<option value="cancelled">
											Cancelled
										</option>
									</select>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
									{new Date(
										request.requestedAt
									).toLocaleDateString()}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<div className="flex space-x-2">
										<button
											onClick={() =>
												handleDelete(request.id)
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

				{filteredRequests.length === 0 && (
					<div className="text-center py-8 text-gray-500 dark:text-gray-400">
						No reorder requests found. Create your first request to
						get started.
					</div>
				)}
			</div>
		</div>
	);
};

export default ReorderManagement;
