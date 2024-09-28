import CardDataStats from "./CardDataStats";
import BarChart from "./charts/BarChart";
import LineChart from "./charts/LineChart";
import Table from "./Table";

const Dashboard = () => {
	return (
		<div>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
				<CardDataStats
					title="Total views"
					total="$3.456K"
					rate="0.43%"
					levelUp
				/>
				<CardDataStats
					title="Total views"
					total="$3.456K"
					rate="0.43%"
					levelUp
				/>
				<CardDataStats
					title="Total views"
					total="$3.456K"
					rate="0.43%"
					levelUp
				/>
				<CardDataStats
					title="Total views"
					total="$3.456K"
					rate="0.43%"
					levelUp
				/>
			</div>
			<div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
				<LineChart />
				<BarChart />
				<div className="col-span-12">
					<Table />
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
