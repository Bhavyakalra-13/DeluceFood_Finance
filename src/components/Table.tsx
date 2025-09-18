import db from "@/utils/firestore";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import InvoiceGenerator from "./InvoiceGenerator";

type Invoice = {
	id: string;
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
};

const Table = () => {
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(
		null
	);

	useEffect(() => {
		// Fetch data from Firestore
		const fetchData = async () => {
			try {
				const querySnapshot = await getDocs(collection(db, "invoices"));
				const data = querySnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				})) as Invoice[];
				setInvoices(data);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching Firestore data: ", error);
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const handleDelete = async (id: string) => {
		try {
			// Reference to the document to delete
			const docRef = doc(db, "invoices", id);
			await deleteDoc(docRef);
			console.log(`Document with ID ${id} deleted`);
			// Optionally, you can refetch the data to update the UI after deletion
		} catch (error) {
			console.error("Error deleting document: ", error);
		}
	};

	if (loading) {
		return <p>Loading...</p>;
	}

	return (
		<div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
			<div className="max-w-full overflow-x-auto">
				<table className="w-full table-auto">
					<thead>
						<tr className="bg-gray-2 text-left dark:bg-meta-4">
							<th className="min-w-[200px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
								Invoice #
							</th>
							<th className="min-w-[200px] px-4 py-4 font-medium text-black dark:text-white">
								Buyer Details
							</th>
							<th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
								Product
							</th>
							<th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
								Qty
							</th>
							<th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
								Price
							</th>
							<th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
								Total
							</th>
							<th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
								Status
							</th>
							<th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
								Date
							</th>
							<th className="px-4 py-4 font-medium text-black dark:text-white">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{invoices.map((invoice, key) => {
							// Safe defaults for all numeric values
							const price = Number(invoice.price) || 0;
							const quantity = Number(invoice.quantity) || 0;
							const taxRate = Number(invoice.taxRate) || 0;
							const discount = Number(invoice.discount) || 0;
							
							const subtotal = price * quantity;
							const taxAmount = (subtotal * taxRate) / 100;
							const total = subtotal + taxAmount - discount;

							return (
								<tr key={key}>
									<td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
										<h5 className="font-medium text-black dark:text-white">
											{invoice.invoiceNumber || 'N/A'}
										</h5>
									</td>
									<td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
										<div>
											<h5 className="font-medium text-black dark:text-white">
												{invoice.buyerName || 'N/A'}
											</h5>
											<p className="text-sm text-gray-600 dark:text-gray-400">
												{invoice.buyerEmail || 'N/A'}
											</p>
											<p className="text-sm text-gray-600 dark:text-gray-400">
												{invoice.buyerPhone || 'N/A'}
											</p>
										</div>
									</td>
									<td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
										<h5 className="font-medium text-black dark:text-white">
											{invoice.product || 'N/A'}
										</h5>
										{invoice.description && (
											<p className="text-sm text-gray-600 dark:text-gray-400">
												{invoice.description.substring(
													0,
													50
												)}
												...
											</p>
										)}
									</td>
									<td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
										<p className="text-black dark:text-white">
											{quantity}
										</p>
									</td>
									<td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
										<p className="text-black dark:text-white">
											₹{price.toFixed(2)}
										</p>
									</td>
									<td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
										<p className="font-medium text-black dark:text-white">
											₹{total.toFixed(2)}
										</p>
									</td>
									<td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
										<p
											className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
												invoice.paymentStatus === "Paid"
													? "bg-success text-success"
													: invoice.paymentStatus ===
													  "Overdue"
													? "bg-danger text-danger"
													: invoice.paymentStatus ===
													  "Sent"
													? "bg-warning text-warning"
													: "bg-gray-500 text-gray-500"
											}`}>
											{invoice.paymentStatus || 'Draft'}
										</p>
									</td>
									<td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
										<p className="text-black dark:text-white">
											{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}
										</p>
									</td>
									<td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
										<div className="flex items-center space-x-3.5">
											<button
												onClick={() =>
													invoice.id && handleDelete(invoice.id)
												}
												className="hover:text-primary"
												title="Delete Invoice"
												disabled={!invoice.id}>
												<svg
													className="fill-current"
													width="18"
													height="18"
													viewBox="0 0 18 18"
													fill="none"
													xmlns="http://www.w3.org/2000/svg">
													<path
														d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.0973C10.2379 1.74377 10.3504 1.85627 10.3504 1.9969V2.47502H7.70664V1.9969H7.67852ZM4.02227 3.96565C4.02227 3.85315 4.10664 3.74065 4.24727 3.74065H13.7535C13.866 3.74065 13.9785 3.82502 13.9785 3.96565V4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.24727C4.13477 5.0344 4.02227 4.95002 4.02227 4.8094V3.96565ZM11.7285 16.2563H6.27227C5.79414 16.2563 5.40039 15.8906 5.37227 15.3844L4.95039 6.2719H13.0785L12.6566 15.3844C12.6004 15.8625 12.2066 16.2563 11.7285 16.2563Z"
														fill=""
													/>
													<path
														d="M9.00039 9.11255C8.66289 9.11255 8.35352 9.3938 8.35352 9.75942V13.3313C8.35352 13.6688 8.63477 13.9782 9.00039 13.9782C9.33789 13.9782 9.64727 13.6969 9.64727 13.3313V9.75942C9.64727 9.3938 9.33789 9.11255 9.00039 9.11255Z"
														fill=""
													/>
													<path
														d="M11.2502 9.67504C10.8846 9.64692 10.6033 9.90004 10.5752 10.2657L10.4064 12.7407C10.3783 13.0782 10.6314 13.3875 10.9971 13.4157C11.0252 13.4157 11.0252 13.4157 11.0533 13.4157C11.3908 13.4157 11.6721 13.1625 11.6721 12.825L11.8408 10.35C11.8408 9.98442 11.5877 9.70317 11.2502 9.67504Z"
														fill=""
													/>
													<path
														d="M6.72245 9.67504C6.38495 9.70317 6.1037 10.0125 6.13182 10.35L6.3287 12.825C6.35683 13.1625 6.63808 13.4157 6.94745 13.4157C6.97558 13.4157 6.97558 13.4157 7.0037 13.4157C7.3412 13.3875 7.62245 13.0782 7.59433 12.7407L7.39745 10.2657C7.39745 9.90004 7.08808 9.64692 6.72245 9.67504Z"
														fill=""
													/>
												</svg>
											</button>
											<button
												onClick={() =>
													setSelectedInvoice(invoice)
												}
												className="hover:text-primary"
												title="View/Print Invoice"
												disabled={!invoice.id}>
												<svg
													className="fill-current"
													width="18"
													height="18"
													viewBox="0 0 18 18"
													fill="none"
													xmlns="http://www.w3.org/2000/svg">
													<path
														d="M16.8754 11.6719C16.5379 11.6719 16.2285 11.9531 16.2285 12.3187V14.8219C16.2285 15.075 16.0316 15.2719 15.7785 15.2719H2.22227C1.96914 15.2719 1.77227 15.075 1.77227 14.8219V12.3187C1.77227 11.9812 1.49102 11.6719 1.12539 11.6719C0.759766 11.6719 0.478516 11.9531 0.478516 12.3187V14.8219C0.478516 15.7781 1.23789 16.5375 2.19414 16.5375H15.7785C16.7348 16.5375 17.4941 15.7781 17.4941 14.8219V12.3187C17.5223 11.9531 17.2129 11.6719 16.8754 11.6719Z"
														fill=""
													/>
													<path
														d="M8.55074 12.3469C8.66324 12.4594 8.83199 12.5156 9.00074 12.5156C9.16949 12.5156 9.31012 12.4594 9.45074 12.3469L13.4726 8.43752C13.7257 8.1844 13.7257 7.79065 13.5007 7.53752C13.2476 7.2844 12.8539 7.2844 12.6007 7.5094L9.64762 10.4063V2.1094C9.64762 1.7719 9.36637 1.46252 9.00074 1.46252C8.66324 1.46252 8.35387 1.74377 8.35387 2.1094V10.4063L5.40074 7.53752C5.14762 7.2844 4.75387 7.31252 4.50074 7.53752C4.24762 7.79065 4.27574 8.1844 4.50074 8.43752L8.55074 12.3469Z"
														fill=""
													/>
												</svg>
											</button>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* Invoice Generator Modal */}
			{selectedInvoice && (
				<InvoiceGenerator
					invoice={selectedInvoice}
					onClose={() => setSelectedInvoice(null)}
				/>
			)}
		</div>
	);
};

export default Table;
