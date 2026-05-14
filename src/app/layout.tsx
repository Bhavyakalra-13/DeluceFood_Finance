import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@providers/AuthProvider";
import DefaultLayout from "@/components/DefaultLayout";
import { ErpProvider } from "@/providers/ErpProvider";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
	title: "Financer Pro — DeluceFood Finance",
	description: "Smart financial management for modern food businesses. Track revenue, manage invoices, monitor inventory, and generate comprehensive financial reports.",
	keywords: "finance, invoice, inventory, expense tracking, food business",
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="font-inter antialiased">
				<AuthProvider>
					<ErpProvider>
						<ToastProvider>
							<DefaultLayout>{children}</DefaultLayout>
						</ToastProvider>
					</ErpProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
