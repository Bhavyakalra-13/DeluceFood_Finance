import React, { useState } from "react";
import ExpenseManagement from "./ExpenseManagement";
import ExpenseCategories from "./ExpenseCategories";
import VendorManagement from "./VendorManagement";

const ExpenseDashboard: React.FC = () => {
	const [activeTab, setActiveTab] = useState("expenses");

	const tabs = [
		{ id: "expenses", name: "Expenses", icon: (
			<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		)},
		{ id: "categories", name: "Categories", icon: (
			<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
			</svg>
		)},
		{ id: "vendors", name: "Vendors", icon: (
			<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
			</svg>
		)},
	];

	const renderContent = () => {
		switch (activeTab) {
			case "expenses":
				return <ExpenseManagement />;
			case "categories":
				return <ExpenseCategories />;
			case "vendors":
				return <VendorManagement />;
			default:
				return <ExpenseManagement />;
		}
	};

	return (
		<div>
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-black dark:text-white mb-1">
					Expense Management
				</h1>
				<p className="text-body dark:text-bodydark">
					Track, categorize, and manage business expenses
				</p>
			</div>

			{/* Tab Navigation - Pill Style */}
			<div className="mb-6">
				<div className="flex gap-1 p-1.5 bg-gray dark:bg-meta-4/50 rounded-2xl w-fit">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-200 ${
								activeTab === tab.id
									? "bg-white dark:bg-boxdark text-black dark:text-white shadow-sm"
									: "text-body dark:text-bodydark hover:text-black dark:hover:text-white hover:bg-white/50 dark:hover:bg-boxdark/50"
							}`}>
							{tab.icon}
							{tab.name}
						</button>
					))}
				</div>
			</div>

			{/* Tab Content */}
			<div className="animate-in">{renderContent()}</div>
		</div>
	);
};

export default ExpenseDashboard;
