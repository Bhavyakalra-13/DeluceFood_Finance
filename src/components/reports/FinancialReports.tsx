import React, { useState, useEffect } from "react";
import BalanceSheet from "./BalanceSheet";
import ProfitLossStatement from "./ProfitLossStatement";
import CashFlowStatement from "./CashFlowStatement";
import TaxReports from "./TaxReports";
import { DateRange } from "@/types/financial";
import { addSampleData } from "@/utils/sampleData";

const FinancialReports: React.FC = () => {
	const [activeReport, setActiveReport] = useState("balance-sheet");
	const [dateRange, setDateRange] = useState<DateRange>({
		startDate: new Date(new Date().getFullYear(), 0, 1)
			.toISOString()
			.split("T")[0], // Start of current year
		endDate: new Date().toISOString().split("T")[0], // Today
	});

	useEffect(() => {
		// Ensure we have sample data when the component loads
		addSampleData();
	}, []);

	const reports = [
		{ id: "balance-sheet", name: "Balance Sheet", icon: (
			<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
			</svg>
		)},
		{ id: "profit-loss", name: "Profit & Loss", icon: (
			<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
			</svg>
		)},
		{ id: "cash-flow", name: "Cash Flow", icon: (
			<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		)},
		{ id: "tax-reports", name: "Tax Reports", icon: (
			<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
			</svg>
		)},
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

	const datePresets = [
		{ label: "This Month", getRange: () => {
			const now = new Date();
			return {
				startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0],
				endDate: now.toISOString().split("T")[0],
			};
		}},
		{ label: "This Quarter", getRange: () => {
			const now = new Date();
			const quarter = Math.floor(now.getMonth() / 3);
			return {
				startDate: new Date(now.getFullYear(), quarter * 3, 1).toISOString().split("T")[0],
				endDate: now.toISOString().split("T")[0],
			};
		}},
		{ label: "Year to Date", getRange: () => {
			const now = new Date();
			return {
				startDate: new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0],
				endDate: now.toISOString().split("T")[0],
			};
		}},
		{ label: "Last Year", getRange: () => {
			const now = new Date();
			return {
				startDate: new Date(now.getFullYear() - 1, 0, 1).toISOString().split("T")[0],
				endDate: new Date(now.getFullYear() - 1, 11, 31).toISOString().split("T")[0],
			};
		}},
	];

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
		<div>
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-black dark:text-white mb-1">
					Financial Reports
				</h1>
				<p className="text-body dark:text-bodydark">
					Comprehensive financial analysis and reporting
				</p>
			</div>

			{/* Date Range Filter */}
			<div className="glass-card p-5 mb-6">
				<div className="flex flex-col lg:flex-row lg:items-end gap-4">
					<div className="flex-1">
						<h3 className="text-sm font-semibold text-black dark:text-white mb-3">
							Report Period
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div>
								<label className="block text-xs font-medium text-body dark:text-bodydark mb-1.5">
									Start Date
								</label>
								<input
									type="date"
									value={dateRange.startDate}
									onChange={(e) =>
										handleDateRangeChange("startDate", e.target.value)
									}
									className="input-modern py-2.5 text-sm"
								/>
							</div>
							<div>
								<label className="block text-xs font-medium text-body dark:text-bodydark mb-1.5">
									End Date
								</label>
								<input
									type="date"
									value={dateRange.endDate}
									onChange={(e) =>
										handleDateRangeChange("endDate", e.target.value)
									}
									className="input-modern py-2.5 text-sm"
								/>
							</div>
						</div>
					</div>
					<div className="flex flex-wrap gap-2">
						{datePresets.map((preset) => (
							<button
								key={preset.label}
								onClick={() => setDateRange(preset.getRange())}
								className="px-3 py-2 text-xs font-medium rounded-lg border border-stroke dark:border-strokedark text-body dark:text-bodydark hover:bg-whiten dark:hover:bg-meta-4 hover:text-black dark:hover:text-white transition-all"
							>
								{preset.label}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Report Navigation - Pill Style */}
			<div className="mb-6">
				<div className="flex gap-1 p-1.5 bg-gray dark:bg-meta-4/50 rounded-2xl overflow-x-auto no-scrollbar w-fit">
					{reports.map((report) => (
						<button
							key={report.id}
							onClick={() => setActiveReport(report.id)}
							className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-200 ${
								activeReport === report.id
									? "bg-white dark:bg-boxdark text-black dark:text-white shadow-sm"
									: "text-body dark:text-bodydark hover:text-black dark:hover:text-white hover:bg-white/50 dark:hover:bg-boxdark/50"
							}`}>
							{report.icon}
							{report.name}
						</button>
					))}
				</div>
			</div>

			{/* Report Content */}
			<div className="mb-6 animate-in">{renderReport()}</div>

			{/* Quick Actions */}
			<div className="glass-card p-5">
				<h3 className="text-sm font-semibold text-black dark:text-white mb-4">
					Quick Actions
				</h3>
				<div className="flex flex-wrap gap-3">
					<button
						onClick={() => window.print()}
						className="btn-primary text-sm flex items-center gap-2">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						Export PDF
					</button>

					<button
						onClick={() => console.log("Export Excel")}
						className="btn-success text-sm flex items-center gap-2">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						Export Excel
					</button>

					<button
						onClick={() => console.log("Email report")}
						className="btn-secondary text-sm flex items-center gap-2">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
						Email Report
					</button>
				</div>
			</div>
		</div>
	);
};

export default FinancialReports;
