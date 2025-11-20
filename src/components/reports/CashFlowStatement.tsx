import React, { useState, useEffect } from "react";
import { FinancialData, DateRange } from "@/types/financial";
import {
	financialCalculationService,
} from "@/utils/financialCalculations";

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

			// Get real financial calculations
			const financialCalculations =
				await financialCalculationService.calculateFinancialData(
					dateRange
				);

			// Calculate net income
			const grossProfit =
				financialCalculations.totalRevenue -
				financialCalculations.totalCOGS;
			const operatingIncome =
				grossProfit - financialCalculations.totalOperatingExpenses;
			const netIncome = operatingIncome - financialCalculations.incomeTax;

			// Calculate changes in working capital
			const accountsReceivableChange =
				financialCalculations.accountsReceivable * 0.1; // 10% change
			const inventoryChange =
				(financialCalculations.closingInventory -
					financialCalculations.openingInventory) *
				0.1;
			const accountsPayableChange =
				financialCalculations.totalOperatingExpenses * 0.1;
			const changesInWorkingCapital =
				accountsReceivableChange +
				inventoryChange -
				accountsPayableChange;

			const netOperatingCashFlow =
				netIncome +
				financialCalculations.depreciation +
				changesInWorkingCapital;

			// Calculate investing activities
			const capitalExpenditures =
				-financialCalculations.totalRevenue * 0.05; // 5% of revenue
			const assetPurchases = -financialCalculations.totalRevenue * 0.02; // 2% of revenue
			const netInvestingCashFlow = capitalExpenditures + assetPurchases;

			// Calculate financing activities
			const debtIssuance = 0; // No new debt issuance
			const debtRepayment = -financialCalculations.totalRevenue * 0.03; // 3% of revenue
			const ownerDrawings = -netIncome * 0.2; // 20% of net income
			const netFinancingCashFlow =
				debtIssuance + debtRepayment + ownerDrawings;

			const netCashFlow =
				netOperatingCashFlow +
				netInvestingCashFlow +
				netFinancingCashFlow;
			const beginningCash = financialCalculations.beginningCash;
			const endingCash = beginningCash + netCashFlow;

			const financialData: FinancialData = {
				assets: {
					currentAssets: {
						cash: endingCash,
						accountsReceivable:
							financialCalculations.accountsReceivable,
						inventory: financialCalculations.closingInventory,
						prepaidExpenses:
							financialCalculations.totalOperatingExpenses * 0.05,
						otherCurrentAssets:
							financialCalculations.totalRevenue * 0.02,
					},
					fixedAssets: {
						propertyPlantEquipment:
							financialCalculations.totalRevenue * 0.3,
						accumulatedDepreciation:
							-financialCalculations.depreciation,
						netFixedAssets:
							financialCalculations.totalRevenue * 0.3 -
							financialCalculations.depreciation,
					},
					totalAssets: 0,
				},
				liabilities: {
					currentLiabilities: {
						accountsPayable:
							financialCalculations.totalOperatingExpenses * 0.3,
						accruedExpenses:
							financialCalculations.totalOperatingExpenses * 0.1,
						shortTermDebt: financialCalculations.totalRevenue * 0.1,
						otherCurrentLiabilities:
							financialCalculations.totalRevenue * 0.02,
					},
					longTermLiabilities: {
						longTermDebt: financialCalculations.totalRevenue * 0.2,
						otherLongTermLiabilities:
							financialCalculations.totalRevenue * 0.05,
					},
					totalLiabilities: 0,
				},
				equity: {
					ownerEquity: financialCalculations.totalRevenue * 0.2,
					retainedEarnings: Math.max(0, netIncome * 0.8),
					totalEquity: 0,
				},
				revenue: {
					grossSales: financialCalculations.totalRevenue,
					salesReturns: 0,
					netSales: financialCalculations.totalRevenue,
				},
				costOfGoodsSold: {
					openingInventory: financialCalculations.openingInventory,
					purchases: financialCalculations.purchases,
					closingInventory: financialCalculations.closingInventory,
					totalCOGS: financialCalculations.totalCOGS,
				},
				operatingExpenses: {
					salaries: financialCalculations.salaries,
					rent: financialCalculations.rent,
					utilities: financialCalculations.utilities,
					marketing: financialCalculations.marketing,
					depreciation: financialCalculations.depreciation,
					otherOperatingExpenses:
						financialCalculations.otherOperatingExpenses,
					totalOperatingExpenses:
						financialCalculations.totalOperatingExpenses,
				},
				netIncome: {
					grossProfit: grossProfit,
					operatingIncome: operatingIncome,
					otherIncome: financialCalculations.totalRevenue * 0.02,
					interestExpense: financialCalculations.totalRevenue * 0.01,
					taxes: financialCalculations.incomeTax,
					netIncome: netIncome,
				},
				cashFlow: {
					operating: {
						netIncome: netIncome,
						depreciation: financialCalculations.depreciation,
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
					gstCollected: financialCalculations.gstCollected,
					gstPaid: financialCalculations.gstPaid,
					netGST:
						financialCalculations.gstCollected -
						financialCalculations.gstPaid,
					incomeTax: financialCalculations.incomeTax,
					totalTaxLiability:
						financialCalculations.gstCollected -
						financialCalculations.gstPaid +
						financialCalculations.incomeTax,
				},
			};

			// Calculate totals
			financialData.assets.totalAssets =
				financialData.assets.currentAssets.cash +
				financialData.assets.currentAssets.accountsReceivable +
				financialData.assets.currentAssets.inventory +
				financialData.assets.currentAssets.prepaidExpenses +
				financialData.assets.currentAssets.otherCurrentAssets +
				financialData.assets.fixedAssets.netFixedAssets;

			financialData.liabilities.totalLiabilities =
				financialData.liabilities.currentLiabilities.accountsPayable +
				financialData.liabilities.currentLiabilities.accruedExpenses +
				financialData.liabilities.currentLiabilities.shortTermDebt +
				financialData.liabilities.currentLiabilities
					.otherCurrentLiabilities +
				financialData.liabilities.longTermLiabilities.longTermDebt +
				financialData.liabilities.longTermLiabilities
					.otherLongTermLiabilities;

			financialData.equity.totalEquity =
				financialData.equity.ownerEquity +
				financialData.equity.retainedEarnings;

			setFinancialData(financialData);
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
