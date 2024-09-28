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
		<header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
			<div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
				<div className="flex items-center gap-2 sm:gap-4 lg:hidden">
					{/* <!-- Hamburger Toggle BTN --> */}
					<button
						aria-controls="sidebar"
						onClick={(e) => {
							e.stopPropagation();
							props.setSidebarOpen(!props.sidebarOpen);
						}}
						className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden">
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
						<h1 className="flex items-center text-4xl font-extrabold dark:text-white">
							Financer
							<span className="bg-blue-100 text-blue-800 text-xs font-semibold me-2 px-1.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ms-2">
								PRO
							</span>
						</h1>
					</Link>
				</div>

				<div className="ml-auto flex items-center gap-3 2xsm:gap-7">
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
