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

interface Customer {
	id: string;
	name: string;
	email: string;
	phone: string;
	address: string;
	city: string;
	state: string;
	pincode: string;
	company?: string;
	gstNumber?: string;
	createdAt: string;
	updatedAt: string;
}

const CustomerManagement: React.FC = () => {
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [showForm, setShowForm] = useState<boolean>(false);
	const [editingCustomer, setEditingCustomer] = useState<Customer | null>(
		null
	);
	const [formData, setFormData] = useState<
		Omit<Customer, "id" | "createdAt" | "updatedAt">
	>({
		name: "",
		email: "",
		phone: "",
		address: "",
		city: "",
		state: "",
		pincode: "",
		company: "",
		gstNumber: "",
	});

	useEffect(() => {
		fetchCustomers();
	}, []);

	const fetchCustomers = async () => {
		try {
			const querySnapshot = await getDocs(collection(db, "customers"));
			const data = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Customer[];
			setCustomers(data);
			setLoading(false);
		} catch (error) {
			console.error("Error fetching customers: ", error);
			setLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const customerData = {
				...formData,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			if (editingCustomer) {
				await updateDoc(doc(db, "customers", editingCustomer.id), {
					...formData,
					updatedAt: new Date().toISOString(),
				});
			} else {
				await addDoc(collection(db, "customers"), customerData);
			}

			setFormData({
				name: "",
				email: "",
				phone: "",
				address: "",
				city: "",
				state: "",
				pincode: "",
				company: "",
				gstNumber: "",
			});
			setShowForm(false);
			setEditingCustomer(null);
			fetchCustomers();
		} catch (error) {
			console.error("Error saving customer: ", error);
		}
	};

	const handleEdit = (customer: Customer) => {
		setEditingCustomer(customer);
		setFormData({
			name: customer.name,
			email: customer.email,
			phone: customer.phone,
			address: customer.address,
			city: customer.city,
			state: customer.state,
			pincode: customer.pincode,
			company: customer.company || "",
			gstNumber: customer.gstNumber || "",
		});
		setShowForm(true);
	};

	const handleDelete = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this customer?")) {
			try {
				await deleteDoc(doc(db, "customers", id));
				fetchCustomers();
			} catch (error) {
				console.error("Error deleting customer: ", error);
			}
		}
	};

	const handleCancel = () => {
		setShowForm(false);
		setEditingCustomer(null);
		setFormData({
			name: "",
			email: "",
			phone: "",
			address: "",
			city: "",
			state: "",
			pincode: "",
			company: "",
			gstNumber: "",
		});
	};

	if (loading) {
		return <div className="text-center py-8">Loading customers...</div>;
	}

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
					Customer Management
				</h2>
				<button
					onClick={() => setShowForm(true)}
					className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300">
					Add Customer
				</button>
			</div>

			{/* Customer Form Modal */}
			{showForm && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
								{editingCustomer
									? "Edit Customer"
									: "Add New Customer"}
							</h3>

							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Customer Name *
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
											Company
										</label>
										<input
											type="text"
											value={formData.company}
											onChange={(e) =>
												setFormData({
													...formData,
													company: e.target.value,
												})
											}
											className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
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

								<div className="flex justify-end space-x-2 pt-4">
									<button
										type="button"
										onClick={handleCancel}
										className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
										Cancel
									</button>
									<button
										type="submit"
										className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
										{editingCustomer
											? "Update Customer"
											: "Add Customer"}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Customers Table */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
				<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
					<thead className="bg-gray-50 dark:bg-gray-700">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Customer
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Contact
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Company
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Location
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
						{customers.map((customer) => (
							<tr key={customer.id}>
								<td className="px-6 py-4 whitespace-nowrap">
									<div>
										<div className="text-sm font-medium text-gray-900 dark:text-white">
											{customer.name}
										</div>
										{customer.gstNumber && (
											<div className="text-sm text-gray-500 dark:text-gray-400">
												GST: {customer.gstNumber}
											</div>
										)}
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-900 dark:text-white">
										{customer.email}
									</div>
									<div className="text-sm text-gray-500 dark:text-gray-400">
										{customer.phone}
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
									{customer.company || "N/A"}
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-900 dark:text-white">
										{customer.city}, {customer.state}
									</div>
									<div className="text-sm text-gray-500 dark:text-gray-400">
										{customer.pincode}
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<div className="flex space-x-2">
										<button
											onClick={() => handleEdit(customer)}
											className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
											Edit
										</button>
										<button
											onClick={() =>
												handleDelete(customer.id)
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

				{customers.length === 0 && (
					<div className="text-center py-8 text-gray-500 dark:text-gray-400">
						No customers found. Add your first customer to get
						started.
					</div>
				)}
			</div>
		</div>
	);
};

export default CustomerManagement;
