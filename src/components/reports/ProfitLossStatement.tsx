import React, { useState, useEffect } from "react";
import { FinancialData, DateRange } from "@/types/financial";
import {
	financialCalculationService,
} from "@/utils/financialCalculations";

interface ProfitLossStatementProps {
	dateRange: DateRange;
}

const ProfitLossStatement: React.FC<ProfitLossStatementProps> = ({
	dateRange,
}) => {
	const [financialData, setFinancialData] = useState<FinancialData | null>(
		null
	);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		calculateProfitLoss();
	}, [dateRange]);

	const calculateProfitLoss = async () => {
		try {
			setLoading(true);

			// Get real financial calculations
			const financialCalculations =
				await financialCalculationService.calculateFinancialData(
					dateRange
				);

			// Calculate profits
			const grossProfit =
				financialCalculations.totalRevenue -
				financialCalculations.totalCOGS;
			const operatingIncome =
				grossProfit - financialCalculations.totalOperatingExpenses;
			const otherIncome = financialCalculations.totalRevenue * 0.02; // 2% of revenue as other income
			const interestExpense = financialCalculations.totalRevenue * 0.01; // 1% of revenue as interest expense
			const taxes = financialCalculations.incomeTax;
			const netIncome =
				operatingIncome + otherIncome - interestExpense - taxes;

			const financialData: FinancialData = {
				assets: {
					currentAssets: {
						cash: financialCalculations.cash,
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
					otherIncome: otherIncome,
					interestExpense: interestExpense,
					taxes: taxes,
					netIncome: netIncome,
				},
				cashFlow: {
					operating: {
						netIncome: netIncome,
						depreciation: financialCalculations.depreciation,
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
					beginningCash: financialCalculations.beginningCash,
					endingCash: financialCalculations.endingCash,
				},
				taxInfo: {
					gstCollected: financialCalculations.gstCollected,
					gstPaid: financialCalculations.gstPaid,
					netGST:
						financialCalculations.gstCollected -
						financialCalculations.gstPaid,
					incomeTax: taxes,
					totalTaxLiability:
						financialCalculations.gstCollected -
						financialCalculations.gstPaid +
						taxes,
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
			console.error("Error calculating profit & loss:", error);
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
					Profit & Loss Statement
				</h2>
				<p className="text-gray-600 dark:text-gray-400">
					For the period{" "}
					{new Date(dateRange.startDate).toLocaleDateString()} to{" "}
					{new Date(dateRange.endDate).toLocaleDateString()}
				</p>
			</div>

			<div className="space-y-6">
				{/* Revenue Section */}
				<div>
					<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
						REVENUE
					</h3>
					<div className="space-y-2">
						<div className="flex justify-between">
							<span className="text-gray-600 dark:text-gray-400">
								Gross Sales
							</span>
							<span className="font-medium">
								₹
								{financialData.revenue.grossSales.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600 dark:text-gray-400">
								Less: Sales Returns
							</span>
							<span className="font-medium text-red-600">
								-₹
								{financialData.revenue.salesReturns.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between border-t pt-2">
							<span className="font-semibold text-gray-800 dark:text-gray-200">
								Net Sales
							</span>
							<span className="font-bold text-lg">
								₹
								{financialData.revenue.netSales.toLocaleString()}
							</span>
						</div>
					</div>
				</div>

				{/* Cost of Goods Sold Section */}
				<div>
					<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
						COST OF GOODS SOLD
					</h3>
					<div className="space-y-2">
						<div className="flex justify-between">
							<span className="text-gray-600 dark:text-gray-400">
								Opening Inventory
							</span>
							<span className="font-medium">
								₹
								{financialData.costOfGoodsSold.openingInventory.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600 dark:text-gray-400">
								Add: Purchases
							</span>
							<span className="font-medium">
								₹
								{financialData.costOfGoodsSold.purchases.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600 dark:text-gray-400">
								Less: Closing Inventory
							</span>
							<span className="font-medium text-red-600">
								-₹
								{financialData.costOfGoodsSold.closingInventory.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between border-t pt-2">
							<span className="font-semibold text-gray-800 dark:text-gray-200">
								Total Cost of Goods Sold
							</span>
							<span className="font-bold">
								₹
								{financialData.costOfGoodsSold.totalCOGS.toLocaleString()}
							</span>
						</div>
					</div>
				</div>

				{/* Gross Profit */}
				<div className="flex justify-between border-t-2 border-gray-400 pt-4">
					<span className="text-xl font-bold text-gray-900 dark:text-white">
						GROSS PROFIT
					</span>
					<span className="text-xl font-bold text-green-600">
						₹{financialData.netIncome.grossProfit.toLocaleString()}
					</span>
				</div>

				{/* Operating Expenses Section */}
				<div>
					<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
						OPERATING EXPENSES
					</h3>
					<div className="space-y-2">
						<div className="flex justify-between">
							<span className="text-gray-600 dark:text-gray-400">
								Salaries & Wages
							</span>
							<span className="font-medium">
								₹
								{financialData.operatingExpenses.salaries.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600 dark:text-gray-400">
								Rent
							</span>
							<span className="font-medium">
								₹
								{financialData.operatingExpenses.rent.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600 dark:text-gray-400">
								Utilities
							</span>
							<span className="font-medium">
								₹
								{financialData.operatingExpenses.utilities.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600 dark:text-gray-400">
								Marketing & Advertising
							</span>
							<span className="font-medium">
								₹
								{financialData.operatingExpenses.marketing.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600 dark:text-gray-400">
								Depreciation
							</span>
							<span className="font-medium">
								₹
								{financialData.operatingExpenses.depreciation.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600 dark:text-gray-400">
								Other Operating Expenses
							</span>
							<span className="font-medium">
								₹
								{financialData.operatingExpenses.otherOperatingExpenses.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between border-t pt-2">
							<span className="font-semibold text-gray-800 dark:text-gray-200">
								Total Operating Expenses
							</span>
							<span className="font-bold">
								₹
								{financialData.operatingExpenses.totalOperatingExpenses.toLocaleString()}
							</span>
						</div>
					</div>
				</div>

				{/* Operating Income */}
				<div className="flex justify-between border-t-2 border-gray-400 pt-4">
					<span className="text-xl font-bold text-gray-900 dark:text-white">
						OPERATING INCOME
					</span>
					<span
						className={`text-xl font-bold ${
							financialData.netIncome.operatingIncome >= 0
								? "text-green-600"
								: "text-red-600"
						}`}>
						₹
						{financialData.netIncome.operatingIncome.toLocaleString()}
					</span>
				</div>

				{/* Other Income and Expenses */}
				<div>
					<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
						OTHER INCOME & EXPENSES
					</h3>
					<div className="space-y-2">
						<div className="flex justify-between">
							<span className="text-gray-600 dark:text-gray-400">
								Other Income
							</span>
							<span className="font-medium text-green-600">
								₹
								{financialData.netIncome.otherIncome.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600 dark:text-gray-400">
								Interest Expense
							</span>
							<span className="font-medium text-red-600">
								-₹
								{financialData.netIncome.interestExpense.toLocaleString()}
							</span>
						</div>
					</div>
				</div>

				{/* Income Before Taxes */}
				<div className="flex justify-between border-t pt-4">
					<span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
						Income Before Taxes
					</span>
					<span
						className={`text-lg font-semibold ${
							financialData.netIncome.operatingIncome +
								financialData.netIncome.otherIncome -
								financialData.netIncome.interestExpense >=
							0
								? "text-green-600"
								: "text-red-600"
						}`}>
						₹
						{(
							financialData.netIncome.operatingIncome +
							financialData.netIncome.otherIncome -
							financialData.netIncome.interestExpense
						).toLocaleString()}
					</span>
				</div>

				{/* Income Tax */}
				<div className="flex justify-between">
					<span className="text-gray-600 dark:text-gray-400">
						Income Tax
					</span>
					<span className="font-medium text-red-600">
						-₹{financialData.netIncome.taxes.toLocaleString()}
					</span>
				</div>

				{/* Net Income */}
				<div className="flex justify-between border-t-2 border-gray-400 pt-4">
					<span className="text-2xl font-bold text-gray-900 dark:text-white">
						NET INCOME
					</span>
					<span
						className={`text-2xl font-bold ${
							financialData.netIncome.netIncome >= 0
								? "text-green-600"
								: "text-red-600"
						}`}>
						₹{financialData.netIncome.netIncome.toLocaleString()}
					</span>
				</div>
			</div>
		</div>
	);
};

export default ProfitLossStatement;
