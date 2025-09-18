import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import db from "@/utils/firestore";
import { FinancialData, DateRange } from "@/types/financial";

interface TaxReportsProps {
	dateRange: DateRange;
}

const TaxReports: React.FC<TaxReportsProps> = ({ dateRange }) => {
	const [financialData, setFinancialData] = useState<FinancialData | null>(
		null
	);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		calculateTaxReports();
	}, [dateRange]);

	const calculateTaxReports = async () => {
		try {
			setLoading(true);

			// Fetch invoices for GST calculation
			const invoicesQuery = query(
				collection(db, "invoices"),
				where("invoiceDate", ">=", dateRange.startDate),
				where("invoiceDate", "<=", dateRange.endDate)
			);
			const invoicesSnapshot = await getDocs(invoicesQuery);
			const invoices = invoicesSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));

			// Calculate GST collected from invoices
			const gstCollected = invoices.reduce((sum, invoice) => {
				const price = Number(invoice.price) || 0;
				const quantity = Number(invoice.quantity) || 0;
				const taxRate = Number(invoice.taxRate) || 0;
				const discount = Number(invoice.discount) || 0;
				const subtotal = price * quantity;
				const taxAmount = (subtotal * taxRate) / 100;
				return sum + taxAmount;
			}, 0);

			// Mock data for GST paid and other taxes
			const gstPaid = gstCollected * 0.6; // Assuming 60% of collected GST is paid
			const netGST = gstCollected - gstPaid;

			const incomeTax = gstCollected * 0.25; // Mock calculation
			const totalTaxLiability = netGST + incomeTax;

			const mockFinancialData: FinancialData = {
				assets: {
					currentAssets: {
						cash: 0,
						accountsReceivable: 0,
						inventory: 0,
						prepaidExpenses: 0,
						otherCurrentAssets: 0,
					},
					fixedAssets: {
						propertyPlantEquipment: 0,
						accumulatedDepreciation: 0,
						netFixedAssets: 0,
					},
					totalAssets: 0,
				},
				liabilities: {
					currentLiabilities: {
						accountsPayable: 0,
						accruedExpenses: 0,
						shortTermDebt: 0,
						otherCurrentLiabilities: 0,
					},
					longTermLiabilities: {
						longTermDebt: 0,
						otherLongTermLiabilities: 0,
					},
					totalLiabilities: 0,
				},
				equity: {
					ownerEquity: 0,
					retainedEarnings: 0,
					totalEquity: 0,
				},
				revenue: {
					grossSales: 0,
					salesReturns: 0,
					netSales: 0,
				},
				costOfGoodsSold: {
					openingInventory: 0,
					purchases: 0,
					closingInventory: 0,
					totalCOGS: 0,
				},
				operatingExpenses: {
					salaries: 0,
					rent: 0,
					utilities: 0,
					marketing: 0,
					depreciation: 0,
					otherOperatingExpenses: 0,
					totalOperatingExpenses: 0,
				},
				netIncome: {
					grossProfit: 0,
					operatingIncome: 0,
					otherIncome: 0,
					interestExpense: 0,
					taxes: 0,
					netIncome: 0,
				},
				cashFlow: {
					operating: {
						netIncome: 0,
						depreciation: 0,
						changesInWorkingCapital: 0,
						netOperatingCashFlow: 0,
					},
					investing: {
						capitalExpenditures: 0,
						assetPurchases: 0,
						netInvestingCashFlow: 0,
					},
					financing: {
						debtIssuance: 0,
						debtRepayment: 0,
						ownerDrawings: 0,
						netFinancingCashFlow: 0,
					},
					netCashFlow: 0,
					beginningCash: 0,
					endingCash: 0,
				},
				taxInfo: {
					gstCollected: gstCollected,
					gstPaid: gstPaid,
					netGST: netGST,
					incomeTax: incomeTax,
					totalTaxLiability: totalTaxLiability,
				},
			};

			setFinancialData(mockFinancialData);
		} catch (error) {
			console.error("Error calculating tax reports:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	if (!financialData) {
		return (
			<div className="text-center text-gray-500">
				No tax data available
			</div>
		);
	}

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
					Tax Reports
				</h2>
				<p className="text-gray-600 dark:text-gray-400">
					For the period{" "}
					{new Date(dateRange.startDate).toLocaleDateString()} to{" "}
					{new Date(dateRange.endDate).toLocaleDateString()}
				</p>
			</div>

			<div className="space-y-8">
				{/* GST Summary */}
				<div>
					<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
						GST Summary
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
							<div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
								GST Collected
							</div>
							<div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
								₹
								{financialData.taxInfo.gstCollected.toLocaleString()}
							</div>
						</div>
						<div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
							<div className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
								GST Paid
							</div>
							<div className="text-2xl font-bold text-green-900 dark:text-green-100">
								₹
								{financialData.taxInfo.gstPaid.toLocaleString()}
							</div>
						</div>
						<div
							className={`p-4 rounded-lg ${
								financialData.taxInfo.netGST >= 0
									? "bg-red-50 dark:bg-red-900/20"
									: "bg-green-50 dark:bg-green-900/20"
							}`}>
							<div
								className={`text-sm font-medium mb-1 ${
									financialData.taxInfo.netGST >= 0
										? "text-red-600 dark:text-red-400"
										: "text-green-600 dark:text-green-400"
								}`}>
								Net GST{" "}
								{financialData.taxInfo.netGST >= 0
									? "Payable"
									: "Refundable"}
							</div>
							<div
								className={`text-2xl font-bold ${
									financialData.taxInfo.netGST >= 0
										? "text-red-900 dark:text-red-100"
										: "text-green-900 dark:text-green-100"
								}`}>
								₹
								{Math.abs(
									financialData.taxInfo.netGST
								).toLocaleString()}
							</div>
						</div>
					</div>
				</div>

				{/* Detailed GST Breakdown */}
				<div>
					<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
						GST Breakdown by Rate
					</h3>
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
							<thead className="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										GST Rate
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										Taxable Amount
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										GST Amount
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										Total Amount
									</th>
								</tr>
							</thead>
							<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
								<tr>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
										18%
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
										₹
										{(
											financialData.taxInfo.gstCollected /
											0.18
										).toLocaleString()}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
										₹
										{financialData.taxInfo.gstCollected.toLocaleString()}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
										₹
										{(
											financialData.taxInfo.gstCollected /
												0.18 +
											financialData.taxInfo.gstCollected
										).toLocaleString()}
									</td>
								</tr>
								<tr>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
										12%
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
										₹0
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
										₹0
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
										₹0
									</td>
								</tr>
								<tr>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
										5%
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
										₹0
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
										₹0
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
										₹0
									</td>
								</tr>
								<tr className="bg-gray-50 dark:bg-gray-700">
									<td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
										Total
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
										₹
										{(
											financialData.taxInfo.gstCollected /
											0.18
										).toLocaleString()}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
										₹
										{financialData.taxInfo.gstCollected.toLocaleString()}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
										₹
										{(
											financialData.taxInfo.gstCollected /
												0.18 +
											financialData.taxInfo.gstCollected
										).toLocaleString()}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				{/* Income Tax Summary */}
				<div>
					<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
						Income Tax Summary
					</h3>
					<div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
						<div className="flex justify-between items-center">
							<div>
								<div className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">
									Estimated Income Tax
								</div>
								<div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
									₹
									{financialData.taxInfo.incomeTax.toLocaleString()}
								</div>
								<div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
									Based on 25% tax rate
								</div>
							</div>
							<div className="text-right">
								<div className="text-sm text-yellow-600 dark:text-yellow-400">
									Due Date
								</div>
								<div className="font-medium text-yellow-900 dark:text-yellow-100">
									March 31, 2024
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Total Tax Liability */}
				<div>
					<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
						Total Tax Liability
					</h3>
					<div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
						<div className="flex justify-between items-center">
							<div>
								<div className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
									Total Tax Payable
								</div>
								<div className="text-3xl font-bold text-red-900 dark:text-red-100">
									₹
									{financialData.taxInfo.totalTaxLiability.toLocaleString()}
								</div>
								<div className="text-sm text-red-700 dark:text-red-300 mt-1">
									GST + Income Tax
								</div>
							</div>
							<div className="text-right">
								<div className="text-sm text-red-600 dark:text-red-400">
									Status
								</div>
								<div className="font-medium text-red-900 dark:text-red-100">
									Outstanding
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Tax Compliance Checklist */}
				<div>
					<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
						Tax Compliance Checklist
					</h3>
					<div className="space-y-3">
						<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
							<div className="flex items-center">
								<div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
									<svg
										className="w-3 h-3 text-white"
										fill="currentColor"
										viewBox="0 0 20 20">
										<path
											fillRule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<span className="text-gray-900 dark:text-white">
									GST Returns Filed
								</span>
							</div>
							<span className="text-green-600 dark:text-green-400 font-medium">
								Completed
							</span>
						</div>

						<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
							<div className="flex items-center">
								<div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
									<svg
										className="w-3 h-3 text-white"
										fill="currentColor"
										viewBox="0 0 20 20">
										<path
											fillRule="evenodd"
											d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<span className="text-gray-900 dark:text-white">
									Income Tax Returns
								</span>
							</div>
							<span className="text-yellow-600 dark:text-yellow-400 font-medium">
								Pending
							</span>
						</div>

						<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
							<div className="flex items-center">
								<div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
									<svg
										className="w-3 h-3 text-white"
										fill="currentColor"
										viewBox="0 0 20 20">
										<path
											fillRule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<span className="text-gray-900 dark:text-white">
									TDS Returns
								</span>
							</div>
							<span className="text-green-600 dark:text-green-400 font-medium">
								Completed
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TaxReports;
