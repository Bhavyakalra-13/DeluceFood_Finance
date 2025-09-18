import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface InvoiceData {
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
}

interface InvoiceGeneratorProps {
	invoice: InvoiceData;
	onClose: () => void;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({
	invoice,
	onClose,
}) => {
	const invoiceRef = useRef<HTMLDivElement>(null);

	const calculateTotals = () => {
		const price = Number(invoice.price) || 0;
		const quantity = Number(invoice.quantity) || 0;
		const taxRate = Number(invoice.taxRate) || 0;
		const discount = Number(invoice.discount) || 0;

		const subtotal = price * quantity;
		const taxAmount = (subtotal * taxRate) / 100;
		const total = subtotal + taxAmount - discount;

		return {
			subtotal,
			taxAmount,
			discount,
			total,
		};
	};

	const totals = calculateTotals();

	const handlePrint = useReactToPrint({
		content: () => invoiceRef.current,
		documentTitle: `Invoice-${invoice.invoiceNumber}`,
	});

	const handleDownloadPDF = async () => {
		if (invoiceRef.current) {
			const canvas = await html2canvas(invoiceRef.current, {
				scale: 2,
				useCORS: true,
				allowTaint: true,
			});

			const imgData = canvas.toDataURL("image/png");
			const pdf = new jsPDF("p", "mm", "a4");
			const imgWidth = 210;
			const pageHeight = 295;
			const imgHeight = (canvas.height * imgWidth) / canvas.width;
			let heightLeft = imgHeight;

			let position = 0;

			pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
			heightLeft -= pageHeight;

			while (heightLeft >= 0) {
				position = heightLeft - imgHeight;
				pdf.addPage();
				pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
				heightLeft -= pageHeight;
			}

			pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
						Invoice Preview
					</h2>
					<div className="flex space-x-2">
						<button
							onClick={handlePrint}
							className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300">
							Print
						</button>
						<button
							onClick={handleDownloadPDF}
							className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300">
							Download PDF
						</button>
						<button
							onClick={onClose}
							className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-300">
							Close
						</button>
					</div>
				</div>

				{/* Invoice Content */}
				<div ref={invoiceRef} className="p-8 bg-white">
					{/* Company Header */}
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							DeluceFood Finance
						</h1>
						<p className="text-gray-600">
							Invoice Management System
						</p>
						<p className="text-gray-600">
							123 Business Street, City, State 12345
						</p>
						<p className="text-gray-600">
							Phone: +1 (555) 123-4567 | Email:
							info@delucefood.com
						</p>
					</div>

					{/* Invoice Details */}
					<div className="flex justify-between mb-8">
						<div>
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								Invoice Details
							</h3>
							<p className="text-gray-600">
								<strong>Invoice #:</strong>{" "}
								{invoice.invoiceNumber || "N/A"}
							</p>
							<p className="text-gray-600">
								<strong>Date:</strong>{" "}
								{invoice.invoiceDate
									? new Date(
											invoice.invoiceDate
									  ).toLocaleDateString()
									: "N/A"}
							</p>
							<p className="text-gray-600">
								<strong>Due Date:</strong>{" "}
								{invoice.dueDate
									? new Date(
											invoice.dueDate
									  ).toLocaleDateString()
									: "N/A"}
							</p>
							<p className="text-gray-600">
								<strong>Status:</strong>
								<span
									className={`ml-2 px-2 py-1 rounded text-sm ${
										invoice.paymentStatus === "Paid"
											? "bg-green-100 text-green-800"
											: invoice.paymentStatus ===
											  "Overdue"
											? "bg-red-100 text-red-800"
											: invoice.paymentStatus === "Sent"
											? "bg-yellow-100 text-yellow-800"
											: "bg-gray-100 text-gray-800"
									}`}>
									{invoice.paymentStatus || "Draft"}
								</span>
							</p>
						</div>
						<div>
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								Bill To
							</h3>
							<div className="text-gray-600">
								<p className="font-semibold">
									{invoice.buyerName || "N/A"}
								</p>
								<p>{invoice.buyerAddress || "N/A"}</p>
								<p>
									{invoice.buyerCity || "N/A"},{" "}
									{invoice.buyerState || "N/A"}{" "}
									{invoice.buyerPincode || "N/A"}
								</p>
								<p>Email: {invoice.buyerEmail || "N/A"}</p>
								<p>Phone: {invoice.buyerPhone || "N/A"}</p>
							</div>
						</div>
					</div>

					{/* Product Details Table */}
					<div className="mb-8">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Product Details
						</h3>
						<table className="w-full border-collapse border border-gray-300">
							<thead>
								<tr className="bg-gray-50">
									<th className="border border-gray-300 px-4 py-2 text-left">
										Product
									</th>
									<th className="border border-gray-300 px-4 py-2 text-left">
										Description
									</th>
									<th className="border border-gray-300 px-4 py-2 text-center">
										Quantity
									</th>
									<th className="border border-gray-300 px-4 py-2 text-right">
										Price
									</th>
									<th className="border border-gray-300 px-4 py-2 text-right">
										Total
									</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td className="border border-gray-300 px-4 py-2 font-semibold">
										{invoice.product || "N/A"}
									</td>
									<td className="border border-gray-300 px-4 py-2">
										{invoice.description || "N/A"}
									</td>
									<td className="border border-gray-300 px-4 py-2 text-center">
										{quantity}
									</td>
									<td className="border border-gray-300 px-4 py-2 text-right">
										₹{price.toFixed(2)}
									</td>
									<td className="border border-gray-300 px-4 py-2 text-right">
										₹{totals.subtotal.toFixed(2)}
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					{/* Totals */}
					<div className="flex justify-end mb-8">
						<div className="w-64">
							<div className="flex justify-between py-2 border-b border-gray-200">
								<span className="text-gray-600">Subtotal:</span>
								<span className="font-semibold">
									₹{totals.subtotal.toFixed(2)}
								</span>
							</div>
							{taxRate > 0 && (
								<div className="flex justify-between py-2 border-b border-gray-200">
									<span className="text-gray-600">
										Tax ({taxRate}%):
									</span>
									<span className="font-semibold">
										₹{totals.taxAmount.toFixed(2)}
									</span>
								</div>
							)}
							{discount > 0 && (
								<div className="flex justify-between py-2 border-b border-gray-200">
									<span className="text-gray-600">
										Discount:
									</span>
									<span className="font-semibold text-red-600">
										-₹{totals.discount.toFixed(2)}
									</span>
								</div>
							)}
							<div className="flex justify-between py-2 text-lg font-bold border-t-2 border-gray-400">
								<span>Total:</span>
								<span>₹{totals.total.toFixed(2)}</span>
							</div>
						</div>
					</div>

					{/* Notes */}
					{invoice.notes && (
						<div className="mb-8">
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								Notes
							</h3>
							<p className="text-gray-600">{invoice.notes}</p>
						</div>
					)}

					{/* Footer */}
					<div className="text-center text-gray-500 text-sm border-t border-gray-200 pt-4">
						<p>Thank you for your business!</p>
						<p>
							For any queries, please contact us at
							info@delucefood.com
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default InvoiceGenerator;
