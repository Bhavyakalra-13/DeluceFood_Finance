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
import { ExpenseCategory } from "@/types/financial";

const ExpenseCategories: React.FC = () => {
	const [categories, setCategories] = useState<ExpenseCategory[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [showForm, setShowForm] = useState<boolean>(false);
	const [editingCategory, setEditingCategory] =
		useState<ExpenseCategory | null>(null);
	const [formData, setFormData] = useState<
		Omit<ExpenseCategory, "id" | "createdAt">
	>({
		name: "",
		description: "",
		isActive: true,
	});

	useEffect(() => {
		fetchCategories();
	}, []);

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
			setLoading(false);
		} catch (error) {
			console.error("Error fetching categories: ", error);
			setLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const categoryData = {
				...formData,
				createdAt: new Date().toISOString(),
			};

			if (editingCategory) {
				await updateDoc(
					doc(db, "expenseCategories", editingCategory.id),
					{
						...formData,
					}
				);
			} else {
				await addDoc(collection(db, "expenseCategories"), categoryData);
			}

			resetForm();
			fetchCategories();
		} catch (error) {
			console.error("Error saving category: ", error);
		}
	};

	const handleEdit = (category: ExpenseCategory) => {
		setEditingCategory(category);
		setFormData({
			name: category.name,
			description: category.description,
			isActive: category.isActive,
		});
		setShowForm(true);
	};

	const handleDelete = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this category?")) {
			try {
				await deleteDoc(doc(db, "expenseCategories", id));
				fetchCategories();
			} catch (error) {
				console.error("Error deleting category: ", error);
			}
		}
	};

	const handleToggleActive = async (id: string, currentStatus: boolean) => {
		try {
			await updateDoc(doc(db, "expenseCategories", id), {
				isActive: !currentStatus,
			});
			fetchCategories();
		} catch (error) {
			console.error("Error updating category status: ", error);
		}
	};

	const resetForm = () => {
		setFormData({
			name: "",
			description: "",
			isActive: true,
		});
		setShowForm(false);
		setEditingCategory(null);
	};

	if (loading) {
		return <div className="text-center py-8">Loading categories...</div>;
	}

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
					Expense Categories
				</h2>
				<button
					onClick={() => setShowForm(true)}
					className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300">
					Add Category
				</button>
			</div>

			{/* Category Form Modal */}
			{showForm && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
						<div className="p-6">
							<h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
								{editingCategory
									? "Edit Category"
									: "Add New Category"}
							</h3>

							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Category Name *
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
										Description
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
										{editingCategory
											? "Update Category"
											: "Add Category"}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Categories Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{categories.map((category) => (
					<div
						key={category.id}
						className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 ${
							category.isActive
								? "border-green-500"
								: "border-gray-400"
						}`}>
						<div className="flex justify-between items-start mb-4">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
								{category.name}
							</h3>
							<span
								className={`px-2 py-1 text-xs font-semibold rounded-full ${
									category.isActive
										? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
										: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
								}`}>
								{category.isActive ? "Active" : "Inactive"}
							</span>
						</div>

						{category.description && (
							<p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
								{category.description}
							</p>
						)}

						<div className="flex justify-between items-center">
							<span className="text-xs text-gray-500 dark:text-gray-400">
								Created:{" "}
								{new Date(
									category.createdAt
								).toLocaleDateString()}
							</span>
							<div className="flex space-x-2">
								<button
									onClick={() => handleEdit(category)}
									className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
									Edit
								</button>
								<button
									onClick={() =>
										handleToggleActive(
											category.id,
											category.isActive
										)
									}
									className={`text-sm ${
										category.isActive
											? "text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
											: "text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
									}`}>
									{category.isActive
										? "Deactivate"
										: "Activate"}
								</button>
								<button
									onClick={() => handleDelete(category.id)}
									className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm">
									Delete
								</button>
							</div>
						</div>
					</div>
				))}
			</div>

			{categories.length === 0 && (
				<div className="text-center py-12 text-gray-500 dark:text-gray-400">
					<svg
						className="mx-auto h-12 w-12 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
						/>
					</svg>
					<h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
						No categories
					</h3>
					<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
						Get started by creating a new expense category.
					</p>
				</div>
			)}
		</div>
	);
};

export default ExpenseCategories;
