import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import db from "@/utils/firestore";
import { FinancialData, DateRange } from "@/types/financial";

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

			// Calculate basic financial data from invoices
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

			// Calculate accounts receivable (unpaid invoices)
			const accountsReceivable = invoices
				.filter((invoice) => invoice.paymentStatus !== "Paid")
				.reduce((sum, invoice) => {
					const price = Number(invoice.price) || 0;
					const quantity = Number(invoice.quantity) || 0;
					const taxRate = Number(invoice.taxRate) || 0;
					const discount = Number(invoice.discount) || 0;
					const subtotal = price * quantity;
					const taxAmount = (subtotal * taxRate) / 100;
					const total = subtotal + taxAmount - discount;
					return sum + total;
				}, 0);

			// Calculate inventory value from products
			const productsQuery = query(collection(db, "products"));
			const productsSnapshot = await getDocs(productsQuery);
			const products = productsSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));

			const inventoryValue = products.reduce((sum, product) => {
				const price = Number(product.price) || 0;
				const stock = Number(product.stock) || 0;
				return sum + price * stock;
			}, 0);

			// Mock data for demonstration - in real app, you'd have more data sources
			const mockFinancialData: FinancialData = {
				assets: {
					currentAssets: {
						cash: 50000, // This would come from bank transactions
						accountsReceivable: accountsReceivable,
						inventory: inventoryValue,
						prepaidExpenses: 5000,
						otherCurrentAssets: 2000,
					},
					fixedAssets: {
						propertyPlantEquipment: 100000,
						accumulatedDepreciation: -20000,
						netFixedAssets: 80000,
					},
					totalAssets: 0, // Will be calculated
				},
				liabilities: {
					currentLiabilities: {
						accountsPayable: 15000,
						accruedExpenses: 8000,
						shortTermDebt: 10000,
						otherCurrentLiabilities: 2000,
					},
					longTermLiabilities: {
						longTermDebt: 50000,
						otherLongTermLiabilities: 5000,
					},
					totalLiabilities: 0, // Will be calculated
				},
				equity: {
					ownerEquity: 100000,
					retainedEarnings: totalRevenue * 0.1, // Assuming 10% profit margin
					totalEquity: 0, // Will be calculated
				},
				revenue: {
					grossSales: totalRevenue,
					salesReturns: 0,
					netSales: totalRevenue,
				},
				costOfGoodsSold: {
					openingInventory: inventoryValue * 0.8,
					purchases: inventoryValue * 0.3,
					closingInventory: inventoryValue,
					totalCOGS: 0, // Will be calculated
				},
				operatingExpenses: {
					salaries: 20000,
					rent: 12000,
					utilities: 3000,
					marketing: 5000,
					depreciation: 20000,
					otherOperatingExpenses: 5000,
					totalOperatingExpenses: 0, // Will be calculated
				},
				netIncome: {
					grossProfit: 0,
					operatingIncome: 0,
					otherIncome: 0,
					interestExpense: 2000,
					taxes: 5000,
					netIncome: 0,
				},
				cashFlow: {
					operating: {
						netIncome: 0,
						depreciation: 20000,
						changesInWorkingCapital: 0,
						netOperatingCashFlow: 0,
					},
					investing: {
						capitalExpenditures: -10000,
						assetPurchases: -5000,
						netInvestingCashFlow: 0,
					},
					financing: {
						debtIssuance: 0,
						debtRepayment: -5000,
						ownerDrawings: -10000,
						netFinancingCashFlow: 0,
					},
					netCashFlow: 0,
					beginningCash: 30000,
					endingCash: 0,
				},
				taxInfo: {
					gstCollected: totalRevenue * 0.18, // Assuming 18% GST
					gstPaid: 5000,
					netGST: 0,
					incomeTax: 5000,
					totalTaxLiability: 0,
				},
			};

			// Calculate totals
			mockFinancialData.assets.totalAssets =
				mockFinancialData.assets.currentAssets.cash +
				mockFinancialData.assets.currentAssets.accountsReceivable +
				mockFinancialData.assets.currentAssets.inventory +
				mockFinancialData.assets.currentAssets.prepaidExpenses +
				mockFinancialData.assets.currentAssets.otherCurrentAssets +
				mockFinancialData.assets.fixedAssets.netFixedAssets;

			mockFinancialData.liabilities.totalLiabilities =
				mockFinancialData.liabilities.currentLiabilities
					.accountsPayable +
				mockFinancialData.liabilities.currentLiabilities
					.accruedExpenses +
				mockFinancialData.liabilities.currentLiabilities.shortTermDebt +
				mockFinancialData.liabilities.currentLiabilities
					.otherCurrentLiabilities +
				mockFinancialData.liabilities.longTermLiabilities.longTermDebt +
				mockFinancialData.liabilities.longTermLiabilities
					.otherLongTermLiabilities;

			mockFinancialData.equity.totalEquity =
				mockFinancialData.equity.ownerEquity +
				mockFinancialData.equity.retainedEarnings;

			setFinancialData(mockFinancialData);
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
							Owner's Equity
						</h4>
						<div className="space-y-2 ml-4">
							<div className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Owner's Equity
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
