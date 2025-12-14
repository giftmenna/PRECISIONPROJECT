"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
	const pathname = usePathname();
	if (!pathname) return null;

	// Hide footer on community discussion pages, admin pages, and user learning/competition pages
	const shouldHide = pathname.startsWith("/group-chat") || 
		pathname.startsWith("/admin") ||
		pathname.startsWith("/learn") ||
		pathname.startsWith("/practice") ||
		pathname.startsWith("/daily-lessons") ||
		pathname.startsWith("/competition") ||
		pathname.startsWith("/messages") ||
		pathname.startsWith("/profile") ||
		pathname.includes("/exam") ||
		pathname.includes("/test");
	if (shouldHide) return null;

	return <Footer />;
} 