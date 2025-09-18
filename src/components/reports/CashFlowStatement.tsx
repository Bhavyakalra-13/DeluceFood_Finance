import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import db from "@/utils/firestore";
import { FinancialData, DateRange } from "@/types/financial";

interface CashFlowStatementProps {
	dateRange: DateRange;
}

const CashFlowStatement: React.FC<CashFlowStatementProps> = ({ dateRange }) => {
	const [financialData, setFinancialData] = useState<FinancialData | null>(
		null
	);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		calculateCashFlow();
	}, [dateRange]);

	const calculateCashFlow = async () => {
		try {
			setLoading(true);

			// Fetch invoices for revenue calculation
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

			// Calculate net income from invoices
			const totalRevenue = invoices.reduce((sum, invoice) => {
				const price = Number(invoice.price) || 0;
				const quantity = Number(invoice.quantity) || 0;
				const taxRate = Number(invoice.taxRate) || 0;
				const discount = Number(invoice.discount) || 0;
				const subtotal = price * quantity;
				const taxAmount = (subtotal * taxRate) / 100;
				const total = subtotal + taxAmount - discount;
				return sum + total;
			}, 0);

			// Mock calculations for cash flow
			const netIncome = totalRevenue * 0.15; // Assuming 15% profit margin
			const depreciation = 20000;
			const changesInWorkingCapital = -5000; // Negative means cash outflow
			const netOperatingCashFlow =
				netIncome + depreciation + changesInWorkingCapital;

			const capitalExpenditures = -15000;
			const assetPurchases = -5000;
			const netInvestingCashFlow = capitalExpenditures + assetPurchases;

			const debtIssuance = 0;
			const debtRepayment = -10000;
			const ownerDrawings = -8000;
			const netFinancingCashFlow =
				debtIssuance + debtRepayment + ownerDrawings;

			const netCashFlow =
				netOperatingCashFlow +
				netInvestingCashFlow +
				netFinancingCashFlow;
			const beginningCash = 30000;
			const endingCash = beginningCash + netCashFlow;

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
						netIncome: netIncome,
						depreciation: depreciation,
						changesInWorkingCapital: changesInWorkingCapital,
						netOperatingCashFlow: netOperatingCashFlow,
					},
					investing: {
						capitalExpenditures: capitalExpenditures,
						assetPurchases: assetPurchases,
						netInvestingCashFlow: netInvestingCashFlow,
					},
					financing: {
						debtIssuance: debtIssuance,
						debtRepayment: debtRepayment,
						ownerDrawings: ownerDrawings,
						netFinancingCashFlow: netFinancingCashFlow,
					},
					netCashFlow: netCashFlow,
					beginningCash: beginningCash,
					endingCash: endingCash,
				},
				taxInfo: {
					gstCollected: 0,
					gstPaid: 0,
					netGST: 0,
					incomeTax: 0,
					totalTaxLiability: 0,
				},
			};

			setFinancialData(mockFinancialData);
		} catch (error) {
			console.error("Error calculating cash flow:", error);
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
				No financial data available
			</div>
		);
	}

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
					Cash Flow Statement
				</h2>
				<p className="text-gray-600 dark:text-gray-400">
					For the period{" "}
					{new Date(dateRange.startDate).toLocaleDateString()} to{" "}
					{new Date(dateRange.endDate).toLocaleDateString()}
				</p>
			</div>

			<div className="space-y-6">
				{/* Operating Activities */}
				<div>
					<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
						CASH FLOWS FROM OPERATING ACTIVITIES
					</h3>
					<div className="space-y-2">
						<div className="flex justify-between">
							<span className="text-gray-600 dark:text-gray-400">
								Net Income
							</span>
							<span className="font-medium">
								₹
								{financialData.cashFlow.operating.netIncome.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600 dark:text-gray-400">
								Add: Depreciation
							</span>
							<span className="font-medium text-green-600">
								₹
								{financialData.cashFlow.operating.depreciation.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600 dark:text-gray-400">
								Changes in Working Capital
							</span>
							<span
								className={`font-medium ${
									financialData.cashFlow.operating
										.changesInWorkingCapital >= 0
										? "text-green-600"
										: "text-red-600"
								}`}>
								₹
								{financialData.cashFlow.operating.changesInWorkingCapital.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between border-t pt-2">
							<span className="font-semibold text-gray-800 dark:text-gray-200">
								Net Cash from Operating Activities
							</span>
							<span
								className={`font-bold text-lg ${
									financialData.cashFlow.operating
										.netOperatingCashFlow >= 0
										? "text-green-600"
										: "text-red-600"
								}`}>
								₹
								{financialData.cashFlow.operating.netOperatingCashFlow.toLocaleString()}
							</span>
						</div>
					</div>
				</div>

				{/* Investing Activities */}
				<div>
					<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
						CASH FLOWS FROM INVESTING ACTIVITIES
					</h3>
					<div className="space-y-2">
						<div className="flex justify-between">
							<span className="text-gray-600 dark:text-gray-400">
								Capital Expenditures
							</span>
							<span className="font-medium text-red-600">
								₹
								{financialData.cashFlow.investing.capitalExpenditures.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600 dark:text-gray-400">
								Asset Purchases
							</span>
							<span className="font-medium text-red-600">
								₹
								{financialData.cashFlow.investing.assetPurchases.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between border-t pt-2">
							<span className="font-semibold text-gray-800 dark:text-gray-200">
								Net Cash from Investing Activities
							</span>
							<span
								className={`font-bold text-lg ${
									financialData.cashFlow.investing
										.netInvestingCashFlow >= 0
										? "text-green-600"
										: "text-red-600"
								}`}>
								₹
								{financialData.cashFlow.investing.netInvestingCashFlow.toLocaleString()}
							</span>
						</div>
					</div>
				</div>

				{/* Financing Activities */}
				<div>
					<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
						CASH FLOWS FROM FINANCING ACTIVITIES
					</h3>
					<div className="space-y-2">
						<div className="flex justify-between">
							<span className="text-gray-600 dark:text-gray-400">
								Debt Issuance
							</span>
							<span className="font-medium text-green-600">
								₹
								{financialData.cashFlow.financing.debtIssuance.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600 dark:text-gray-400">
								Debt Repayment
							</span>
							<span className="font-medium text-red-600">
								₹
								{financialData.cashFlow.financing.debtRepayment.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600 dark:text-gray-400">
								Owner Drawings
							</span>
							<span className="font-medium text-red-600">
								₹
								{financialData.cashFlow.financing.ownerDrawings.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between border-t pt-2">
							<span className="font-semibold text-gray-800 dark:text-gray-200">
								Net Cash from Financing Activities
							</span>
							<span
								className={`font-bold text-lg ${
									financialData.cashFlow.financing
										.netFinancingCashFlow >= 0
										? "text-green-600"
										: "text-red-600"
								}`}>
								₹
								{financialData.cashFlow.financing.netFinancingCashFlow.toLocaleString()}
							</span>
						</div>
					</div>
				</div>

				{/* Net Cash Flow Summary */}
				<div className="border-t-2 border-gray-400 pt-6">
					<div className="space-y-4">
						<div className="flex justify-between">
							<span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
								Net Increase (Decrease) in Cash
							</span>
							<span
								className={`text-lg font-bold ${
									financialData.cashFlow.netCashFlow >= 0
										? "text-green-600"
										: "text-red-600"
								}`}>
								₹
								{financialData.cashFlow.netCashFlow.toLocaleString()}
							</span>
						</div>

						<div className="flex justify-between">
							<span className="text-gray-600 dark:text-gray-400">
								Cash at Beginning of Period
							</span>
							<span className="font-medium">
								₹
								{financialData.cashFlow.beginningCash.toLocaleString()}
							</span>
						</div>

						<div className="flex justify-between border-t pt-2">
							<span className="text-xl font-bold text-gray-900 dark:text-white">
								Cash at End of Period
							</span>
							<span className="text-xl font-bold text-gray-900 dark:text-white">
								₹
								{financialData.cashFlow.endingCash.toLocaleString()}
							</span>
						</div>
					</div>
				</div>

				{/* Cash Flow Analysis */}
				<div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
					<h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
						Cash Flow Analysis
					</h4>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
						<div className="text-center">
							<div
								className={`text-2xl font-bold ${
									financialData.cashFlow.operating
										.netOperatingCashFlow >= 0
										? "text-green-600"
										: "text-red-600"
								}`}>
								{financialData.cashFlow.operating
									.netOperatingCashFlow >= 0
									? "✓"
									: "✗"}
							</div>
							<div className="text-gray-600 dark:text-gray-400">
								Operating Cash Flow
							</div>
							<div className="font-medium">
								{financialData.cashFlow.operating
									.netOperatingCashFlow >= 0
									? "Positive"
									: "Negative"}
							</div>
						</div>
						<div className="text-center">
							<div
								className={`text-2xl font-bold ${
									financialData.cashFlow.investing
										.netInvestingCashFlow >= 0
										? "text-green-600"
										: "text-yellow-600"
								}`}>
								{financialData.cashFlow.investing
									.netInvestingCashFlow >= 0
									? "✓"
									: "⚠"}
							</div>
							<div className="text-gray-600 dark:text-gray-400">
								Investing Cash Flow
							</div>
							<div className="font-medium">
								{financialData.cashFlow.investing
									.netInvestingCashFlow >= 0
									? "Positive"
									: "Investment"}
							</div>
						</div>
						<div className="text-center">
							<div
								className={`text-2xl font-bold ${
									financialData.cashFlow.financing
										.netFinancingCashFlow >= 0
										? "text-green-600"
										: "text-red-600"
								}`}>
								{financialData.cashFlow.financing
									.netFinancingCashFlow >= 0
									? "✓"
									: "✗"}
							</div>
							<div className="text-gray-600 dark:text-gray-400">
								Financing Cash Flow
							</div>
							<div className="font-medium">
								{financialData.cashFlow.financing
									.netFinancingCashFlow >= 0
									? "Positive"
									: "Negative"}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CashFlowStatement;
