import React, { useState, useEffect } from "react";
import {
	collection,
	addDoc,
	deleteDoc,
	doc,
	getDocs,
	updateDoc,
} from "firebase/firestore";
import db from "@/utils/firestore";
import { Vendor } from "@/types/financial";

const VendorManagement: React.FC = () => {
	const [vendors, setVendors] = useState<Vendor[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [showForm, setShowForm] = useState<boolean>(false);
	const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
	const [formData, setFormData] = useState<
		Omit<Vendor, "id" | "createdAt" | "updatedAt">
	>({
		name: "",
		contactPerson: "",
		email: "",
		phone: "",
		address: "",
		gstNumber: "",
		paymentTerms: "30 days",
		isActive: true,
	});

	useEffect(() => {
		fetchVendors();
	}, []);

	const fetchVendors = async () => {
		try {
			const querySnapshot = await getDocs(collection(db, "vendors"));
			const data = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Vendor[];
			setVendors(data);
			setLoading(false);
		} catch (error) {
			console.error("Error fetching vendors: ", error);
			setLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const vendorData = {
				...formData,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			if (editingVendor) {
				await updateDoc(doc(db, "vendors", editingVendor.id), {
					...formData,
					updatedAt: new Date().toISOString(),
				});
			} else {
				await addDoc(collection(db, "vendors"), vendorData);
			}

			resetForm();
			fetchVendors();
		} catch (error) {
			console.error("Error saving vendor: ", error);
		}
	};

	const handleEdit = (vendor: Vendor) => {
		setEditingVendor(vendor);
		setFormData({
			name: vendor.name,
			contactPerson: vendor.contactPerson,
			email: vendor.email,
			phone: vendor.phone,
			address: vendor.address,
			gstNumber: vendor.gstNumber || "",
			paymentTerms: vendor.paymentTerms,
			isActive: vendor.isActive,
		});
		setShowForm(true);
	};

	const handleDelete = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this vendor?")) {
			try {
				await deleteDoc(doc(db, "vendors", id));
				fetchVendors();
			} catch (error) {
				console.error("Error deleting vendor: ", error);
			}
		}
	};

	const handleToggleActive = async (id: string, currentStatus: boolean) => {
		try {
			await updateDoc(doc(db, "vendors", id), {
				isActive: !currentStatus,
				updatedAt: new Date().toISOString(),
			});
			fetchVendors();
		} catch (error) {
			console.error("Error updating vendor status: ", error);
		}
	};

	const resetForm = () => {
		setFormData({
			name: "",
			contactPerson: "",
			email: "",
			phone: "",
			address: "",
			gstNumber: "",
			paymentTerms: "30 days",
			isActive: true,
		});
		setShowForm(false);
		setEditingVendor(null);
	};

	if (loading) {
		return <div className="text-center py-8">Loading vendors...</div>;
	}

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
					Vendor Management
				</h2>
				<button
					onClick={() => setShowForm(true)}
					className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300">
					Add Vendor
				</button>
			</div>

			{/* Vendor Form Modal */}
			{showForm && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
								{editingVendor
									? "Edit Vendor"
									: "Add New Vendor"}
							</h3>

							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Vendor Name *
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
											Email *
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
											GST Number
										</label>
										<input
											type="text"
											value={formData.gstNumber}
											onChange={(e) =>
												setFormData({
													...formData,
													gstNumber: e.target.value,
												})
											}
											className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
											placeholder="22AAAAA0000A1Z5"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Payment Terms
										</label>
										<select
											value={formData.paymentTerms}
											onChange={(e) =>
												setFormData({
													...formData,
													paymentTerms:
														e.target.value,
												})
											}
											className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
											<option value="15 days">
												15 days
											</option>
											<option value="30 days">
												30 days
											</option>
											<option value="45 days">
												45 days
											</option>
											<option value="60 days">
												60 days
											</option>
											<option value="90 days">
												90 days
											</option>
											<option value="COD">
												Cash on Delivery
											</option>
											<option value="Prepaid">
												Prepaid
											</option>
										</select>
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
										Active
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
										{editingVendor
											? "Update Vendor"
											: "Add Vendor"}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Vendors Table */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
				<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
					<thead className="bg-gray-50 dark:bg-gray-700">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Vendor
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Contact
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								GST Number
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Payment Terms
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
						{vendors.map((vendor) => (
							<tr key={vendor.id}>
								<td className="px-6 py-4 whitespace-nowrap">
									<div>
										<div className="text-sm font-medium text-gray-900 dark:text-white">
											{vendor.name}
										</div>
										<div className="text-sm text-gray-500 dark:text-gray-400">
											{vendor.address}
										</div>
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-900 dark:text-white">
										{vendor.contactPerson}
									</div>
									<div className="text-sm text-gray-500 dark:text-gray-400">
										{vendor.email}
									</div>
									<div className="text-sm text-gray-500 dark:text-gray-400">
										{vendor.phone}
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
									{vendor.gstNumber || "N/A"}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
									{vendor.paymentTerms}
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
											vendor.isActive
												? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
												: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
										}`}>
										{vendor.isActive
											? "Active"
											: "Inactive"}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<div className="flex space-x-2">
										<button
											onClick={() => handleEdit(vendor)}
											className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
											Edit
										</button>
										<button
											onClick={() =>
												handleToggleActive(
													vendor.id,
													vendor.isActive
												)
											}
											className={`${
												vendor.isActive
													? "text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
													: "text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
											}`}>
											{vendor.isActive
												? "Deactivate"
												: "Activate"}
										</button>
										<button
											onClick={() =>
												handleDelete(vendor.id)
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

				{vendors.length === 0 && (
					<div className="text-center py-8 text-gray-500 dark:text-gray-400">
						No vendors found. Add your first vendor to get started.
					</div>
				)}
			</div>
		</div>
	);
};

export default VendorManagement;
