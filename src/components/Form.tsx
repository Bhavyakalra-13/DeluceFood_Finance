// components/Form.tsx
import { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import db from "@utils/firestore";

interface FormData {
	// Product details
	product: string;
	quantity: number;
	price: number;
	description?: string;

	// Buyer details
	buyerName: string;
	buyerEmail: string;
	buyerPhone: string;
	buyerAddress: string;
	buyerCity: string;
	buyerState: string;
	buyerPincode: string;

	// Invoice details
	invoiceDate: string;
	dueDate: string;
	paymentStatus: string;
	invoiceNumber: string;

	// Additional fields
	taxRate: number;
	discount: number;
	notes?: string;
}

const Form = () => {
	const [formData, setFormData] = useState<FormData>({
		// Product details
		product: "",
		quantity: 0,
		price: 0,
		description: "",

		// Buyer details
		buyerName: "",
		buyerEmail: "",
		buyerPhone: "",
		buyerAddress: "",
		buyerCity: "",
		buyerState: "",
		buyerPincode: "",

		// Invoice details
		invoiceDate: "",
		dueDate: "",
		paymentStatus: "",
		invoiceNumber: `INV-${Date.now()}`,

		// Additional fields
		taxRate: 0,
		discount: 0,
		notes: "",
	});

	const [products, setProducts] = useState<any[]>([]);
	const [customers, setCustomers] = useState<any[]>([]);

	useEffect(() => {
		fetchProducts();
		fetchCustomers();
	}, []);

	const fetchProducts = async () => {
		try {
			const querySnapshot = await getDocs(collection(db, "products"));
			const data = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			setProducts(data);
		} catch (error) {
			console.error("Error fetching products: ", error);
		}
	};

	const fetchCustomers = async () => {
		try {
			const querySnapshot = await getDocs(collection(db, "customers"));
			const data = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			setCustomers(data);
		} catch (error) {
			console.error("Error fetching customers: ", error);
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const docRef = await addDoc(collection(db, "invoices"), formData);
			console.log("Document written with ID: ", docRef.id);
			alert("Form submitted successfully!");
		} catch (e) {
			console.error("Error adding document: ", e);
		}
	};

	return (
		<div className="w-full mx-auto p-6 bg-white dark:bg-slate-700 shadow-lg rounded-lg">
			<h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
				Create Invoice
			</h2>

			<form onSubmit={handleSubmit} className="space-y-8">
				{/* Invoice Details Section */}
				<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
					<h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
						Invoice Details
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<label className="block text-gray-700 dark:text-gray-300">
							Invoice Number:
							<input
								type="text"
								name="invoiceNumber"
								value={formData.invoiceNumber}
								onChange={handleChange}
								className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
								required
							/>
						</label>
						<label className="block text-gray-700 dark:text-gray-300">
							Invoice Date:
							<input
								type="date"
								name="invoiceDate"
								value={formData.invoiceDate}
								onChange={handleChange}
								className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
								required
							/>
						</label>
						<label className="block text-gray-700 dark:text-gray-300">
							Due Date:
							<input
								type="date"
								name="dueDate"
								value={formData.dueDate}
								onChange={handleChange}
								className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
								required
							/>
						</label>
						<label className="block text-gray-700 dark:text-gray-300">
							Payment Status:
							<select
								name="paymentStatus"
								value={formData.paymentStatus}
								onChange={handleChange}
								className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
								required>
								<option value="">Select Status</option>
								<option value="Draft">Draft</option>
								<option value="Sent">Sent</option>
								<option value="Paid">Paid</option>
								<option value="Overdue">Overdue</option>
							</select>
						</label>
					</div>
				</div>

				{/* Buyer Details Section */}
				<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
					<h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
						Buyer Details
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<label className="block text-gray-700 dark:text-gray-300">
							Customer:
							<select
								name="buyerName"
								value={formData.buyerName}
								onChange={(e) => {
									const selectedCustomer = customers.find(
										(c) => c.name === e.target.value
									);
									setFormData({
										...formData,
										buyerName: e.target.value,
										buyerEmail:
											selectedCustomer?.email || "",
										buyerPhone:
											selectedCustomer?.phone || "",
										buyerAddress:
											selectedCustomer?.address || "",
										buyerCity: selectedCustomer?.city || "",
										buyerState:
											selectedCustomer?.state || "",
										buyerPincode:
											selectedCustomer?.pincode || "",
									});
								}}
								className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
								required>
								<option value="">Select a customer</option>
								{customers.map((customer) => (
									<option
										key={customer.id}
										value={customer.name}>
										{customer.name} - {customer.email}
									</option>
								))}
							</select>
						</label>
						<label className="block text-gray-700 dark:text-gray-300">
							Email:
							<input
								type="email"
								name="buyerEmail"
								value={formData.buyerEmail}
								onChange={handleChange}
								className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
								required
							/>
						</label>
						<label className="block text-gray-700 dark:text-gray-300">
							Phone:
							<input
								type="tel"
								name="buyerPhone"
								value={formData.buyerPhone}
								onChange={handleChange}
								className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
								required
							/>
						</label>
						<label className="block text-gray-700 dark:text-gray-300">
							City:
							<input
								type="text"
								name="buyerCity"
								value={formData.buyerCity}
								onChange={handleChange}
								className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
								required
							/>
						</label>
						<label className="block text-gray-700 dark:text-gray-300">
							State:
							<input
								type="text"
								name="buyerState"
								value={formData.buyerState}
								onChange={handleChange}
								className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
								required
							/>
						</label>
						<label className="block text-gray-700 dark:text-gray-300">
							Pincode:
							<input
								type="text"
								name="buyerPincode"
								value={formData.buyerPincode}
								onChange={handleChange}
								className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
								required
							/>
						</label>
					</div>
					<label className="block mt-4 text-gray-700 dark:text-gray-300">
						Address:
						<textarea
							name="buyerAddress"
							value={formData.buyerAddress}
							onChange={(e) =>
								setFormData({
									...formData,
									buyerAddress: e.target.value,
								})
							}
							className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
							rows={3}
							required
						/>
					</label>
				</div>

				{/* Product Details Section */}
				<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
					<h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
						Product Details
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<label className="block text-gray-700 dark:text-gray-300">
							Product:
							<select
								name="product"
								value={formData.product}
								onChange={(e) => {
									const selectedProduct = products.find(
										(p) => p.name === e.target.value
									);
									setFormData({
										...formData,
										product: e.target.value,
										price: selectedProduct?.price || 0,
										description:
											selectedProduct?.description || "",
										taxRate: selectedProduct?.taxRate || 0,
									});
								}}
								className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
								required>
								<option value="">Select a product</option>
								{products.map((product) => (
									<option
										key={product.id}
										value={product.name}>
										{product.name} - ₹{product.price} (
										{product.stock} {product.unit})
									</option>
								))}
							</select>
						</label>
						<label className="block text-gray-700 dark:text-gray-300">
							Price (₹):
							<input
								type="number"
								name="price"
								value={formData.price}
								onChange={handleChange}
								className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
								required
								min="0"
								step="0.01"
							/>
						</label>
						<label className="block text-gray-700 dark:text-gray-300">
							Quantity:
							<input
								type="number"
								name="quantity"
								value={formData.quantity}
								onChange={handleChange}
								className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
								required
								min="1"
							/>
						</label>
						<label className="block text-gray-700 dark:text-gray-300">
							Tax Rate (%):
							<input
								type="number"
								name="taxRate"
								value={formData.taxRate}
								onChange={handleChange}
								className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
								min="0"
								max="100"
								step="0.01"
							/>
						</label>
						<label className="block text-gray-700 dark:text-gray-300">
							Discount (₹):
							<input
								type="number"
								name="discount"
								value={formData.discount}
								onChange={handleChange}
								className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
								min="0"
								step="0.01"
							/>
						</label>
					</div>
					<label className="block mt-4 text-gray-700 dark:text-gray-300">
						Product Description:
						<textarea
							name="description"
							value={formData.description}
							onChange={(e) =>
								setFormData({
									...formData,
									description: e.target.value,
								})
							}
							className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
							rows={3}
						/>
					</label>
				</div>

				{/* Additional Notes */}
				<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
					<h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
						Additional Information
					</h3>
					<label className="block text-gray-700 dark:text-gray-300">
						Notes:
						<textarea
							name="notes"
							value={formData.notes}
							onChange={(e) =>
								setFormData({
									...formData,
									notes: e.target.value,
								})
							}
							className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
							rows={3}
							placeholder="Any additional notes or terms..."
						/>
					</label>
				</div>

				{/* Submit Button */}
				<div className="flex justify-end space-x-4">
					<button
						type="button"
						className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-300">
						Save as Draft
					</button>
					<button
						type="submit"
						className="px-6 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition duration-300">
						Create Invoice
					</button>
				</div>
			</form>
		</div>
	);
};

export default Form;
