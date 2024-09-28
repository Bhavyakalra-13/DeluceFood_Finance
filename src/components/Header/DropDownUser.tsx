import { useState } from "react";
import Link from "next/link";
import ClickOutside from "@components/ClickOutside";
import { useAuth } from "@/providers/AuthProvider";
import SignOut from "../LogOutButton";

const DropdownUser = () => {
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const { user } = useAuth();

	return (
		<ClickOutside
			onClick={() => setDropdownOpen(false)}
			className="relative">
			<Link
				onClick={() => setDropdownOpen(!dropdownOpen)}
				className="flex items-center gap-2"
				href="#">
				<span className="h-8 w-8 rounded-full">
					<div className="relative inline-flex items-center justify-center w-8 h-8 overflow-hidden bg-slate-300 rounded-full dark:bg-slate-200">
						<span className="font-medium text-gray-600 dark:text-gray-300">
							{user?.email?.charAt(0).toUpperCase()}
						</span>
					</div>
				</span>

				<svg
					className="hidden fill-current sm:block dark:text-white"
					width="12"
					height="8"
					viewBox="0 0 12 8"
					fill="none"
					xmlns="http://www.w3.org/2000/svg">
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M0.410765 0.910734C0.736202 0.585297 1.26384 0.585297 1.58928 0.910734L6.00002 5.32148L10.4108 0.910734C10.7362 0.585297 11.2638 0.585297 11.5893 0.910734C11.9147 1.23617 11.9147 1.76381 11.5893 2.08924L6.58928 7.08924C6.26384 7.41468 5.7362 7.41468 5.41077 7.08924L0.410765 2.08924C0.0853277 1.76381 0.0853277 1.23617 0.410765 0.910734Z"
						fill=""
					/>
				</svg>
			</Link>

			{/* <!-- Dropdown Start --> */}
			{dropdownOpen && (
				<div
					className={`absolute right-0 mt-4 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark`}>
					<SignOut/>
				</div>
			)}
			{/* <!-- Dropdown End --> */}
		</ClickOutside>
	);
};

export default DropdownUser;
