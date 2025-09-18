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

interface ProductDemandData {
	product: string;
	quantity: number;
	revenue: number;
}

interface ChartData {
	products: string[];
	quantities: number[];
	revenues: number[];
}

const ProductDemandChart: React.FC = () => {
	const [chartData, setChartData] = useState<ChartData>({
		products: [],
		quantities: [],
		revenues: [],
	});
	const [loading, setLoading] = useState(true);
	const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("monthly");
	const [customStartDate, setCustomStartDate] = useState<string>("");
	const [customEndDate, setCustomEndDate] = useState<string>("");

	useEffect(() => {
		fetchProductDemandData();
	}, [selectedPeriod, customStartDate, customEndDate]);

	const fetchProductDemandData = async () => {
		try {
			setLoading(true);

			const currentDate = new Date();
			let startDate = "";
			let endDate = "";

			// Determine date range based on selected period
			if (
				selectedPeriod === "custom" &&
				customStartDate &&
				customEndDate
			) {
				startDate = customStartDate;
				endDate = customEndDate;
			} else if (selectedPeriod === "weekly") {
				// Last 7 days
				const weekAgo = new Date(
					currentDate.getTime() - 7 * 24 * 60 * 60 * 1000
				);
				startDate = weekAgo.toISOString().split("T")[0];
				endDate = currentDate.toISOString().split("T")[0];
			} else if (selectedPeriod === "monthly") {
				// Current month only
				const currentMonth = currentDate.getMonth();
				const currentYear = currentDate.getFullYear();
				startDate = new Date(currentYear, currentMonth, 1)
					.toISOString()
					.split("T")[0];
				endDate = new Date(currentYear, currentMonth + 1, 0)
					.toISOString()
					.split("T")[0];
			} else if (selectedPeriod === "yearly") {
				// Last 12 months
				const yearAgo = new Date(
					currentDate.getFullYear() - 1,
					currentDate.getMonth(),
					currentDate.getDate()
				);
				startDate = yearAgo.toISOString().split("T")[0];
				endDate = currentDate.toISOString().split("T")[0];
			}

			// Get invoices for the selected period
			const invoicesQuery = query(
				collection(db, "invoices"),
				where("invoiceDate", ">=", startDate),
				where("invoiceDate", "<=", endDate)
			);
			const invoicesSnapshot = await getDocs(invoicesQuery);
			const invoices = invoicesSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));

			// Group by product and calculate totals
			const productMap = new Map<
				string,
				{ quantity: number; revenue: number }
			>();

			invoices.forEach((invoice) => {
				const product = invoice.product || "Unknown Product";
				const quantity = Number(invoice.quantity) || 0;
				const price = Number(invoice.price) || 0;
				const taxRate = Number(invoice.taxRate) || 0;
				const discount = Number(invoice.discount) || 0;
				const subtotal = price * quantity;
				const taxAmount = (subtotal * taxRate) / 100;
				const total = subtotal + taxAmount - discount;

				if (productMap.has(product)) {
					const existing = productMap.get(product)!;
					productMap.set(product, {
						quantity: existing.quantity + quantity,
						revenue: existing.revenue + total,
					});
				} else {
					productMap.set(product, {
						quantity: quantity,
						revenue: total,
					});
				}
			});

			// Convert to arrays and sort by quantity (demand)
			const productData: ProductDemandData[] = Array.from(
				productMap.entries()
			).map(([product, data]) => ({
				product,
				quantity: data.quantity,
				revenue: data.revenue,
			}));

			// Sort by quantity descending
			productData.sort((a, b) => b.quantity - a.quantity);

			// Take top 10 products
			const topProducts = productData.slice(0, 10);

			setChartData({
				products: topProducts.map((item) => item.product),
				quantities: topProducts.map((item) => item.quantity),
				revenues: topProducts.map((item) => Math.round(item.revenue)),
			});
		} catch (error) {
			console.error("Error fetching product demand data:", error);
			// Set default data if there's an error
			setChartData({
				products: ["No Data"],
				quantities: [0],
				revenues: [0],
			});
		} finally {
			setLoading(false);
		}
	};

	const maxQuantity = Math.max(...chartData.quantities);
	const yAxisMax = maxQuantity > 0 ? Math.ceil(maxQuantity * 1.1) : 100;

	const options: ApexOptions = {
		colors: ["#3C50E0", "#80CAEE"],
		chart: {
			fontFamily: "Satoshi, sans-serif",
			type: "bar",
			height: 400,
			toolbar: {
				show: false,
			},
		},
		plotOptions: {
			bar: {
				horizontal: true,
				borderRadius: 0,
				columnWidth: "60%",
			},
		},
		dataLabels: {
			enabled: false,
		},
		xaxis: {
			categories: chartData.products,
			title: {
				text: "Quantity Sold",
			},
		},
		yaxis: {
			min: 0,
			max: yAxisMax,
			title: {
				text: "Products",
			},
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
		tooltip: {
			y: {
				formatter: function (
					val: number,
					{ seriesIndex, dataPointIndex }
				) {
					if (seriesIndex === 0) {
						return `Quantity: ${val}`;
					} else {
						return `Revenue: ₹${
							chartData.revenues[
								dataPointIndex
							]?.toLocaleString() || 0
						}`;
					}
				},
			},
		},
	};

	const series = [
		{
			name: "Quantity Sold",
			data: chartData.quantities,
		},
		{
			name: "Revenue (₹)",
			data: chartData.revenues,
		},
	];

	if (loading) {
		return (
			<div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
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
		<div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
			<div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
				<div className="flex w-full flex-wrap gap-3 sm:gap-5">
					<div className="flex min-w-47.5">
						<span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
							<span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
						</span>
						<div className="w-full">
							<p className="font-semibold text-primary">
								Product Demand Analysis
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
						onClick={fetchProductDemandData}
						className="rounded bg-blue-500 px-3 py-1 text-xs font-medium text-white hover:bg-blue-600 transition duration-300">
						Refresh
					</button>
				</div>
			</div>

			<div>
				<div id="productDemandChart" className="-ml-5">
					<ReactApexChart
						options={options}
						series={series}
						type="bar"
						height={400}
						width={"100%"}
					/>
				</div>
			</div>
		</div>
	);
};

export default ProductDemandChart;
