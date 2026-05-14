import Link from "next/link";
import DropdownNotification from "./DropDownNotifications";
import DropdownUser from "./DropDownUser";
import DarkModeSwitcher from "./DarkModeSwitcher";
import { useAuth } from "@/providers/AuthProvider";

const Header = (props: {
	sidebarOpen: string | boolean | undefined;
	setSidebarOpen: (arg0: boolean) => void;
}) => {
	const { user } = useAuth();

	return (
		<header className="sticky top-0 z-999 flex w-full bg-white/80 backdrop-blur-xl border-b border-stroke/50 dark:bg-boxdark/80 dark:border-strokedark/50 text-black dark:text-bodydark">
			<div className="flex flex-grow items-center justify-between px-4 py-4 md:px-6 2xl:px-11">
				<div className="flex items-center gap-2 sm:gap-4 lg:hidden">
					{/* <!-- Hamburger Toggle BTN --> */}
					<button
						aria-controls="sidebar"
						onClick={(e) => {
							e.stopPropagation();
							props.setSidebarOpen(!props.sidebarOpen);
						}}
						className="z-99999 block rounded-xl border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden hover:bg-whiten dark:hover:bg-meta-4 transition-colors">
						<span className="relative block h-5.5 w-5.5 cursor-pointer">
							<span className="du-block absolute right-0 h-full w-full">
								<span
									className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${
										!props.sidebarOpen &&
										"!w-full delay-300"
									}`}></span>
								<span
									className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${
										!props.sidebarOpen &&
										"delay-400 !w-full"
									}`}></span>
								<span
									className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${
										!props.sidebarOpen &&
										"!w-full delay-500"
									}`}></span>
							</span>
							<span className="absolute right-0 h-full w-full rotate-45">
								<span
									className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${
										!props.sidebarOpen && "!h-0 !delay-[0]"
									}`}></span>
								<span
									className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white ${
										!props.sidebarOpen && "!h-0 !delay-200"
									}`}></span>
							</span>
						</span>
					</button>
					{/* <!-- Hamburger Toggle BTN --> */}

					<Link className="block flex-shrink-0 lg:hidden" href="/">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
								<svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
								</svg>
							</div>
							<h1 className="text-xl font-bold text-black dark:text-white">
								Financer
							</h1>
						</div>
					</Link>
				</div>

				{/* Search bar - hidden on mobile */}
				<div className="hidden md:block flex-1 max-w-md">
					<div className="relative">
						<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
							<svg className="w-4 h-4 text-bodydark2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
						<input
							type="text"
							placeholder="Search..."
							className="w-full py-2 pl-10 pr-4 text-sm rounded-xl border border-stroke bg-gray-2 dark:bg-form-input dark:border-strokedark text-black dark:text-white placeholder:text-bodydark2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
						/>
						<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
							<span className="text-xs text-bodydark2 bg-white dark:bg-meta-4 border border-stroke dark:border-strokedark px-1.5 py-0.5 rounded font-mono">⌘K</span>
						</div>
					</div>
				</div>

				<div className="ml-auto flex items-center gap-3 2xsm:gap-4">
					<ul className="flex items-center gap-2 2xsm:gap-4">
						<DarkModeSwitcher />
						{user?.email && <DropdownNotification />}
					</ul>
					{user?.email && <DropdownUser />}
				</div>
			</div>
		</header>
	);
};

export default Header;
