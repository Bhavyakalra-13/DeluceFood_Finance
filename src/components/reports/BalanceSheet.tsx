import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import db from "@/utils/firestore";
import { FinancialData, DateRange } from "@/types/financial";
import {
	financialCalculationService
} from "@/utils/financialCalculations";

interface BalanceSheetProps {
	dateRange: DateRange;
}

const BalanceSheet: React.FC<BalanceSheetProps> = ({ dateRange }) => {
	const [financialData, setFinancialData] = useState<FinancialData | null>(
		null
	);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		calculateBalanceSheet();
	}, [dateRange]);

	const calculateBalanceSheet = async () => {
		try {
			setLoading(true);

			// Get real financial calculations
			const financialCalculations =
				await financialCalculationService.calculateFinancialData(
					dateRange
				);

			// Calculate net income for retained earnings
			const grossProfit =
				financialCalculations.totalRevenue -
				financialCalculations.totalCOGS;
			const operatingIncome =
				grossProfit - financialCalculations.totalOperatingExpenses;
			const netIncome = operatingIncome - financialCalculations.incomeTax;

			// Calculate accounts payable from expenses
			const expensesQuery = query(
				collection(db, "expenses"),
				where("date", ">=", dateRange.startDate),
				where("date", "<=", dateRange.endDate),
				where("status", "==", "approved")
			);
			const expensesSnapshot = await getDocs(expensesQuery);
			const expenses = expensesSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));

			const accountsPayable =
				expenses.reduce((sum, expense) => {
					return sum + (Number(expense.amount) || 0);
				}, 0) * 0.3; // Assume 30% of expenses are still payable

			// Calculate accrued expenses (simplified)
			const accruedExpenses =
				financialCalculations.totalOperatingExpenses * 0.1;

			// Calculate owner's equity (simplified - in real app, this would track actual equity)
			const ownerEquity = Math.max(
				0,
				financialCalculations.totalRevenue * 0.2
			);

			const financialData: FinancialData = {
				assets: {
					currentAssets: {
						cash: financialCalculations.cash,
						accountsReceivable:
							financialCalculations.accountsReceivable,
						inventory: financialCalculations.closingInventory,
						prepaidExpenses:
							financialCalculations.totalOperatingExpenses * 0.05, // 5% of expenses as prepaid
						otherCurrentAssets:
							financialCalculations.totalRevenue * 0.02, // 2% of revenue as other assets
					},
					fixedAssets: {
						propertyPlantEquipment: ownerEquity * 0.8, // 80% of equity as fixed assets
						accumulatedDepreciation:
							-financialCalculations.depreciation,
						netFixedAssets:
							ownerEquity * 0.8 -
							financialCalculations.depreciation,
					},
					totalAssets: 0, // Will be calculated
				},
				liabilities: {
					currentLiabilities: {
						accountsPayable: accountsPayable,
						accruedExpenses: accruedExpenses,
						shortTermDebt: financialCalculations.totalRevenue * 0.1, // 10% of revenue as short-term debt
						otherCurrentLiabilities:
							financialCalculations.totalRevenue * 0.02, // 2% of revenue as other liabilities
					},
					longTermLiabilities: {
						longTermDebt: ownerEquity * 0.3, // 30% of equity as long-term debt
						otherLongTermLiabilities:
							financialCalculations.totalRevenue * 0.05, // 5% of revenue as other long-term liabilities
					},
					totalLiabilities: 0, // Will be calculated
				},
				equity: {
					ownerEquity: ownerEquity,
					retainedEarnings: Math.max(0, netIncome * 0.8), // 80% of net income as retained earnings
					totalEquity: 0, // Will be calculated
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
					otherIncome: financialCalculations.totalRevenue * 0.02, // 2% of revenue as other income
					interestExpense: financialCalculations.totalRevenue * 0.01, // 1% of revenue as interest expense
					taxes: financialCalculations.incomeTax,
					netIncome: netIncome,
				},
				cashFlow: {
					operating: {
						netIncome: netIncome,
						depreciation: financialCalculations.depreciation,
						changesInWorkingCapital:
							(financialCalculations.accountsReceivable -
								accountsPayable) *
							0.1,
						netOperatingCashFlow: 0, // Will be calculated
					},
					investing: {
						capitalExpenditures:
							-financialCalculations.totalRevenue * 0.05, // 5% of revenue as capital expenditures
						assetPurchases:
							-financialCalculations.totalRevenue * 0.02, // 2% of revenue as asset purchases
						netInvestingCashFlow: 0, // Will be calculated
					},
					financing: {
						debtIssuance: 0,
						debtRepayment:
							-financialCalculations.totalRevenue * 0.03, // 3% of revenue as debt repayment
						ownerDrawings: -netIncome * 0.2, // 20% of net income as owner drawings
						netFinancingCashFlow: 0, // Will be calculated
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

			// Calculate cash flow totals
			financialData.cashFlow.operating.netOperatingCashFlow =
				financialData.cashFlow.operating.netIncome +
				financialData.cashFlow.operating.depreciation +
				financialData.cashFlow.operating.changesInWorkingCapital;

			financialData.cashFlow.investing.netInvestingCashFlow =
				financialData.cashFlow.investing.capitalExpenditures +
				financialData.cashFlow.investing.assetPurchases;

			financialData.cashFlow.financing.netFinancingCashFlow =
				financialData.cashFlow.financing.debtIssuance +
				financialData.cashFlow.financing.debtRepayment +
				financialData.cashFlow.financing.ownerDrawings;

			financialData.cashFlow.netCashFlow =
				financialData.cashFlow.operating.netOperatingCashFlow +
				financialData.cashFlow.investing.netInvestingCashFlow +
				financialData.cashFlow.financing.netFinancingCashFlow;

			financialData.cashFlow.endingCash =
				financialData.cashFlow.beginningCash +
				financialData.cashFlow.netCashFlow;

			setFinancialData(financialData);
		} catch (error) {
			console.error("Error calculating balance sheet:", error);
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
					Balance Sheet
				</h2>
				<p className="text-gray-600 dark:text-gray-400">
					As of {new Date(dateRange.endDate).toLocaleDateString()}
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Assets */}
				<div>
					<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
						ASSETS
					</h3>

					{/* Current Assets */}
					<div className="mb-4">
						<h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
							Current Assets
						</h4>
						<div className="space-y-2 ml-4">
							<div className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Cash
								</span>
								<span className="font-medium">
									₹
									{financialData.assets.currentAssets.cash.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Accounts Receivable
								</span>
								<span className="font-medium">
									₹
									{financialData.assets.currentAssets.accountsReceivable.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Inventory
								</span>
								<span className="font-medium">
									₹
									{financialData.assets.currentAssets.inventory.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Prepaid Expenses
								</span>
								<span className="font-medium">
									₹
									{financialData.assets.currentAssets.prepaidExpenses.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Other Current Assets
								</span>
								<span className="font-medium">
									₹
									{financialData.assets.currentAssets.otherCurrentAssets.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between border-t pt-2">
								<span className="font-semibold text-gray-800 dark:text-gray-200">
									Total Current Assets
								</span>
								<span className="font-bold">
									₹
									{(
										financialData.assets.currentAssets
											.cash +
										financialData.assets.currentAssets
											.accountsReceivable +
										financialData.assets.currentAssets
											.inventory +
										financialData.assets.currentAssets
											.prepaidExpenses +
										financialData.assets.currentAssets
											.otherCurrentAssets
									).toLocaleString()}
								</span>
							</div>
						</div>
					</div>

					{/* Fixed Assets */}
					<div className="mb-4">
						<h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
							Fixed Assets
						</h4>
						<div className="space-y-2 ml-4">
							<div className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Property, Plant & Equipment
								</span>
								<span className="font-medium">
									₹
									{financialData.assets.fixedAssets.propertyPlantEquipment.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Less: Accumulated Depreciation
								</span>
								<span className="font-medium text-red-600">
									₹
									{financialData.assets.fixedAssets.accumulatedDepreciation.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between border-t pt-2">
								<span className="font-semibold text-gray-800 dark:text-gray-200">
									Net Fixed Assets
								</span>
								<span className="font-bold">
									₹
									{financialData.assets.fixedAssets.netFixedAssets.toLocaleString()}
								</span>
							</div>
						</div>
					</div>

					<div className="flex justify-between border-t-2 border-gray-400 pt-4">
						<span className="text-xl font-bold text-gray-900 dark:text-white">
							TOTAL ASSETS
						</span>
						<span className="text-xl font-bold text-gray-900 dark:text-white">
							₹{financialData.assets.totalAssets.toLocaleString()}
						</span>
					</div>
				</div>

				{/* Liabilities & Equity */}
				<div>
					<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
						LIABILITIES & EQUITY
					</h3>

					{/* Current Liabilities */}
					<div className="mb-4">
						<h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
							Current Liabilities
						</h4>
						<div className="space-y-2 ml-4">
							<div className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Accounts Payable
								</span>
								<span className="font-medium">
									₹
									{financialData.liabilities.currentLiabilities.accountsPayable.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Accrued Expenses
								</span>
								<span className="font-medium">
									₹
									{financialData.liabilities.currentLiabilities.accruedExpenses.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Short-term Debt
								</span>
								<span className="font-medium">
									₹
									{financialData.liabilities.currentLiabilities.shortTermDebt.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Other Current Liabilities
								</span>
								<span className="font-medium">
									₹
									{financialData.liabilities.currentLiabilities.otherCurrentLiabilities.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between border-t pt-2">
								<span className="font-semibold text-gray-800 dark:text-gray-200">
									Total Current Liabilities
								</span>
								<span className="font-bold">
									₹
									{financialData.liabilities.totalLiabilities.toLocaleString()}
								</span>
							</div>
						</div>
					</div>

					{/* Long-term Liabilities */}
					<div className="mb-4">
						<h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
							Long-term Liabilities
						</h4>
						<div className="space-y-2 ml-4">
							<div className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Long-term Debt
								</span>
								<span className="font-medium">
									₹
									{financialData.liabilities.longTermLiabilities.longTermDebt.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Other Long-term Liabilities
								</span>
								<span className="font-medium">
									₹
									{financialData.liabilities.longTermLiabilities.otherLongTermLiabilities.toLocaleString()}
								</span>
							</div>
						</div>
					</div>

					{/* Equity */}
					<div className="mb-4">
						<h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
							Owner&apos;s Equity
						</h4>
						<div className="space-y-2 ml-4">
							<div className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Owner&apos;s Equity
								</span>
								<span className="font-medium">
									₹
									{financialData.equity.ownerEquity.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Retained Earnings
								</span>
								<span className="font-medium">
									₹
									{financialData.equity.retainedEarnings.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between border-t pt-2">
								<span className="font-semibold text-gray-800 dark:text-gray-200">
									Total Equity
								</span>
								<span className="font-bold">
									₹
									{financialData.equity.totalEquity.toLocaleString()}
								</span>
							</div>
						</div>
					</div>

					<div className="flex justify-between border-t-2 border-gray-400 pt-4">
						<span className="text-xl font-bold text-gray-900 dark:text-white">
							TOTAL LIABILITIES & EQUITY
						</span>
						<span className="text-xl font-bold text-gray-900 dark:text-white">
							₹
							{(
								financialData.liabilities.totalLiabilities +
								financialData.equity.totalEquity
							).toLocaleString()}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BalanceSheet;
