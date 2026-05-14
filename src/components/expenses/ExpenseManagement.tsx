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
	where,
} from "firebase/firestore";
import db from "@/utils/firestore";
import { Expense, ExpenseCategory, Vendor } from "@/types/financial";

const ExpenseManagement: React.FC = () => {
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [categories, setCategories] = useState<ExpenseCategory[]>([]);
	const [vendors, setVendors] = useState<Vendor[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [showForm, setShowForm] = useState<boolean>(false);
	const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
	const [filters, setFilters] = useState({
		category: "",
		vendor: "",
		status: "",
		dateRange: {
			startDate: new Date(new Date().getFullYear(), 0, 1)
				.toISOString()
				.split("T")[0],
			endDate: new Date().toISOString().split("T")[0],
		},
	});

	const [formData, setFormData] = useState<
		Omit<Expense, "id" | "createdAt" | "updatedAt">
	>({
		date: new Date().toISOString().split("T")[0],
		amount: 0,
		description: "",
		category: "",
		vendor: "",
		receiptUrl: "",
		status: "pending",
	});

	useEffect(() => {
		fetchExpenses();
		fetchCategories();
		fetchVendors();
	}, [filters]);

	const fetchExpenses = async () => {
		try {
			setLoading(true);
			let q = query(collection(db, "expenses"), orderBy("date", "desc"));

			// Apply filters
			if (filters.category) {
				q = query(q, where("category", "==", filters.category));
			}
			if (filters.vendor) {
				q = query(q, where("vendor", "==", filters.vendor));
			}
			if (filters.status) {
				q = query(q, where("status", "==", filters.status));
			}

			const querySnapshot = await getDocs(q);
			let data = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Expense[];

			// Filter by date range
			if (filters.dateRange.startDate && filters.dateRange.endDate) {
				data = data.filter(
					(expense) =>
						expense.date >= filters.dateRange.startDate &&
						expense.date <= filters.dateRange.endDate
				);
			}

			setExpenses(data);
		} catch (error) {
			console.error("Error fetching expenses: ", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchCategories = async () => {
		try {
			const querySnapshot = await getDocs(
				collection(db, "expenseCategories")
			);
			const data = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as ExpenseCategory[];
			setCategories(data);
		} catch (error) {
			console.error("Error fetching categories: ", error);
		}
	};

	const fetchVendors = async () => {
		try {
			const querySnapshot = await getDocs(collection(db, "vendors"));
			const data = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Vendor[];
			setVendors(data);
		} catch (error) {
			console.error("Error fetching vendors: ", error);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const expenseData = {
				...formData,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			if (editingExpense) {
				await updateDoc(doc(db, "expenses", editingExpense.id), {
					...formData,
					updatedAt: new Date().toISOString(),
				});
			} else {
				await addDoc(collection(db, "expenses"), expenseData);
			}

			resetForm();
			fetchExpenses();
		} catch (error) {
			console.error("Error saving expense: ", error);
		}
	};

	const handleEdit = (expense: Expense) => {
		setEditingExpense(expense);
		setFormData({
			date: expense.date,
			amount: expense.amount,
			description: expense.description,
			category: expense.category,
			vendor: expense.vendor,
			receiptUrl: expense.receiptUrl || "",
			status: expense.status,
		});
		setShowForm(true);
	};

	const handleDelete = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this expense?")) {
			try {
				await deleteDoc(doc(db, "expenses", id));
				fetchExpenses();
			} catch (error) {
				console.error("Error deleting expense: ", error);
			}
		}
	};

	const handleApprove = async (id: string) => {
		try {
			await updateDoc(doc(db, "expenses", id), {
				status: "approved",
				approvedBy: "current-user", // In real app, get from auth context
				approvedAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
			fetchExpenses();
		} catch (error) {
			console.error("Error approving expense: ", error);
		}
	};

	const handleReject = async (id: string) => {
		try {
			await updateDoc(doc(db, "expenses", id), {
				status: "rejected",
				approvedBy: "current-user",
				approvedAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
			fetchExpenses();
		} catch (error) {
			console.error("Error rejecting expense: ", error);
		}
	};

	const resetForm = () => {
		setFormData({
			date: new Date().toISOString().split("T")[0],
			amount: 0,
			description: "",
			category: "",
			vendor: "",
			receiptUrl: "",
			status: "pending",
		});
		setShowForm(false);
		setEditingExpense(null);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "approved":
				return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
			case "rejected":
				return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
			case "pending":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
		}
	};

	const totalAmount = expenses.reduce(
		(sum, expense) => sum + expense.amount,
		0
	);
	const pendingAmount = expenses
		.filter((expense) => expense.status === "pending")
		.reduce((sum, expense) => sum + expense.amount, 0);

	if (loading) {
		return <div className="text-center py-8">Loading expenses...</div>;
	}

	return (
		<div className="p-6">
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<div>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
						Expense Management
					</h2>
					<p className="text-gray-600 dark:text-gray-400">
						Track and manage business expenses
					</p>
				</div>
				<button
					onClick={() => setShowForm(true)}
					className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300">
					Add Expense
				</button>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
							<svg
								className="w-6 h-6 text-blue-600 dark:text-blue-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
								/>
							</svg>
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
								Total Expenses
							</p>
							<p className="text-2xl font-semibold text-gray-900 dark:text-white">
								₹{totalAmount.toLocaleString()}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
							<svg
								className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
								/>
							</svg>
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
								Pending Approval
							</p>
							<p className="text-2xl font-semibold text-gray-900 dark:text-white">
								₹{pendingAmount.toLocaleString()}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
							<svg
								className="w-6 h-6 text-green-600 dark:text-green-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
								Approved
							</p>
							<p className="text-2xl font-semibold text-gray-900 dark:text-white">
								{
									expenses.filter(
										(e) => e.status === "approved"
									).length
								}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
					Filters
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Category
						</label>
						<select
							value={filters.category}
							onChange={(e) =>
								setFilters({
									...filters,
									category: e.target.value,
								})
							}
							className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
							<option value="">All Categories</option>
							{categories.map((category) => (
								<option key={category.id} value={category.name}>
									{category.name}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Vendor
						</label>
						<select
							value={filters.vendor}
							onChange={(e) =>
								setFilters({
									...filters,
									vendor: e.target.value,
								})
							}
							className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
							<option value="">All Vendors</option>
							{vendors.map((vendor) => (
								<option key={vendor.id} value={vendor.name}>
									{vendor.name}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Status
						</label>
						<select
							value={filters.status}
							onChange={(e) =>
								setFilters({
									...filters,
									status: e.target.value,
								})
							}
							className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
							<option value="">All Status</option>
							<option value="pending">Pending</option>
							<option value="approved">Approved</option>
							<option value="rejected">Rejected</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Date Range
						</label>
						<div className="flex space-x-2">
							<input
								type="date"
								value={filters.dateRange.startDate}
								onChange={(e) =>
									setFilters({
										...filters,
										dateRange: {
											...filters.dateRange,
											startDate: e.target.value,
										},
									})
								}
								className="flex-1 p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
							/>
							<input
								type="date"
								value={filters.dateRange.endDate}
								onChange={(e) =>
									setFilters({
										...filters,
										dateRange: {
											...filters.dateRange,
											endDate: e.target.value,
										},
									})
								}
								className="flex-1 p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Expense Form Modal */}
			{showForm && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
								{editingExpense
									? "Edit Expense"
									: "Add New Expense"}
							</h3>

							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Date *
										</label>
										<input
											type="date"
											value={formData.date}
											onChange={(e) =>
												setFormData({
													...formData,
													date: e.target.value,
												})
											}
											className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Amount (₹) *
										</label>
										<input
											type="number"
											value={formData.amount}
											onChange={(e) =>
												setFormData({
													...formData,
													amount:
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
											Category *
										</label>
										<select
											value={formData.category}
											onChange={(e) =>
												setFormData({
													...formData,
													category: e.target.value,
												})
											}
											className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
											required>
											<option value="">
												Select Category
											</option>
											{categories.map((category) => (
												<option
													key={category.id}
													value={category.name}>
													{category.name}
												</option>
											))}
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Vendor *
										</label>
										<select
											value={formData.vendor}
											onChange={(e) =>
												setFormData({
													...formData,
													vendor: e.target.value,
												})
											}
											className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
											required>
											<option value="">
												Select Vendor
											</option>
											{vendors.map((vendor) => (
												<option
													key={vendor.id}
													value={vendor.name}>
													{vendor.name}
												</option>
											))}
										</select>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Description *
									</label>
									<textarea
										value={formData.description}
										onChange={(e) =>
											setFormData({
												...formData,
												description: e.target.value,
											})
										}
										className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
										rows={3}
										required
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Receipt URL
									</label>
									<input
										type="url"
										value={formData.receiptUrl}
										onChange={(e) =>
											setFormData({
												...formData,
												receiptUrl: e.target.value,
											})
										}
										className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
										placeholder="https://example.com/receipt.jpg"
									/>
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
												status: e.target.value as
													| "pending"
													| "approved"
													| "rejected",
											})
										}
										className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
										<option value="pending">Pending</option>
										<option value="approved">
											Approved
										</option>
										<option value="rejected">
											Rejected
										</option>
									</select>
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
										{editingExpense
											? "Update Expense"
											: "Add Expense"}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Expenses Table */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
					<thead className="bg-gray-50 dark:bg-gray-700">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Date
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Description
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Category
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Vendor
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Amount
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
						{expenses.map((expense) => (
							<tr key={expense.id}>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
									{new Date(
										expense.date
									).toLocaleDateString()}
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-900 dark:text-white">
										{expense.description}
									</div>
									{expense.receiptUrl && (
										<a
											href={expense.receiptUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400">
											View Receipt
										</a>
									)}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
									{expense.category}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
									{expense.vendor}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
									₹{expense.amount.toLocaleString()}
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
											expense.status
										)}`}>
										{expense.status}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<div className="flex space-x-2">
										<button
											onClick={() => handleEdit(expense)}
											className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
											Edit
										</button>
										{expense.status === "pending" && (
											<>
												<button
													onClick={() =>
														handleApprove(
															expense.id
														)
													}
													className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
													Approve
												</button>
												<button
													onClick={() =>
														handleReject(expense.id)
													}
													className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
													Reject
												</button>
											</>
										)}
										<button
											onClick={() =>
												handleDelete(expense.id)
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

				{expenses.length === 0 && (
					<div className="text-center py-8 text-gray-500 dark:text-gray-400">
						No expenses found. Add your first expense to get
						started.
					</div>
				)}
			</div>
		</div>
	);
};

export default ExpenseManagement;
