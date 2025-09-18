import React, { useState } from "react";
import ExpenseManagement from "./ExpenseManagement";
import ExpenseCategories from "./ExpenseCategories";
import VendorManagement from "./VendorManagement";

const ExpenseDashboard: React.FC = () => {
	const [activeTab, setActiveTab] = useState("expenses");

	const tabs = [
		{ id: "expenses", name: "Expenses", icon: "💰" },
		{ id: "categories", name: "Categories", icon: "📂" },
		{ id: "vendors", name: "Vendors", icon: "🏢" },
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
		<div className="p-6">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
					Expense Management
				</h1>
				<p className="text-gray-600 dark:text-gray-400">
					Track, categorize, and manage business expenses
				</p>
			</div>

			{/* Tab Navigation */}
			<div className="mb-6">
				<div className="border-b border-gray-200 dark:border-gray-700">
					<nav className="-mb-px flex space-x-8">
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`py-2 px-1 border-b-2 font-medium text-sm ${
									activeTab === tab.id
										? "border-blue-500 text-blue-600 dark:text-blue-400"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
								}`}>
								<span className="mr-2">{tab.icon}</span>
								{tab.name}
							</button>
						))}
					</nav>
				</div>
			</div>

			{/* Tab Content */}
			<div>{renderContent()}</div>
		</div>
	);
};

export default ExpenseDashboard;
