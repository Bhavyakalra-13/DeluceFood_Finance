import db from "@/utils/firestore";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import React, { useEffect, useState, useMemo } from "react";
import InvoiceGenerator from "./InvoiceGenerator";
import ConfirmDialog from "./ConfirmDialog";

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

type SortField = "invoiceNumber" | "buyerName" | "product" | "total" | "invoiceDate" | "paymentStatus";
type SortDir = "asc" | "desc";

const Table = () => {
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
	
	// Search & Filter
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	
	// Sorting
	const [sortField, setSortField] = useState<SortField>("invoiceDate");
	const [sortDir, setSortDir] = useState<SortDir>("desc");
	
	// Pagination
	const [currentPage, setCurrentPage] = useState(1);
	const [perPage, setPerPage] = useState(10);
	
	// Delete confirmation
	const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);

	useEffect(() => {
		fetchData();
	}, []);

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

	const handleDelete = async (id: string) => {
		try {
			const docRef = doc(db, "invoices", id);
			await deleteDoc(docRef);
			setInvoices((prev) => prev.filter((inv) => inv.id !== id));
			setDeleteTarget(null);
		} catch (error) {
			console.error("Error deleting document: ", error);
		}
	};

	const getTotal = (inv: Invoice) => {
		const price = Number(inv.price) || 0;
		const quantity = Number(inv.quantity) || 0;
		const taxRate = Number(inv.taxRate) || 0;
		const discount = Number(inv.discount) || 0;
		const subtotal = price * quantity;
		const taxAmount = (subtotal * taxRate) / 100;
		return subtotal + taxAmount - discount;
	};

	// Filter + Search + Sort
	const processedInvoices = useMemo(() => {
		let result = [...invoices];

		// Status filter
		if (statusFilter !== "all") {
			result = result.filter((inv) => inv.paymentStatus === statusFilter);
		}

		// Search
		if (searchQuery) {
			const q = searchQuery.toLowerCase();
			result = result.filter(
				(inv) =>
					inv.invoiceNumber?.toLowerCase().includes(q) ||
					inv.buyerName?.toLowerCase().includes(q) ||
					inv.product?.toLowerCase().includes(q) ||
					inv.buyerEmail?.toLowerCase().includes(q)
			);
		}

		// Sort
		result.sort((a, b) => {
			let aVal: string | number = "";
			let bVal: string | number = "";

			switch (sortField) {
				case "total":
					aVal = getTotal(a);
					bVal = getTotal(b);
					break;
				case "invoiceDate":
					aVal = a.invoiceDate || "";
					bVal = b.invoiceDate || "";
					break;
				default:
					aVal = (a[sortField] || "").toString().toLowerCase();
					bVal = (b[sortField] || "").toString().toLowerCase();
			}

			if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
			if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
			return 0;
		});

		return result;
	}, [invoices, searchQuery, statusFilter, sortField, sortDir]);

	// Pagination
	const totalPages = Math.ceil(processedInvoices.length / perPage);
	const paginatedInvoices = processedInvoices.slice(
		(currentPage - 1) * perPage,
		currentPage * perPage
	);

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDir((d) => (d === "asc" ? "desc" : "asc"));
		} else {
			setSortField(field);
			setSortDir("asc");
		}
	};

	const SortIcon = ({ field }: { field: SortField }) => (
		<span className="inline-flex ml-1">
			{sortField === field ? (
				sortDir === "asc" ? (
					<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
				) : (
					<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
				)
			) : (
				<svg className="w-3 h-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
			)}
		</span>
	);

	const statusBadge = (status: string) => {
		const styles: Record<string, string> = {
			Paid: "badge-success",
			Overdue: "badge-danger",
			Sent: "badge-warning",
		};
		return styles[status] || "badge-neutral";
	};

	if (loading) {
		return (
			<div className="glass-card p-6">
				<div className="flex items-center justify-between mb-6">
					<div className="skeleton w-48 h-10 rounded-xl" />
					<div className="skeleton w-32 h-10 rounded-xl" />
				</div>
				{[...Array(5)].map((_, i) => (
					<div key={i} className="flex gap-4 mb-4">
						<div className="skeleton flex-1 h-12 rounded-lg" />
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="glass-card overflow-hidden overflow-x-auto">
			{/* Toolbar */}
			<div className="p-5 border-b border-stroke dark:border-strokedark">
				<div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
					{/* Search */}
					<div className="relative flex-1 max-w-md">
						<div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
							<svg className="w-4 h-4 text-bodydark2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
						<input
							type="text"
							placeholder="Search invoices..."
							value={searchQuery}
							onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
							className="input-modern pl-10 py-2.5 text-sm"
						/>
					</div>

					{/* Filters */}
					<div className="flex gap-2 items-center">
						<select
							value={statusFilter}
							onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
							className="input-modern py-2.5 text-sm w-auto pr-8"
						>
							<option value="all">All Status</option>
							<option value="Paid">Paid</option>
							<option value="Sent">Pending</option>
							<option value="Overdue">Overdue</option>
							<option value="Draft">Draft</option>
						</select>
						
						<span className="text-sm text-body dark:text-bodydark whitespace-nowrap">
							{processedInvoices.length} invoice{processedInvoices.length !== 1 ? 's' : ''}
						</span>
					</div>
				</div>
			</div>

			{/* Table */}
			<div className="overflow-x-auto">
				{paginatedInvoices.length === 0 ? (
					/* Empty State */
					<div className="py-16 text-center">
						<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray dark:bg-meta-4 flex items-center justify-center">
							<svg className="w-8 h-8 text-bodydark2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-black dark:text-white mb-1">No invoices found</h3>
						<p className="text-sm text-body dark:text-bodydark">
							{searchQuery || statusFilter !== "all" ? "Try adjusting your search or filters" : "Create your first invoice to get started"}
						</p>
					</div>
				) : (
					<table className="table-modern">
						<thead>
							<tr>
								<th className="pl-6 cursor-pointer select-none hover:text-black dark:hover:text-white transition-colors" onClick={() => handleSort("invoiceNumber")}>
									Invoice # <SortIcon field="invoiceNumber" />
								</th>
								<th className="cursor-pointer select-none hover:text-black dark:hover:text-white transition-colors" onClick={() => handleSort("buyerName")}>
									Customer <SortIcon field="buyerName" />
								</th>
								<th className="cursor-pointer select-none hover:text-black dark:hover:text-white transition-colors" onClick={() => handleSort("product")}>
									Product <SortIcon field="product" />
								</th>
								<th className="text-right cursor-pointer select-none hover:text-black dark:hover:text-white transition-colors" onClick={() => handleSort("total")}>
									Amount <SortIcon field="total" />
								</th>
								<th className="cursor-pointer select-none hover:text-black dark:hover:text-white transition-colors" onClick={() => handleSort("paymentStatus")}>
									Status <SortIcon field="paymentStatus" />
								</th>
								<th className="cursor-pointer select-none hover:text-black dark:hover:text-white transition-colors" onClick={() => handleSort("invoiceDate")}>
									Date <SortIcon field="invoiceDate" />
								</th>
								<th className="text-right pr-6">Actions</th>
							</tr>
						</thead>
						<tbody>
							{paginatedInvoices.map((invoice) => {
								const total = getTotal(invoice);
								return (
									<tr key={invoice.id}>
										<td className="pl-6">
											<span className="font-semibold text-black dark:text-white">
												{invoice.invoiceNumber || "N/A"}
											</span>
										</td>
										<td>
											<div>
												<p className="font-medium text-black dark:text-white">{invoice.buyerName || "N/A"}</p>
												<p className="text-xs text-body dark:text-bodydark mt-0.5">{invoice.buyerEmail || ""}</p>
											</div>
										</td>
										<td>
											<p className="text-black dark:text-white">{invoice.product || "N/A"}</p>
										</td>
										<td className="text-right">
											<span className="font-semibold text-black dark:text-white tabular-nums">
												₹{total.toFixed(2)}
											</span>
										</td>
										<td>
											<span className={statusBadge(invoice.paymentStatus)}>
												{invoice.paymentStatus || "Draft"}
											</span>
										</td>
										<td>
											<span className="text-body dark:text-bodydark">
												{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : "N/A"}
											</span>
										</td>
										<td className="text-right pr-6">
											<div className="flex items-center justify-end gap-2">
												<button
													onClick={() => setSelectedInvoice(invoice)}
													className="w-8 h-8 rounded-lg flex items-center justify-center text-body hover:text-primary hover:bg-primary/10 dark:text-bodydark dark:hover:text-primary transition-all"
													title="View Invoice"
												>
													<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
													</svg>
												</button>
												<button
													onClick={() => setDeleteTarget(invoice)}
													className="w-8 h-8 rounded-lg flex items-center justify-center text-body hover:text-red-500 hover:bg-red-50 dark:text-bodydark dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-all"
													title="Delete Invoice"
												>
													<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
													</svg>
												</button>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				)}
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-t border-stroke dark:border-strokedark">
					<div className="flex items-center gap-2 text-sm text-body dark:text-bodydark">
						<span>Rows per page:</span>
						<select
							value={perPage}
							onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
							className="input-modern py-1 px-2 text-sm w-auto"
						>
							{[10, 25, 50].map((n) => (
								<option key={n} value={n}>{n}</option>
							))}
						</select>
						<span className="ml-2">
							{((currentPage - 1) * perPage) + 1}–{Math.min(currentPage * perPage, processedInvoices.length)} of {processedInvoices.length}
						</span>
					</div>
					<div className="flex gap-1">
						<button
							onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
							disabled={currentPage === 1}
							className="w-9 h-9 rounded-lg flex items-center justify-center text-body hover:bg-gray dark:text-bodydark dark:hover:bg-meta-4 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
						>
							<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
						</button>
						{Array.from({ length: totalPages }, (_, i) => i + 1)
							.filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
							.map((page, idx, arr) => (
								<React.Fragment key={page}>
									{idx > 0 && arr[idx - 1] !== page - 1 && (
										<span className="w-9 h-9 flex items-center justify-center text-body dark:text-bodydark text-sm">…</span>
									)}
									<button
										onClick={() => setCurrentPage(page)}
										className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
											currentPage === page
												? "bg-gradient-primary text-white shadow-sm"
												: "text-body dark:text-bodydark hover:bg-gray dark:hover:bg-meta-4"
										}`}
									>
										{page}
									</button>
								</React.Fragment>
							))}
						<button
							onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
							disabled={currentPage === totalPages}
							className="w-9 h-9 rounded-lg flex items-center justify-center text-body hover:bg-gray dark:text-bodydark dark:hover:bg-meta-4 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
						>
							<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
						</button>
					</div>
				</div>
			)}

			{/* Invoice Generator Modal */}
			{selectedInvoice && (
				<InvoiceGenerator
					invoice={selectedInvoice}
					onClose={() => setSelectedInvoice(null)}
				/>
			)}

			{/* Delete Confirmation */}
			<ConfirmDialog
				isOpen={!!deleteTarget}
				title="Delete Invoice"
				message={`Are you sure you want to delete invoice ${deleteTarget?.invoiceNumber || ''}? This action cannot be undone.`}
				confirmLabel="Delete"
				variant="danger"
				onConfirm={() => deleteTarget?.id && handleDelete(deleteTarget.id)}
				onCancel={() => setDeleteTarget(null)}
			/>
		</div>
	);
};

export default Table;
