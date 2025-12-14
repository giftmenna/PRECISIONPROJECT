"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function SystemSettingsPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (status === "unauthenticated") router.replace("/auth/login");
		if (status === "authenticated" && (session?.user as any)?.role !== "admin") router.replace("/dashboard");
	}, [status, session, router]);

	// Placeholder save handler
	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		setTimeout(() => setSaving(false), 800);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-6">
			<div className="max-w-4xl mx-auto space-y-6">
				<h1 className="text-2xl font-bold">System Settings</h1>
				<form onSubmit={handleSave} className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>General</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label htmlFor="siteName">Site Name</Label>
								<Input id="siteName" placeholder="Precision Academic World" />
							</div>
							<div>
								<Label htmlFor="theme">Primary Color / Theme</Label>
								<Input id="theme" placeholder="#3b82f6" />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Payments (Paystack)</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label htmlFor="paystackPublic">Public Key</Label>
								<Input id="paystackPublic" placeholder="pk_test_..." />
							</div>
							<div>
								<Label htmlFor="paystackSecret">Secret Key</Label>
								<Input id="paystackSecret" placeholder="sk_test_..." type="password" />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Notifications</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label htmlFor="emailFrom">Email From</Label>
								<Input id="emailFrom" placeholder="noreply@yourdomain.com" />
							</div>
							<div>
								<Label htmlFor="welcomeTemplate">Welcome Email Template</Label>
								<Textarea id="welcomeTemplate" placeholder="Welcome template markdown..." rows={4} />
							</div>
							<div>
								<Label htmlFor="notificationTemplate">Notification Template</Label>
								<Textarea id="notificationTemplate" placeholder="Notification template markdown..." rows={4} />
							</div>
						</CardContent>
					</Card>

					<div className="flex justify-end">
						<Button type="submit" className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white" disabled={saving}>
							{saving ? "Saving..." : "Save Settings"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
} 