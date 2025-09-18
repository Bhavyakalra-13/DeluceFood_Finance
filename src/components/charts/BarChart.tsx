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
	sales: number[];
	profit: number[];
	labels: string[];
}

const BarChart: React.FC = () => {
	const [chartData, setChartData] = useState<ChartData>({
		sales: [],
		profit: [],
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
			let salesData = [];
			let profitData = [];
			let dateRanges = [];

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

				// Calculate sales for this period
				const periodSales = invoices.reduce((sum, invoice) => {
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

				// Calculate profit (sales - expenses)
				const periodProfit = periodSales - periodExpenses;

				salesData.push(Math.round(periodSales));
				profitData.push(Math.round(periodProfit));
			}

			// Ensure we have data for all labels
			while (salesData.length < labels.length) {
				salesData.push(0);
			}
			while (profitData.length < labels.length) {
				profitData.push(0);
			}

			// If no data at all, add some sample data for testing
			if (
				salesData.every((val) => val === 0) &&
				profitData.every((val) => val === 0)
			) {
				console.log("No data found, adding sample data for testing");
				salesData = [100, 200, 150, 300, 250, 180, 220];
				profitData = [50, 100, 80, 150, 120, 90, 110];
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
				sales: salesData,
				profit: profitData,
				labels: labels,
			});

			setChartData({
				sales: salesData,
				profit: profitData,
				labels: labels,
			});
		} catch (error) {
			console.error("Error fetching chart data:", error);
			// Set default data if there's an error
			setChartData({
				sales: [0, 0, 0, 0, 0, 0, 0],
				profit: [0, 0, 0, 0, 0, 0, 0],
				labels: ["No Data"],
			});
		} finally {
			setLoading(false);
		}
	};

	const maxValue = Math.max(...chartData.sales, ...chartData.profit);
	const yAxisMax = maxValue > 0 ? Math.ceil(maxValue * 1.1) : 100;

	const options: ApexOptions = {
		colors: ["#3C50E0", "#80CAEE"],
		chart: {
			fontFamily: "Satoshi, sans-serif",
			type: "bar",
			height: 335,
			stacked: false,
			toolbar: {
				show: false,
			},
			zoom: {
				enabled: false,
			},
		},
		responsive: [
			{
				breakpoint: 1536,
				options: {
					plotOptions: {
						bar: {
							borderRadius: 0,
							columnWidth: "25%",
						},
					},
				},
			},
		],
		plotOptions: {
			bar: {
				horizontal: false,
				borderRadius: 0,
				columnWidth: "25%",
				borderRadiusApplication: "end",
				borderRadiusWhenStacked: "last",
			},
		},
		dataLabels: {
			enabled: false,
		},
		xaxis: {
			categories: chartData.labels,
		},
		yaxis: {
			min: 0,
			max: yAxisMax,
		},
		legend: {
			position: "top",
			horizontalAlign: "left",
			fontFamily: "Satoshi",
			fontWeight: 500,
			fontSize: "14px",
		},
		fill: {
			opacity: 1,
		},
	};

	const series = [
		{
			name: "Sales",
			data: chartData.sales,
		},
		{
			name: "Profit",
			data: chartData.profit,
		},
	];

	if (loading) {
		return (
			<div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
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
		<div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
			<div className="mb-4 justify-between gap-4 sm:flex">
				<div>
					<h4 className="text-xl font-semibold text-black dark:text-white">
						Sales & Profit -{" "}
						{selectedPeriod === "monthly"
							? "Current Month"
							: selectedPeriod === "weekly"
							? "Last 7 Days"
							: selectedPeriod === "yearly"
							? "Last 12 Months"
							: "Custom Range"}
					</h4>
				</div>
				<div className="flex gap-2 items-center">
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
				<div id="chartTwo" className="-mb-9 -ml-5">
					<ReactApexChart
						options={options}
						series={series}
						type="bar"
						height={350}
						width={"100%"}
					/>
				</div>
			</div>
		</div>
	);
};

export default BarChart;
