const SpinLoader = () => {
	return (
		<div className="flex h-screen w-full items-center justify-center bg-gray-2 dark:bg-boxdark-2">
			<div className="flex flex-col items-center gap-4">
				{/* Branded Loader */}
				<div className="relative">
					{/* Outer ring */}
					<div className="w-16 h-16 rounded-full border-[3px] border-indigo-100 dark:border-indigo-900/30" />
					{/* Spinning arc */}
					<div className="absolute inset-0 w-16 h-16 rounded-full border-[3px] border-transparent border-t-indigo-500 dark:border-t-indigo-400 animate-spin" />
					{/* Center icon */}
					<div className="absolute inset-0 flex items-center justify-center">
						<svg className="w-6 h-6 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
						</svg>
					</div>
				</div>
				<div className="text-center">
					<p className="text-sm font-medium text-body dark:text-bodydark">Loading</p>
					<p className="text-xs text-bodydark2 dark:text-bodydark mt-0.5">Please wait...</p>
				</div>
			</div>
		</div>
	);
};

export default SpinLoader;