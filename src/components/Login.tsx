import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@utils/firebaseConfig";
import { useRouter } from "next/navigation";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loginError, setLoginError] = useState(false);
	const router = useRouter();

	const handleLogin = async (e: { preventDefault: () => void }) => {
		e.preventDefault();
		try {
			await signInWithEmailAndPassword(auth, email, password);
			router.push("/"); // Navigate to the home page
		} catch (error) {
			console.error("Error logging in:", error);
			setLoginError(true);
		}
	};

	return (
		<form
			onSubmit={handleLogin}
			className="flex flex-col p-8 gap-4 text-bodydark w-2/3 mx-auto h-[86vh] justify-center">
			<label
				htmlFor="input-group-1"
				className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
				Your Email
			</label>
			<div className="relative mb-2">
				<div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
					<svg
						className="w-4 h-4 text-gray-500 dark:text-gray-400"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
						viewBox="0 0 20 16">
						<path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z" />
						<path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z" />
					</svg>
				</div>
				<input
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					id="input-group-1"
					className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 "
					placeholder="name@flowbite.com"
				/>
			</div>
			<label
				htmlFor="password-field"
				className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
				Password
			</label>

			<div className="relative mb-2">
				<div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
					<svg
						className="w-4 h-4 text-gray-500 dark:text-gray-400"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
						viewBox="0 0 20 20">
						<path d="M19.728 10.686c-2.38 2.256-6.153 3.381-9.875 3.381-3.722 0-7.4-1.126-9.571-3.371L0 10.437V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-7.6l-.272.286Z"></path>
						<path d="m.135 7.847 1.542 1.417c3.6 3.712 12.747 3.7 16.635.01L19.605 7.9A.98.98 0 0 1 20 7.652V6a2 2 0 0 0-2-2h-3V3a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v1H2a2 2 0 0 0-2 2v1.765c.047.024.092.051.135.082ZM10 10.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5ZM7 3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1H7V3Z"></path>
					</svg>
				</div>
				<input
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					id="password-field"
					className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 "
					placeholder="abs#8*12UP0"
				/>
			</div>
			<button
				type="submit"
				className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
				Login
			</button>

			{loginError && (
				<p className="text-red-500 text-sm">
					No Access or wrong credentials
				</p>
			)}
		</form>
	);
};

export default Login;
