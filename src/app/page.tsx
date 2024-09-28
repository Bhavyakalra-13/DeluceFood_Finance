"use client";

import SpinLoader from "@components/SpinLoader";
import Login from "@components/Login";
import { useAuth } from "@providers/AuthProvider";
import Dashboard from "@/components/Dashboard";

export default function Home() {
	const { user, loading } = useAuth();

	if (loading) {
		return <SpinLoader />;
	}

	if (!user) {
		return <Login />;
	}

	return <Dashboard />;
}
