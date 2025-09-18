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
import { Warehouse } from "@/types/inventory";

const WarehouseManagement: React.FC = () => {
	const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [showForm, setShowForm] = useState<boolean>(false);
	const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
		null
	);
	const [formData, setFormData] = useState<
		Omit<Warehouse, "id" | "createdAt" | "updatedAt">
	>({
		name: "",
		address: "",
		city: "",
		state: "",
		pincode: "",
		contactPerson: "",
		phone: "",
		email: "",
		isActive: true,
	});

	useEffect(() => {
		fetchWarehouses();
	}, []);

	const fetchWarehouses = async () => {
		try {
			const q = query(
				collection(db, "warehouses"),
				orderBy("createdAt", "desc")
			);
			const querySnapshot = await getDocs(q);
			const data = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Warehouse[];
			setWarehouses(data);
			setLoading(false);
		} catch (error) {
			console.error("Error fetching warehouses: ", error);
			setLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const warehouseData = {
				...formData,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			if (editingWarehouse) {
				await updateDoc(doc(db, "warehouses", editingWarehouse.id), {
					...formData,
					updatedAt: new Date().toISOString(),
				});
			} else {
				await addDoc(collection(db, "warehouses"), warehouseData);
			}

			resetForm();
			fetchWarehouses();
		} catch (error) {
			console.error("Error saving warehouse: ", error);
		}
	};

	const handleEdit = (warehouse: Warehouse) => {
		setEditingWarehouse(warehouse);
		setFormData({
			name: warehouse.name,
			address: warehouse.address,
			city: warehouse.city,
			state: warehouse.state,
			pincode: warehouse.pincode,
			contactPerson: warehouse.contactPerson,
			phone: warehouse.phone,
			email: warehouse.email,
			isActive: warehouse.isActive,
		});
		setShowForm(true);
	};

	const handleDelete = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this warehouse?")) {
			try {
				await deleteDoc(doc(db, "warehouses", id));
				fetchWarehouses();
			} catch (error) {
				console.error("Error deleting warehouse: ", error);
			}
		}
	};

	const handleToggleStatus = async (warehouse: Warehouse) => {
		try {
			await updateDoc(doc(db, "warehouses", warehouse.id), {
				isActive: !warehouse.isActive,
				updatedAt: new Date().toISOString(),
			});
			fetchWarehouses();
		} catch (error) {
			console.error("Error updating warehouse status: ", error);
		}
	};

	const resetForm = () => {
		setFormData({
			name: "",
			address: "",
			city: "",
			state: "",
			pincode: "",
			contactPerson: "",
			phone: "",
			email: "",
			isActive: true,
		});
		setShowForm(false);
		setEditingWarehouse(null);
	};

	if (loading) {
		return <div className="text-center py-8">Loading warehouses...</div>;
	}

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
					Warehouse Management
				</h2>
				<button
					onClick={() => setShowForm(true)}
					className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300">
					Add Warehouse
				</button>
			</div>

			{/* Warehouse Form Modal */}
			{showForm && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
								{editingWarehouse
									? "Edit Warehouse"
									: "Add New Warehouse"}
							</h3>

							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Warehouse Name *
										</label>
										<input
											type="text"
											value={formData.name}
											onChange={(e) =>
												setFormData({
													...formData,
													name: e.target.value,
												})
											}
											className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Contact Person *
										</label>
										<input
											type="text"
											value={formData.contactPerson}
											onChange={(e) =>
												setFormData({
													...formData,
													contactPerson:
														e.target.value,
												})
											}
											className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Phone *
										</label>
										<input
											type="tel"
											value={formData.phone}
											onChange={(e) =>
												setFormData({
													...formData,
													phone: e.target.value,
												})
											}
											className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Email
										</label>
										<input
											type="email"
											value={formData.email}
											onChange={(e) =>
												setFormData({
													...formData,
													email: e.target.value,
												})
											}
											className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											City *
										</label>
										<input
											type="text"
											value={formData.city}
											onChange={(e) =>
												setFormData({
													...formData,
													city: e.target.value,
												})
											}
											className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											State *
										</label>
										<input
											type="text"
											value={formData.state}
											onChange={(e) =>
												setFormData({
													...formData,
													state: e.target.value,
												})
											}
											className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Pincode *
										</label>
										<input
											type="text"
											value={formData.pincode}
											onChange={(e) =>
												setFormData({
													...formData,
													pincode: e.target.value,
												})
											}
											className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
											required
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Address *
									</label>
									<textarea
										value={formData.address}
										onChange={(e) =>
											setFormData({
												...formData,
												address: e.target.value,
											})
										}
										className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
										rows={3}
										required
									/>
								</div>

								<div className="flex items-center">
									<input
										type="checkbox"
										id="isActive"
										checked={formData.isActive}
										onChange={(e) =>
											setFormData({
												...formData,
												isActive: e.target.checked,
											})
										}
										className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
									/>
									<label
										htmlFor="isActive"
										className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
										Active Warehouse
									</label>
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
										{editingWarehouse
											? "Update Warehouse"
											: "Add Warehouse"}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Warehouses Table */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
				<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
					<thead className="bg-gray-50 dark:bg-gray-700">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Warehouse
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Contact
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Location
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
						{warehouses.map((warehouse) => (
							<tr key={warehouse.id}>
								<td className="px-6 py-4 whitespace-nowrap">
									<div>
										<div className="text-sm font-medium text-gray-900 dark:text-white">
											{warehouse.name}
										</div>
										<div className="text-sm text-gray-500 dark:text-gray-400">
											{warehouse.address}
										</div>
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-900 dark:text-white">
										{warehouse.contactPerson}
									</div>
									<div className="text-sm text-gray-500 dark:text-gray-400">
										{warehouse.phone}
									</div>
									{warehouse.email && (
										<div className="text-sm text-gray-500 dark:text-gray-400">
											{warehouse.email}
										</div>
									)}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
									{warehouse.city}, {warehouse.state} -{" "}
									{warehouse.pincode}
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
											warehouse.isActive
												? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
												: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
										}`}>
										{warehouse.isActive
											? "Active"
											: "Inactive"}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<div className="flex space-x-2">
										<button
											onClick={() =>
												handleEdit(warehouse)
											}
											className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
											Edit
										</button>
										<button
											onClick={() =>
												handleToggleStatus(warehouse)
											}
											className={`${
												warehouse.isActive
													? "text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
													: "text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
											}`}>
											{warehouse.isActive
												? "Deactivate"
												: "Activate"}
										</button>
										<button
											onClick={() =>
												handleDelete(warehouse.id)
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

				{warehouses.length === 0 && (
					<div className="text-center py-8 text-gray-500 dark:text-gray-400">
						No warehouses found. Add your first warehouse to get
						started.
					</div>
				)}
			</div>
		</div>
	);
};

export default WarehouseManagement;
