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

interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	category: string;
	sku: string;
	stock: number;
	unit: string;
	taxRate: number;
	createdAt: string;
	updatedAt: string;
}

const ProductManagement: React.FC = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [showForm, setShowForm] = useState<boolean>(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [formData, setFormData] = useState<
		Omit<Product, "id" | "createdAt" | "updatedAt">
	>({
		name: "",
		description: "",
		price: 0,
		category: "",
		sku: "",
		stock: 0,
		unit: "pcs",
		taxRate: 0,
	});

	useEffect(() => {
		fetchProducts();
	}, []);

	const fetchProducts = async () => {
		try {
			const querySnapshot = await getDocs(collection(db, "products"));
			const data = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Product[];
			setProducts(data);
			setLoading(false);
		} catch (error) {
			console.error("Error fetching products: ", error);
			setLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const productData = {
				...formData,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			if (editingProduct) {
				await updateDoc(doc(db, "products", editingProduct.id), {
					...formData,
					updatedAt: new Date().toISOString(),
				});
			} else {
				await addDoc(collection(db, "products"), productData);
			}

			setFormData({
				name: "",
				description: "",
				price: 0,
				category: "",
				sku: "",
				stock: 0,
				unit: "pcs",
				taxRate: 0,
			});
			setShowForm(false);
			setEditingProduct(null);
			fetchProducts();
		} catch (error) {
			console.error("Error saving product: ", error);
		}
	};

	const handleEdit = (product: Product) => {
		setEditingProduct(product);
		setFormData({
			name: product.name,
			description: product.description,
			price: product.price,
			category: product.category,
			sku: product.sku,
			stock: product.stock,
			unit: product.unit,
			taxRate: product.taxRate,
		});
		setShowForm(true);
	};

	const handleDelete = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this product?")) {
			try {
				await deleteDoc(doc(db, "products", id));
				fetchProducts();
			} catch (error) {
				console.error("Error deleting product: ", error);
			}
		}
	};

	const handleCancel = () => {
		setShowForm(false);
		setEditingProduct(null);
		setFormData({
			name: "",
			description: "",
			price: 0,
			category: "",
			sku: "",
			stock: 0,
			unit: "pcs",
			taxRate: 0,
		});
	};

	if (loading) {
		return <div className="text-center py-8">Loading products...</div>;
	}

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
					Product Management
				</h2>
				<button
					onClick={() => setShowForm(true)}
					className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300">
					Add Product
				</button>
			</div>

			{/* Product Form Modal */}
			{showForm && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
								{editingProduct
									? "Edit Product"
									: "Add New Product"}
							</h3>

							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Product Name *
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
											SKU *
										</label>
										<input
											type="text"
											value={formData.sku}
											onChange={(e) =>
												setFormData({
													...formData,
													sku: e.target.value,
												})
											}
											className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Category
										</label>
										<input
											type="text"
											value={formData.category}
											onChange={(e) =>
												setFormData({
													...formData,
													category: e.target.value,
												})
											}
											className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Price (₹) *
										</label>
										<input
											type="number"
											value={formData.price}
											onChange={(e) =>
												setFormData({
													...formData,
													price:
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
											Stock Quantity *
										</label>
										<input
											type="number"
											value={formData.stock}
											onChange={(e) =>
												setFormData({
													...formData,
													stock:
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
											Tax Rate (%)
										</label>
										<input
											type="number"
											value={formData.taxRate}
											onChange={(e) =>
												setFormData({
													...formData,
													taxRate:
														parseFloat(
															e.target.value
														) || 0,
												})
											}
											className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
											min="0"
											max="100"
											step="0.01"
										/>
									</div>
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
										{editingProduct
											? "Update Product"
											: "Add Product"}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Products Table */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
				<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
					<thead className="bg-gray-50 dark:bg-gray-700">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Product
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								SKU
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Category
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Price
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Stock
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Tax Rate
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
						{products.map((product) => (
							<tr key={product.id}>
								<td className="px-6 py-4 whitespace-nowrap">
									<div>
										<div className="text-sm font-medium text-gray-900 dark:text-white">
											{product.name}
										</div>
										<div className="text-sm text-gray-500 dark:text-gray-400">
											{product.description}
										</div>
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
									{product.sku}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
									{product.category}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
									₹{product.price.toFixed(2)}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
									{product.stock} {product.unit}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
									{product.taxRate}%
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<div className="flex space-x-2">
										<button
											onClick={() => handleEdit(product)}
											className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
											Edit
										</button>
										<button
											onClick={() =>
												handleDelete(product.id)
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

				{products.length === 0 && (
					<div className="text-center py-8 text-gray-500 dark:text-gray-400">
						No products found. Add your first product to get
						started.
					</div>
				)}
			</div>
		</div>
	);
};

export default ProductManagement;
