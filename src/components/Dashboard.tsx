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
import { useAuth } from "@/providers/AuthProvider";

const Dashboard = () => {
	const [activeTab, setActiveTab] = useState("overview");
	const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
		null
	);
	const [loading, setLoading] = useState(true);
	const { user } = useAuth();

	const tabs = [
		{ id: "overview", name: "Overview", icon: (
			<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
			</svg>
		)},
		{ id: "invoices", name: "Invoices", icon: (
			<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
			</svg>
		)},
		{ id: "create", name: "Create Invoice", icon: (
			<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
			</svg>
		)},
		{ id: "products", name: "Products", icon: (
			<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
			</svg>
		)},
		{ id: "customers", name: "Customers", icon: (
			<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
			</svg>
		)},
		{ id: "expenses", name: "Expenses", icon: (
			<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		)},
		{ id: "reports", name: "Reports", icon: (
			<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
			</svg>
		)},
		{ id: "inventory", name: "Inventory", icon: (
			<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
			</svg>
		)},
	];

	useEffect(() => {
		loadDashboardStats();
	}, []);

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning";
		if (hour < 17) return "Good afternoon";
		return "Good evening";
	};

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

	const SkeletonCard = () => (
		<div className="glass-card px-6 py-5">
			<div className="flex items-center justify-between mb-4">
				<div className="skeleton w-11 h-11 rounded-xl" />
				<div className="skeleton w-16 h-6 rounded-full" />
			</div>
			<div className="skeleton w-32 h-7 rounded mb-2" />
			<div className="skeleton w-20 h-4 rounded" />
		</div>
	);

	const renderContent = () => {
		switch (activeTab) {
			case "overview":
				return (
					<div className="animate-in">
						{loading ? (
							<>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:gap-6">
									<SkeletonCard />
									<SkeletonCard />
									<SkeletonCard />
									<SkeletonCard />
								</div>
								<div className="mt-6 grid grid-cols-12 gap-4 md:gap-6">
									<div className="col-span-12 xl:col-span-8 skeleton h-80 rounded-2xl" />
									<div className="col-span-12 xl:col-span-4 skeleton h-80 rounded-2xl" />
								</div>
							</>
						) : (
							<>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:gap-6">
									<div className="animate-slide-up stagger-1">
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
												(dashboardStats?.revenueGrowthRate || 0) >=
												0
											}
											color="indigo"
											icon={
												<svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
											}
										/>
									</div>
									<div className="animate-slide-up stagger-2">
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
												(dashboardStats?.invoiceGrowthRate || 0) >=
												0
											}
											color="emerald"
											icon={
												<svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
												</svg>
											}
										/>
									</div>
									<div className="animate-slide-up stagger-3">
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
												(dashboardStats?.paymentGrowthRate || 0) <
												0
											}
											color="amber"
											icon={
												<svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
											}
										/>
									</div>
									<div className="animate-slide-up stagger-4">
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
												(dashboardStats?.customerGrowthRate || 0) >=
												0
											}
											color="rose"
											icon={
												<svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
												</svg>
											}
										/>
									</div>
								</div>
								<div className="mt-6 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
									<LineChart />
									<BarChart />
								</div>
								<div className="mt-6 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
									<ProductDemandChart />
								</div>
							</>
						)}
					</div>
				);
			case "invoices":
				return <div className="animate-in"><Table /></div>;
			case "create":
				return <div className="animate-in"><Form /></div>;
			case "products":
				return <div className="animate-in"><ProductManagement /></div>;
			case "customers":
				return <div className="animate-in"><CustomerManagement /></div>;
			case "expenses":
				return <div className="animate-in"><ExpenseDashboard /></div>;
			case "reports":
				return <div className="animate-in"><FinancialReports /></div>;
			case "inventory":
				return <div className="animate-in"><InventoryDashboard /></div>;
			default:
				return null;
		}
	};

	return (
		<div>
			{/* Welcome Banner */}
			<div className="mb-6 animate-in">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 className="text-2xl font-bold text-black dark:text-white">
							{getGreeting()}{user?.email ? `, ${user.email.split('@')[0]}` : ''} 👋
						</h1>
						<p className="text-body dark:text-bodydark mt-1">
							Here&apos;s what&apos;s happening with your business today
						</p>
					</div>
					{activeTab === "overview" && (
						<button
							onClick={loadDashboardStats}
							className="btn-secondary flex items-center gap-2 text-sm self-start"
						>
							<svg
								className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
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
							Refresh
						</button>
					)}
				</div>
			</div>

			{/* Tab Navigation — Pill Style */}
			<div className="mb-6">
				<div className="flex gap-1 p-1.5 bg-gray dark:bg-meta-4/50 rounded-2xl overflow-x-auto no-scrollbar">
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
							<span className="hidden sm:inline">{tab.name}</span>
						</button>
					))}
				</div>
			</div>

			{/* Tab Content */}
			{renderContent()}
		</div>
	);
};

export default Dashboard;
