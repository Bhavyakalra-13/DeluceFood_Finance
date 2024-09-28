import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@providers/AuthProvider";
import DefaultLayout from "@/components/DefaultLayout";

export const metadata: Metadata = {
	title: "Financer",
	description: "an web app to manage business finance",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<AuthProvider>
					<DefaultLayout>{children}</DefaultLayout>
				</AuthProvider>
			</body>
		</html>
	);
}
