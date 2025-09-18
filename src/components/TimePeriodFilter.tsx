"use client";

import React from "react";

export type TimePeriod = "weekly" | "monthly" | "yearly" | "custom";

interface TimePeriodFilterProps {
	selectedPeriod: TimePeriod;
	onPeriodChange: (period: TimePeriod) => void;
	onCustomDateRangeChange?: (startDate: string, endDate: string) => void;
	customStartDate?: string;
	customEndDate?: string;
}

const TimePeriodFilter: React.FC<TimePeriodFilterProps> = ({
	selectedPeriod,
	onPeriodChange,
	onCustomDateRangeChange,
	customStartDate,
	customEndDate,
}) => {
	const handleCustomDateChange = (field: "start" | "end", value: string) => {
		if (onCustomDateRangeChange) {
			if (field === "start") {
				onCustomDateRangeChange(value, customEndDate || "");
			} else {
				onCustomDateRangeChange(customStartDate || "", value);
			}
		}
	};

	return (
		<div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
			<select
				value={selectedPeriod}
				onChange={(e) => onPeriodChange(e.target.value as TimePeriod)}
				className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
				<option value="weekly">Weekly</option>
				<option value="monthly">Monthly</option>
				<option value="yearly">Yearly</option>
				<option value="custom">Custom Range</option>
			</select>

			{selectedPeriod === "custom" && onCustomDateRangeChange && (
				<div className="flex gap-2 items-center">
					<input
						type="date"
						value={customStartDate || ""}
						onChange={(e) =>
							handleCustomDateChange("start", e.target.value)
						}
						className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
					/>
					<span className="text-gray-500 dark:text-gray-400">to</span>
					<input
						type="date"
						value={customEndDate || ""}
						onChange={(e) =>
							handleCustomDateChange("end", e.target.value)
						}
						className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
					/>
				</div>
			)}
		</div>
	);
};

export default TimePeriodFilter;
