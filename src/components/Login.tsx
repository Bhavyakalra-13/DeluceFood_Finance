import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@utils/firebaseConfig";
import { useRouter } from "next/navigation";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loginError, setLoginError] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errorShake, setErrorShake] = useState(false);
	const router = useRouter();

	const handleLogin = async (e: { preventDefault: () => void }) => {
		e.preventDefault();
		setLoginError(false);
		setIsLoading(true);
		try {
			await signInWithEmailAndPassword(auth, email, password);
			router.push("/"); // Navigate to the home page
		} catch (error) {
			console.error("Error logging in:", error);
			setLoginError(true);
			setErrorShake(true);
			setTimeout(() => setErrorShake(false), 500);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex">
			{/* Left Panel — Branding */}
			<div className="hidden lg:flex lg:w-1/2 bg-gradient-login animated-gradient relative overflow-hidden">
				{/* Floating shapes */}
				<div className="absolute inset-0">
					<div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
					<div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
					<div className="absolute top-1/2 left-1/3 w-48 h-48 bg-indigo-300/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />
				</div>

				{/* Content */}
				<div className="relative z-10 flex flex-col justify-center px-16 text-white">
					<div className="mb-8">
						<div className="flex items-center gap-3 mb-6">
							<div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
								<svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
								</svg>
							</div>
							<h1 className="text-3xl font-bold tracking-tight">Financer</h1>
							<span className="bg-white/20 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded-md">PRO</span>
						</div>
						<h2 className="text-4xl font-bold leading-tight mb-4">
							Smart Financial<br />Management for<br />
							<span className="text-violet-200">Modern Business</span>
						</h2>
						<p className="text-lg text-indigo-200/80 max-w-md leading-relaxed">
							Track revenue, manage invoices, monitor inventory, and generate 
							comprehensive financial reports — all in one powerful dashboard.
						</p>
					</div>

					{/* Feature pills */}
					<div className="flex flex-wrap gap-3">
						{['Invoice Management', 'Expense Tracking', 'Financial Reports', 'Inventory Control'].map((feature) => (
							<span 
								key={feature}
								className="bg-white/10 backdrop-blur-sm border border-white/20 text-sm px-4 py-2 rounded-full"
							>
								{feature}
							</span>
						))}
					</div>
				</div>
			</div>

			{/* Right Panel — Login Form */}
			<div className="w-full lg:w-1/2 flex items-center justify-center bg-white dark:bg-boxdark-2 p-6 sm:p-12">
				<div className="w-full max-w-md animate-in">
					{/* Mobile Logo */}
					<div className="lg:hidden text-center mb-10">
						<div className="inline-flex items-center gap-3 mb-3">
							<div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
								<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
								</svg>
							</div>
							<h1 className="text-2xl font-bold text-black dark:text-white">Financer</h1>
							<span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 text-xs font-bold px-2 py-0.5 rounded-md">PRO</span>
						</div>
					</div>

					{/* Welcome Text */}
					<div className="mb-8">
						<h2 className="text-2xl font-bold text-black dark:text-white mb-2">
							Welcome back
						</h2>
						<p className="text-body dark:text-bodydark">
							Sign in to your account to continue
						</p>
					</div>

					{/* Login Form */}
					<form onSubmit={handleLogin} className="space-y-5">
						{/* Email Field */}
						<div>
							<label
								htmlFor="login-email"
								className="block text-sm font-medium text-black dark:text-white mb-2"
							>
								Email Address
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
									<svg className="w-5 h-5 text-bodydark2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
									</svg>
								</div>
								<input
									type="email"
									value={email}
									onChange={(e) => { setEmail(e.target.value); setLoginError(false); }}
									id="login-email"
									className="input-modern pl-12"
									placeholder="name@company.com"
									required
									autoComplete="email"
								/>
							</div>
						</div>

						{/* Password Field */}
						<div>
							<label
								htmlFor="login-password"
								className="block text-sm font-medium text-black dark:text-white mb-2"
							>
								Password
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
									<svg className="w-5 h-5 text-bodydark2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
									</svg>
								</div>
								<input
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => { setPassword(e.target.value); setLoginError(false); }}
									id="login-password"
									className="input-modern pl-12 pr-12"
									placeholder="Enter your password"
									required
									autoComplete="current-password"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute inset-y-0 right-0 flex items-center pr-4 text-bodydark2 hover:text-body dark:hover:text-bodydark transition-colors"
								>
									{showPassword ? (
										<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" />
										</svg>
									) : (
										<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
									)}
								</button>
							</div>
						</div>

						{/* Error Message */}
						{loginError && (
							<div 
								className={`flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 ${errorShake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
							>
								<svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<p className="text-red-600 dark:text-red-400 text-sm font-medium">
									Invalid email or password. Please try again.
								</p>
							</div>
						)}

						{/* Submit Button */}
						<button
							type="submit"
							disabled={isLoading}
							className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
						>
							{isLoading ? (
								<>
									<svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
									</svg>
									Signing in...
								</>
							) : (
								<>
									Sign In
									<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
									</svg>
								</>
							)}
						</button>
					</form>

					{/* Footer */}
					<p className="mt-8 text-center text-sm text-bodydark2 dark:text-bodydark">
						DeluceFood Finance Management System
					</p>
				</div>
			</div>
		</div>
	);
};

export default Login;
