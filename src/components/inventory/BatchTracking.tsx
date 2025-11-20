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
import { Batch, Warehouse } from "@/types/inventory";

interface Product {
	id: string;
	name: string;
	sku: string;
	unit: string;
}

const BatchTracking: React.FC = () => {
	const [batches, setBatches] = useState<Batch[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [showForm, setShowForm] = useState<boolean>(false);
	const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
	const [filterProduct, setFilterProduct] = useState<string>("");
	const [filterWarehouse, setFilterWarehouse] = useState<string>("");
	const [filterStatus, setFilterStatus] = useState<string>("");
	const [formData, setFormData] = useState<
		Omit<Batch, "id" | "createdAt" | "updatedAt">
	>({
		productId: "",
		batchNumber: "",
		quantity: 0,
		unit: "pcs",
		purchasePrice: 0,
		sellingPrice: 0,
		manufacturingDate: "",
		expiryDate: "",
		supplier: "",
		warehouseId: "",
		status: "active",
	});

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			// Fetch batches
			const batchesQuery = query(
				collection(db, "batches"),
				orderBy("createdAt", "desc")
			);
			const batchesSnapshot = await getDocs(batchesQuery);
			const batchesData = batchesSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Batch[];

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

			setBatches(batchesData);
			setProducts(productsData);
			setWarehouses(warehousesData);
			setLoading(false);
		} catch (error) {
			console.error("Error fetching data: ", error);
			setLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const batchData = {
				...formData,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			if (editingBatch) {
				await updateDoc(doc(db, "batches", editingBatch.id), {
					...formData,
					updatedAt: new Date().toISOString(),
				});
			} else {
				await addDoc(collection(db, "batches"), batchData);
			}

			resetForm();
			fetchData();
		} catch (error) {
			console.error("Error saving batch: ", error);
		}
	};

	const handleEdit = (batch: Batch) => {
		setEditingBatch(batch);
		setFormData({
			productId: batch.productId,
			batchNumber: batch.batchNumber,
			quantity: batch.quantity,
			unit: batch.unit,
			purchasePrice: batch.purchasePrice,
			sellingPrice: batch.sellingPrice,
			manufacturingDate: batch.manufacturingDate,
			expiryDate: batch.expiryDate || "",
			supplier: batch.supplier,
			warehouseId: batch.warehouseId,
			status: batch.status,
		});
		setShowForm(true);
	};

	const handleDelete = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this batch?")) {
			try {
				await deleteDoc(doc(db, "batches", id));
				fetchData();
			} catch (error) {
				console.error("Error deleting batch: ", error);
			}
		}
	};

	const handleStatusChange = async (
		batch: Batch,
		newStatus: Batch["status"]
	) => {
		try {
			await updateDoc(doc(db, "batches", batch.id), {
				status: newStatus,
				updatedAt: new Date().toISOString(),
			});
			fetchData();
		} catch (error) {
			console.error("Error updating batch status: ", error);
		}
	};

	const resetForm = () => {
		setFormData({
			productId: "",
			batchNumber: "",
			quantity: 0,
			unit: "pcs",
			purchasePrice: 0,
			sellingPrice: 0,
			manufacturingDate: "",
			expiryDate: "",
			supplier: "",
			warehouseId: "",
			status: "active",
		});
		setShowForm(false);
		setEditingBatch(null);
	};

	const getProductName = (productId: string) => {
		const product = products.find((p) => p.id === productId);
		return product ? product.name : "Unknown Product";
	};

	const getWarehouseName = (warehouseId: string) => {
		const warehouse = warehouses.find((w) => w.id === warehouseId);
		return warehouse ? warehouse.name : "Unknown Warehouse";
	};

	const isExpiringSoon = (expiryDate: string) => {
		if (!expiryDate) return false;
		const expiry = new Date(expiryDate);
		const today = new Date();
		const diffTime = expiry.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays <= 30 && diffDays > 0;
	};

	const isExpired = (expiryDate: string) => {
		if (!expiryDate) return false;
		const expiry = new Date(expiryDate);
		const today = new Date();
		return expiry < today;
	};

	const filteredBatches = batches.filter((batch) => {
		const matchesProduct =
			!filterProduct || batch.productId === filterProduct;
		const matchesWarehouse =
			!filterWarehouse || batch.warehouseId === filterWarehouse;
		const matchesStatus = !filterStatus || batch.status === filterStatus;
		return matchesProduct && matchesWarehouse && matchesStatus;
	});

	if (loading) {
		return <div className="text-center py-8">Loading batches...</div>;
	}

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
					Batch Tracking
				</h2>
				<button
					onClick={() => setShowForm(true)}
					className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300">
					Add Batch
				</button>
			</div>

			{/* Filters */}
			<div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Filter by Product
						</label>
						<select
							value={filterProduct}
							onChange={(e) => setFilterProduct(e.target.value)}
							className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
							<option value="">All Products</option>
							{products.map((product) => (
								<option key={product.id} value={product.id}>
									{product.name}
								</option>
							))}
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
							<option value="expired">Expired</option>
							<option value="recalled">Recalled</option>
							<option value="sold_out">Sold Out</option>
						</select>
					</div>
					<div className="flex items-end">
						<button
							onClick={() => {
								setFilterProduct("");
								setFilterWarehouse("");
								setFilterStatus("");
							}}
							className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-300">
							Clear Filters
						</button>
					</div>
				</div>
			</div>

			{/* Batch Form Modal */}
			{showForm && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
								{editingBatch ? "Edit Batch" : "Add New Batch"}
							</h3>

							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
											<option value="">
												Select Product
											</option>
											{products.map((product) => (
												<option
													key={product.id}
													value={product.id}>
													{product.name} (
													{product.sku})
												</option>
											))}
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Batch Number *
										</label>
										<input
											type="text"
											value={formData.batchNumber}
											onChange={(e) =>
												setFormData({
													...formData,
													batchNumber: e.target.value,
												})
											}
											className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Quantity *
										</label>
										<input
											type="number"
											value={formData.quantity}
											onChange={(e) =>
												setFormData({
													...formData,
													quantity:
														parseInt(
															e.target.value
														) || 0,
												})
											}
											className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
											min="0"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Unit
										</label>
										<select
											value={formData.unit}
											onChange={(e) =>
												setFormData({
													...formData,
													unit: e.target.value,
												})
											}
											className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
											<option value="pcs">Pieces</option>
											<option value="kg">
												Kilograms
											</option>
											<option value="g">Grams</option>
											<option value="l">Liters</option>
											<option value="ml">
												Milliliters
											</option>
											<option value="box">Box</option>
											<option value="pack">Pack</option>
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Purchase Price (₹) *
										</label>
										<input
											type="number"
											value={formData.purchasePrice}
											onChange={(e) =>
												setFormData({
													...formData,
													purchasePrice:
														parseFloat(
															e.target.value
														) || 0,
												})
											}
											className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
											min="0"
											step="0.01"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Selling Price (₹) *
										</label>
										<input
											type="number"
											value={formData.sellingPrice}
											onChange={(e) =>
												setFormData({
													...formData,
													sellingPrice:
														parseFloat(
															e.target.value
														) || 0,
												})
											}
											className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
											min="0"
											step="0.01"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Manufacturing Date *
										</label>
										<input
											type="date"
											value={formData.manufacturingDate}
											onChange={(e) =>
												setFormData({
													...formData,
													manufacturingDate:
														e.target.value,
												})
											}
											className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Expiry Date
										</label>
										<input
											type="date"
											value={formData.expiryDate}
											onChange={(e) =>
												setFormData({
													...formData,
													expiryDate: e.target.value,
												})
											}
											className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Supplier *
										</label>
										<input
											type="text"
											value={formData.supplier}
											onChange={(e) =>
												setFormData({
													...formData,
													supplier: e.target.value,
												})
											}
											className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
											required
										/>
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
											Status
										</label>
										<select
											value={formData.status}
											onChange={(e) =>
												setFormData({
													...formData,
													status: e.target
														.value as Batch["status"],
												})
											}
											className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
											<option value="active">
												Active
											</option>
											<option value="expired">
												Expired
											</option>
											<option value="recalled">
												Recalled
											</option>
											<option value="sold_out">
												Sold Out
											</option>
										</select>
									</div>
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
										{editingBatch
											? "Update Batch"
											: "Add Batch"}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Batches Table */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
				<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
					<thead className="bg-gray-50 dark:bg-gray-700">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Product & Batch
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Quantity
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Prices
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Dates
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Warehouse
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Status
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
						{filteredBatches.map((batch) => (
							<tr key={batch.id}>
								<td className="px-6 py-4 whitespace-nowrap">
									<div>
										<div className="text-sm font-medium text-gray-900 dark:text-white">
											{getProductName(batch.productId)}
										</div>
										<div className="text-sm text-gray-500 dark:text-gray-400">
											Batch: {batch.batchNumber}
										</div>
										<div className="text-sm text-gray-500 dark:text-gray-400">
											Supplier: {batch.supplier}
										</div>
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
									{batch.quantity} {batch.unit}
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-900 dark:text-white">
										Purchase: ₹
										{batch.purchasePrice.toFixed(2)}
									</div>
									<div className="text-sm text-gray-500 dark:text-gray-400">
										Selling: ₹
										{batch.sellingPrice.toFixed(2)}
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-900 dark:text-white">
										Mfg:{" "}
										{new Date(
											batch.manufacturingDate
										).toLocaleDateString()}
									</div>
									{batch.expiryDate && (
										<div
											className={`text-sm ${isExpired(batch.expiryDate)
													? "text-red-600 dark:text-red-400"
													: isExpiringSoon(
														batch.expiryDate
													)
														? "text-yellow-600 dark:text-yellow-400"
														: "text-gray-500 dark:text-gray-400"
												}`}>
											Exp:{" "}
											{new Date(
												batch.expiryDate
											).toLocaleDateString()}
										</div>
									)}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
									{getWarehouseName(batch.warehouseId)}
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<select
										value={batch.status}
										onChange={(e) =>
											handleStatusChange(
												batch,
												e.target
													.value as Batch["status"]
											)
										}
										className={`text-xs px-2 py-1 rounded-full border-0 ${batch.status === "active"
												? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
												: batch.status === "expired"
													? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
													: batch.status === "recalled"
														? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
														: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
											}`}>
										<option value="active">Active</option>
										<option value="expired">Expired</option>
										<option value="recalled">
											Recalled
										</option>
										<option value="sold_out">
											Sold Out
										</option>
									</select>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<div className="flex space-x-2">
										<button
											onClick={() => handleEdit(batch)}
											className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
											Edit
										</button>
										<button
											onClick={() =>
												handleDelete(batch.id)
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

				{filteredBatches.length === 0 && (
					<div className="text-center py-8 text-gray-500 dark:text-gray-400">
						No batches found. Add your first batch to get started.
					</div>
				)}
			</div>
		</div>
	);
};

export default BatchTracking;
