import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import db from "@/utils/firestore";
import { FinancialData, DateRange } from "@/types/financial";

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

			// Calculate revenue
			const grossSales = invoices.reduce((sum, invoice) => {
				const price = Number(invoice.price) || 0;
				const quantity = Number(invoice.quantity) || 0;
				const taxRate = Number(invoice.taxRate) || 0;
				const discount = Number(invoice.discount) || 0;
				const subtotal = price * quantity;
				const taxAmount = (subtotal * taxRate) / 100;
				const total = subtotal + taxAmount - discount;
				return sum + total;
			}, 0);

			// Calculate cost of goods sold from products
			const productsQuery = query(collection(db, "products"));
			const productsSnapshot = await getDocs(productsQuery);
			const products = productsSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));

			const closingInventory = products.reduce((sum, product) => {
				const price = Number(product.price) || 0;
				const stock = Number(product.stock) || 0;
				return sum + price * stock;
			}, 0);

			const openingInventory = closingInventory * 0.8; // Mock data
			const purchases = closingInventory * 0.3; // Mock data
			const totalCOGS = openingInventory + purchases - closingInventory;

			// Calculate operating expenses (mock data for now)
			const operatingExpenses = {
				salaries: 20000,
				rent: 12000,
				utilities: 3000,
				marketing: 5000,
				depreciation: 20000,
				otherOperatingExpenses: 5000,
			};

			const totalOperatingExpenses = Object.values(
				operatingExpenses
			).reduce((sum, expense) => sum + expense, 0);

			// Calculate profits
			const grossProfit = grossSales - totalCOGS;
			const operatingIncome = grossProfit - totalOperatingExpenses;
			const otherIncome = 2000; // Mock data
			const interestExpense = 2000; // Mock data
			const taxes = Math.max(0, operatingIncome * 0.25); // 25% tax rate
			const netIncome =
				operatingIncome + otherIncome - interestExpense - taxes;

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
					grossSales: grossSales,
					salesReturns: 0,
					netSales: grossSales,
				},
				costOfGoodsSold: {
					openingInventory: openingInventory,
					purchases: purchases,
					closingInventory: closingInventory,
					totalCOGS: totalCOGS,
				},
				operatingExpenses: {
					salaries: operatingExpenses.salaries,
					rent: operatingExpenses.rent,
					utilities: operatingExpenses.utilities,
					marketing: operatingExpenses.marketing,
					depreciation: operatingExpenses.depreciation,
					otherOperatingExpenses:
						operatingExpenses.otherOperatingExpenses,
					totalOperatingExpenses: totalOperatingExpenses,
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
					gstCollected: grossSales * 0.18,
					gstPaid: 5000,
					netGST: 0,
					incomeTax: taxes,
					totalTaxLiability: 0,
				},
			};

			setFinancialData(mockFinancialData);
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
