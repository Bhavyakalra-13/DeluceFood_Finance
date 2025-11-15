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
		return <div className="text-center py-8 text-black dark:text-white">Loading products...</div>;
	}

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-black dark:text-white">
					Product Management
				</h2>
				<button
					onClick={() => setShowForm(true)}
					className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition duration-300">
					Add Product
				</button>
			</div>

			{/* Product Form Modal */}
			{showForm && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-boxdark rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-stroke dark:border-strokedark">
						<div className="p-6">
							<h3 className="text-xl font-semibold mb-4 text-black dark:text-white">
								{editingProduct
									? "Edit Product"
									: "Add New Product"}
							</h3>

							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-body dark:text-bodydark mb-1">
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
											className="w-full p-2 border border-stroke rounded-md bg-white text-black dark:bg-form-input dark:border-form-strokedark dark:text-white"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-body dark:text-bodydark mb-1">
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
											className="w-full p-2 border border-stroke rounded-md bg-white text-black dark:bg-form-input dark:border-form-strokedark dark:text-white"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-body dark:text-bodydark mb-1">
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
											className="w-full p-2 border border-stroke rounded-md bg-white text-black dark:bg-form-input dark:border-form-strokedark dark:text-white"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-body dark:text-bodydark mb-1">
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
											className="w-full p-2 border border-stroke rounded-md bg-white text-black dark:bg-form-input dark:border-form-strokedark dark:text-white"
											min="0"
											step="0.01"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-body dark:text-bodydark mb-1">
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
											className="w-full p-2 border border-stroke rounded-md bg-white text-black dark:bg-form-input dark:border-form-strokedark dark:text-white"
											min="0"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-body dark:text-bodydark mb-1">
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
											className="w-full p-2 border border-stroke rounded-md bg-white text-black dark:bg-form-input dark:border-form-strokedark dark:text-white">
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
										<label className="block text-sm font-medium text-body dark:text-bodydark mb-1">
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
											className="w-full p-2 border border-stroke rounded-md bg-white text-black dark:bg-form-input dark:border-form-strokedark dark:text-white"
											min="0"
											max="100"
											step="0.01"
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-body dark:text-bodydark mb-1">
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
										className="w-full p-2 border border-stroke rounded-md bg-white text-black dark:bg-form-input dark:border-form-strokedark dark:text-white"
										rows={3}
									/>
								</div>

								<div className="flex justify-end space-x-2 pt-4">
									<button
										type="button"
										onClick={handleCancel}
										className="px-4 py-2 border border-stroke dark:border-strokedark rounded-md text-body dark:text-bodydark hover:bg-gray dark:hover:bg-meta-4">
										Cancel
									</button>
									<button
										type="submit"
										className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90">
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
			<div className="bg-white dark:bg-boxdark rounded-lg shadow overflow-hidden border border-stroke dark:border-strokedark">
				<table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
					<thead className="bg-gray-2 dark:bg-meta-4">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-body dark:text-bodydark2 uppercase tracking-wider">
								Product
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-body dark:text-bodydark2 uppercase tracking-wider">
								SKU
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-body dark:text-bodydark2 uppercase tracking-wider">
								Category
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-body dark:text-bodydark2 uppercase tracking-wider">
								Price
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-body dark:text-bodydark2 uppercase tracking-wider">
								Stock
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-body dark:text-bodydark2 uppercase tracking-wider">
								Tax Rate
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-body dark:text-bodydark2 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white dark:bg-boxdark divide-y divide-stroke dark:divide-strokedark">
						{products.map((product) => (
							<tr key={product.id}>
								<td className="px-6 py-4 whitespace-nowrap">
									<div>
										<div className="text-sm font-medium text-black dark:text-white">
											{product.name}
										</div>
										<div className="text-sm text-body dark:text-bodydark">
											{product.description}
										</div>
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
									{product.sku}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
									{product.category}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
									₹{product.price.toFixed(2)}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
									{product.stock} {product.unit}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
									{product.taxRate}%
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<div className="flex space-x-2">
										<button
											onClick={() => handleEdit(product)}
											className="text-primary hover:text-opacity-80 dark:text-primary dark:hover:text-opacity-70">
											Edit
										</button>
										<button
											onClick={() =>
												handleDelete(product.id)
											}
											className="text-danger hover:text-opacity-80 dark:text-danger dark:hover:text-opacity-70">
											Delete
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{products.length === 0 && (
					<div className="text-center py-8 text-body dark:text-bodydark">
						No products found. Add your first product to get
						started.
					</div>
				)}
			</div>
		</div>
	);
};

export default ProductManagement;
