"use client";

import { ApexOptions } from "apexcharts";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { collection, getDocs, query, where } from "firebase/firestore";
import db from "@/utils/firestore";
import TimePeriodFilter, { TimePeriod } from "../TimePeriodFilter";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
	ssr: false,
});

interface ChartData {
	revenue: number[];
	expenses: number[];
	labels: string[];
}

const LineChart: React.FC = () => {
	const [chartData, setChartData] = useState<ChartData>({
		revenue: [],
		expenses: [],
		labels: [],
	});
	const [loading, setLoading] = useState(true);
	const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("monthly");
	const [customStartDate, setCustomStartDate] = useState<string>("");
	const [customEndDate, setCustomEndDate] = useState<string>("");

	useEffect(() => {
		fetchChartData();
	}, [selectedPeriod, customStartDate, customEndDate]);

	const fetchChartData = async () => {
		try {
			setLoading(true);

			const currentDate = new Date();
			let labels = [];
			let revenueData = [];
			let expensesData = [];
			const dateRanges = [];

			console.log("Fetching chart data for period:", selectedPeriod);

			// Determine date ranges based on selected period
			if (
				selectedPeriod === "custom" &&
				customStartDate &&
				customEndDate
			) {
				// Custom date range
				const start = new Date(customStartDate);
				const end = new Date(customEndDate);
				const daysDiff = Math.ceil(
					(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
				);

				if (daysDiff <= 7) {
					// Daily data for custom range up to 7 days
					for (let i = 0; i <= daysDiff; i++) {
						const date = new Date(
							start.getTime() + i * 24 * 60 * 60 * 1000
						);
						const dateStr = date.toISOString().split("T")[0];
						labels.push(
							date.toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
							})
						);
						dateRanges.push({ start: dateStr, end: dateStr });
					}
				} else {
					// Weekly data for custom range more than 7 days
					const weeks = Math.ceil(daysDiff / 7);
					for (let i = 0; i < weeks; i++) {
						const weekStart = new Date(
							start.getTime() + i * 7 * 24 * 60 * 60 * 1000
						);
						const weekEnd = new Date(
							Math.min(
								weekStart.getTime() + 6 * 24 * 60 * 60 * 1000,
								end.getTime()
							)
						);
						labels.push(`Week ${i + 1}`);
						dateRanges.push({
							start: weekStart.toISOString().split("T")[0],
							end: weekEnd.toISOString().split("T")[0],
						});
					}
				}
			} else if (selectedPeriod === "weekly") {
				// Last 7 days
				for (let i = 6; i >= 0; i--) {
					const date = new Date(
						currentDate.getTime() - i * 24 * 60 * 60 * 1000
					);
					const dateStr = date.toISOString().split("T")[0];
					labels.push(
						date.toLocaleDateString("en-US", { weekday: "short" })
					);
					dateRanges.push({ start: dateStr, end: dateStr });
				}
			} else if (selectedPeriod === "monthly") {
				// Last 30 days
				for (let i = 29; i >= 0; i--) {
					const date = new Date(
						currentDate.getTime() - i * 24 * 60 * 60 * 1000
					);
					const dateStr = date.toISOString().split("T")[0];
					labels.push(
						date.toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
						})
					);
					dateRanges.push({ start: dateStr, end: dateStr });
				}
			} else if (selectedPeriod === "yearly") {
				// Last 12 months
				for (let i = 11; i >= 0; i--) {
					const date = new Date(
						currentDate.getFullYear(),
						currentDate.getMonth() - i,
						1
					);
					const startDate = date.toISOString().split("T")[0];
					const endDate = new Date(
						date.getFullYear(),
						date.getMonth() + 1,
						0
					)
						.toISOString()
						.split("T")[0];
					labels.push(
						date.toLocaleDateString("en-US", { month: "short" })
					);
					dateRanges.push({ start: startDate, end: endDate });
				}
			}

			console.log("Generated date ranges:", dateRanges);

			// Fetch all invoices and expenses first
			const allInvoicesQuery = query(collection(db, "invoices"));
			const allInvoicesSnapshot = await getDocs(allInvoicesQuery);
			const allInvoices = allInvoicesSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));

			const allExpensesQuery = query(
				collection(db, "expenses"),
				where("status", "==", "approved")
			);
			const allExpensesSnapshot = await getDocs(allExpensesQuery);
			const allExpenses = allExpensesSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));

			console.log("All invoices:", allInvoices.length);
			console.log("All expenses:", allExpenses.length);

			// Process data for each date range
			for (let i = 0; i < dateRanges.length; i++) {
				const range = dateRanges[i];

				// Filter invoices for this period
				const invoices = allInvoices.filter((invoice) => {
					const invoiceDate = invoice.invoiceDate;
					return (
						invoiceDate >= range.start && invoiceDate <= range.end
					);
				});

				console.log(
					`Date range ${range.start} to ${range.end}: Found ${invoices.length} invoices`
				);

				// Calculate revenue for this period
				const periodRevenue = invoices.reduce((sum, invoice) => {
					const price = Number(invoice.price) || 0;
					const quantity = Number(invoice.quantity) || 0;
					const taxRate = Number(invoice.taxRate) || 0;
					const discount = Number(invoice.discount) || 0;
					const subtotal = price * quantity;
					const taxAmount = (subtotal * taxRate) / 100;
					const total = subtotal + taxAmount - discount;
					return sum + total;
				}, 0);

				// Filter expenses for this period
				const expenses = allExpenses.filter((expense) => {
					const expenseDate = expense.date;
					return (
						expenseDate >= range.start && expenseDate <= range.end
					);
				});

				// Calculate expenses for this period
				const periodExpenses = expenses.reduce((sum, expense) => {
					return sum + (Number(expense.amount) || 0);
				}, 0);

				revenueData.push(Math.round(periodRevenue));
				expensesData.push(Math.round(periodExpenses));
			}

			// Ensure we have data for all labels
			while (revenueData.length < labels.length) {
				revenueData.push(0);
			}
			while (expensesData.length < labels.length) {
				expensesData.push(0);
			}

			// If no data at all, add some sample data for testing
			if (
				revenueData.every((val) => val === 0) &&
				expensesData.every((val) => val === 0)
			) {
				console.log("No data found, adding sample data for testing");
				revenueData = [100, 200, 150, 300, 250, 180, 220];
				expensesData = [50, 100, 80, 150, 120, 90, 110];
				labels = [
					"Day 1",
					"Day 2",
					"Day 3",
					"Day 4",
					"Day 5",
					"Day 6",
					"Day 7",
				];
			}

			console.log("Final chart data:", {
				revenue: revenueData,
				expenses: expensesData,
				labels: labels,
			});

			setChartData({
				revenue: revenueData,
				expenses: expensesData,
				labels: labels,
			});
		} catch (error) {
			console.error("Error fetching chart data:", error);
			// Set default data if there's an error
			setChartData({
				revenue: [0, 0, 0, 0, 0, 0, 0],
				expenses: [0, 0, 0, 0, 0, 0, 0],
				labels: ["No Data"],
			});
		} finally {
			setLoading(false);
		}
	};

	const maxValue = Math.max(...chartData.revenue, ...chartData.expenses);
	const yAxisMax = maxValue > 0 ? Math.ceil(maxValue * 1.1) : 100;

	console.log("Chart data state:", chartData);
	console.log("Max value:", maxValue, "Y-axis max:", yAxisMax);

	const options: ApexOptions = {
		legend: {
			show: false,
			position: "top",
			horizontalAlign: "left",
		},
		colors: ["#3C50E0", "#80CAEE"],
		chart: {
			fontFamily: "Satoshi, sans-serif",
			height: 335,
			type: "area",
			dropShadow: {
				enabled: true,
				color: "#623CEA14",
				top: 10,
				blur: 4,
				left: 0,
				opacity: 0.1,
			},
			toolbar: {
				show: false,
			},
		},
		responsive: [
			{
				breakpoint: 1024,
				options: {
					chart: {
						height: 300,
					},
				},
			},
			{
				breakpoint: 1366,
				options: {
					chart: {
						height: 350,
					},
				},
			},
		],
		stroke: {
			width: [2, 2],
			curve: "straight",
		},
		grid: {
			xaxis: {
				lines: {
					show: true,
				},
			},
			yaxis: {
				lines: {
					show: true,
				},
			},
		},
		dataLabels: {
			enabled: false,
		},
		markers: {
			size: 4,
			colors: "#fff",
			strokeColors: ["#3056D3", "#80CAEE"],
			strokeWidth: 3,
			strokeOpacity: 0.9,
			strokeDashArray: 0,
			fillOpacity: 1,
			discrete: [],
			hover: {
				size: undefined,
				sizeOffset: 5,
			},
		},
		xaxis: {
			type: "category",
			categories: chartData.labels,
			axisBorder: {
				show: false,
			},
			axisTicks: {
				show: false,
			},
		},
		yaxis: {
			title: {
				style: {
					fontSize: "0px",
				},
			},
			min: 0,
			max: yAxisMax,
		},
	};

	const series = [
		{
			name: "Revenue",
			data: chartData.revenue,
		},
		{
			name: "Expenses",
			data: chartData.expenses,
		},
	];

	console.log("Chart series:", series);

	if (loading) {
		return (
			<div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
				</div>
			</div>
		);
	}

	const handleCustomDateRangeChange = (
		startDate: string,
		endDate: string
	) => {
		setCustomStartDate(startDate);
		setCustomEndDate(endDate);
	};

	return (
		<div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
			<div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
				<div className="flex w-full flex-wrap gap-3 sm:gap-5">
					<div className="flex min-w-47.5">
						<span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
							<span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
						</span>
						<div className="w-full">
							<p className="font-semibold text-primary">
								Total Revenue
							</p>
							<p className="text-sm font-medium">
								{selectedPeriod === "monthly"
									? "Current Month"
									: selectedPeriod === "weekly"
									? "Last 7 Days"
									: selectedPeriod === "yearly"
									? "Last 12 Months"
									: "Custom Range"}
							</p>
						</div>
					</div>
					<div className="flex min-w-47.5">
						<span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
							<span className="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
						</span>
						<div className="w-full">
							<p className="font-semibold text-secondary">
								Total Expenses
							</p>
							<p className="text-sm font-medium">
								{selectedPeriod === "monthly"
									? "Current Month"
									: selectedPeriod === "weekly"
									? "Last 7 Days"
									: selectedPeriod === "yearly"
									? "Last 12 Months"
									: "Custom Range"}
							</p>
						</div>
					</div>
				</div>
				<div className="flex w-full max-w-45 justify-end gap-2">
					<TimePeriodFilter
						selectedPeriod={selectedPeriod}
						onPeriodChange={setSelectedPeriod}
						onCustomDateRangeChange={handleCustomDateRangeChange}
						customStartDate={customStartDate}
						customEndDate={customEndDate}
					/>
					<button
						onClick={fetchChartData}
						className="rounded bg-blue-500 px-3 py-1 text-xs font-medium text-white hover:bg-blue-600 transition duration-300">
						Refresh
					</button>
				</div>
			</div>

			<div>
				<div id="chartOne" className="-ml-5">
					<ReactApexChart
						options={options}
						series={series}
						type="area"
						height={350}
						width={"100%"}
					/>
				</div>
			</div>
		</div>
	);
};

export default LineChart;
