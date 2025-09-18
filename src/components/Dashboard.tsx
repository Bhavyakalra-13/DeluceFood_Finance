import { useState } from "react";
import CardDataStats from "./CardDataStats";
import BarChart from "./charts/BarChart";
import LineChart from "./charts/LineChart";
import Table from "./Table";
import Form from "./Form";
import ProductManagement from "./ProductManagement";
import CustomerManagement from "./CustomerManagement";
import FinancialReports from "./reports/FinancialReports";
import ExpenseDashboard from "./expenses/ExpenseDashboard";
import InventoryDashboard from "./inventory/InventoryDashboard";

const Dashboard = () => {
	const [activeTab, setActiveTab] = useState("overview");

	const tabs = [
		{ id: "overview", name: "Overview", icon: "📊" },
		{ id: "invoices", name: "Invoices", icon: "📄" },
		{ id: "create", name: "Create Invoice", icon: "➕" },
		{ id: "products", name: "Products", icon: "📦" },
		{ id: "customers", name: "Customers", icon: "👥" },
		{ id: "expenses", name: "Expenses", icon: "💰" },
		{ id: "reports", name: "Reports", icon: "📈" },
		{ id: "inventory", name: "Inventory", icon: "🏢" },
	];

	const renderContent = () => {
		switch (activeTab) {
			case "overview":
				return (
					<div>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
							<CardDataStats
								title="Total Revenue"
								total="₹45,678"
								rate="12.5%"
								levelUp
							/>
							<CardDataStats
								title="Total Invoices"
								total="156"
								rate="8.2%"
								levelUp
							/>
							<CardDataStats
								title="Pending Payments"
								total="₹12,345"
								rate="-2.1%"
								levelDown
							/>
							<CardDataStats
								title="Active Customers"
								total="89"
								rate="15.3%"
								levelUp
							/>
						</div>
						<div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
							<LineChart />
							<BarChart />
						</div>
					</div>
				);
			case "invoices":
				return <Table />;
			case "create":
				return <Form />;
			case "products":
				return <ProductManagement />;
			case "customers":
				return <CustomerManagement />;
			case "expenses":
				return <ExpenseDashboard />;
			case "reports":
				return <FinancialReports />;
			case "inventory":
				return <InventoryDashboard />;
			default:
				return null;
		}
	};

	return (
		<div>
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
			{renderContent()}
		</div>
	);
};

export default Dashboard;
