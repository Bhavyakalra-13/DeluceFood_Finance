import { useState, useEffect } from "react";
import CardDataStats from "./CardDataStats";
import BarChart from "./charts/BarChart";
import LineChart from "./charts/LineChart";
import ProductDemandChart from "./charts/ProductDemandChart";
import Table from "./Table";
import Form from "./Form";
import ProductManagement from "./ProductManagement";
import CustomerManagement from "./CustomerManagement";
import FinancialReports from "./reports/FinancialReports";
import ExpenseDashboard from "./expenses/ExpenseDashboard";
import InventoryDashboard from "./inventory/InventoryDashboard";
import {
	financialCalculationService,
	DashboardStats,
} from "@/utils/financialCalculations";
import { addSampleData } from "@/utils/sampleData";

const Dashboard = () => {
	const [activeTab, setActiveTab] = useState("overview");
	const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
		null
	);
	const [loading, setLoading] = useState(true);

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

	useEffect(() => {
		loadDashboardStats();
	}, []);

	const loadDashboardStats = async () => {
		try {
			setLoading(true);

			// First, ensure we have some sample data
			try {
				await addSampleData();
			} catch (sampleError) {
				console.warn("Could not add sample data:", sampleError);
			}

			// Get current year data
			const currentYear = new Date().getFullYear();
			const dateRange = {
				startDate: `${currentYear}-01-01`,
				endDate: new Date().toISOString().split("T")[0],
			};

			const stats =
				await financialCalculationService.calculateDashboardStats(
					dateRange
				);
			setDashboardStats(stats);
		} catch (error) {
			console.error("Error loading dashboard stats:", error);
			// Set some default values if there's an error
			setDashboardStats({
				totalRevenue: 0,
				totalInvoices: 0,
				pendingPayments: 0,
				activeCustomers: 0,
				revenueGrowthRate: 0,
				invoiceGrowthRate: 0,
				paymentGrowthRate: 0,
				customerGrowthRate: 0,
			});
		} finally {
			setLoading(false);
		}
	};

	const renderContent = () => {
		switch (activeTab) {
			case "overview":
				return (
					<div>
						{loading ? (
							<div className="flex justify-center items-center h-64">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
							</div>
						) : (
							<>
								<div className="flex justify-between items-center mb-4">
									<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
										Financial Overview
									</h2>
									<button
										onClick={loadDashboardStats}
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
												d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
											/>
										</svg>
										Refresh Data
									</button>
								</div>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
									<CardDataStats
										title="Total Revenue"
										total={`₹${
											dashboardStats?.totalRevenue.toLocaleString() ||
											"0"
										}`}
										rate={`${
											dashboardStats?.revenueGrowthRate.toFixed(
												1
											) || "0"
										}%`}
										levelUp={
											dashboardStats?.revenueGrowthRate >=
											0
										}
									/>
									<CardDataStats
										title="Total Invoices"
										total={
											dashboardStats?.totalInvoices.toString() ||
											"0"
										}
										rate={`${
											dashboardStats?.invoiceGrowthRate.toFixed(
												1
											) || "0"
										}%`}
										levelUp={
											dashboardStats?.invoiceGrowthRate >=
											0
										}
									/>
									<CardDataStats
										title="Pending Payments"
										total={`₹${
											dashboardStats?.pendingPayments.toLocaleString() ||
											"0"
										}`}
										rate={`${
											dashboardStats?.paymentGrowthRate.toFixed(
												1
											) || "0"
										}%`}
										levelDown={
											dashboardStats?.paymentGrowthRate <
											0
										}
									/>
									<CardDataStats
										title="Active Customers"
										total={
											dashboardStats?.activeCustomers.toString() ||
											"0"
										}
										rate={`${
											dashboardStats?.customerGrowthRate.toFixed(
												1
											) || "0"
										}%`}
										levelUp={
											dashboardStats?.customerGrowthRate >=
											0
										}
									/>
								</div>
								<div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
									<LineChart />
									<BarChart />
								</div>
								<div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
									<ProductDemandChart />
								</div>
							</>
						)}
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
