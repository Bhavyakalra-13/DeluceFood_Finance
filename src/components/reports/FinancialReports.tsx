import React, { useState } from "react";
import BalanceSheet from "./BalanceSheet";
import ProfitLossStatement from "./ProfitLossStatement";
import CashFlowStatement from "./CashFlowStatement";
import TaxReports from "./TaxReports";
import { DateRange } from "@/types/financial";

const FinancialReports: React.FC = () => {
	const [activeReport, setActiveReport] = useState("balance-sheet");
	const [dateRange, setDateRange] = useState<DateRange>({
		startDate: new Date(new Date().getFullYear(), 0, 1)
			.toISOString()
			.split("T")[0], // Start of current year
		endDate: new Date().toISOString().split("T")[0], // Today
	});

	const reports = [
		{ id: "balance-sheet", name: "Balance Sheet", icon: "📊" },
		{ id: "profit-loss", name: "Profit & Loss", icon: "📈" },
		{ id: "cash-flow", name: "Cash Flow", icon: "💰" },
		{ id: "tax-reports", name: "Tax Reports", icon: "🧾" },
	];

	const handleDateRangeChange = (
		field: "startDate" | "endDate",
		value: string
	) => {
		setDateRange((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const renderReport = () => {
		switch (activeReport) {
			case "balance-sheet":
				return <BalanceSheet dateRange={dateRange} />;
			case "profit-loss":
				return <ProfitLossStatement dateRange={dateRange} />;
			case "cash-flow":
				return <CashFlowStatement dateRange={dateRange} />;
			case "tax-reports":
				return <TaxReports dateRange={dateRange} />;
			default:
				return <BalanceSheet dateRange={dateRange} />;
		}
	};

	return (
		<div className="p-6">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
					Financial Reports
				</h1>
				<p className="text-gray-600 dark:text-gray-400">
					Comprehensive financial analysis and reporting
				</p>
			</div>

			{/* Date Range Filter */}
			<div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
					Report Period
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Start Date
						</label>
						<input
							type="date"
							value={dateRange.startDate}
							onChange={(e) =>
								handleDateRangeChange(
									"startDate",
									e.target.value
								)
							}
							className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							End Date
						</label>
						<input
							type="date"
							value={dateRange.endDate}
							onChange={(e) =>
								handleDateRangeChange("endDate", e.target.value)
							}
							className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
				</div>
			</div>

			{/* Report Navigation */}
			<div className="mb-6">
				<div className="border-b border-gray-200 dark:border-gray-700">
					<nav className="-mb-px flex space-x-8 overflow-x-auto">
						{reports.map((report) => (
							<button
								key={report.id}
								onClick={() => setActiveReport(report.id)}
								className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
									activeReport === report.id
										? "border-blue-500 text-blue-600 dark:text-blue-400"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
								}`}>
								<span className="mr-2">{report.icon}</span>
								{report.name}
							</button>
						))}
					</nav>
				</div>
			</div>

			{/* Report Content */}
			<div className="mb-6">{renderReport()}</div>

			{/* Quick Actions */}
			<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
					Quick Actions
				</h3>
				<div className="flex flex-wrap gap-3">
					<button
						onClick={() => {
							// Export current report as PDF
							window.print();
						}}
						className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 flex items-center">
						<svg
							className="w-4 h-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						Export PDF
					</button>

					<button
						onClick={() => {
							// Export as Excel
							console.log(
								"Export Excel functionality would be implemented here"
							);
						}}
						className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300 flex items-center">
						<svg
							className="w-4 h-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						Export Excel
					</button>

					<button
						onClick={() => {
							// Email report
							console.log(
								"Email report functionality would be implemented here"
							);
						}}
						className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition duration-300 flex items-center">
						<svg
							className="w-4 h-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							/>
						</svg>
						Email Report
					</button>

					<button
						onClick={() => {
							// Schedule report
							console.log(
								"Schedule report functionality would be implemented here"
							);
						}}
						className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition duration-300 flex items-center">
						<svg
							className="w-4 h-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						Schedule Report
					</button>
				</div>
			</div>
		</div>
	);
};

export default FinancialReports;
