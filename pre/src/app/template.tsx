"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import ConditionalFooter from "@/components/ConditionalFooter";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Pages that should not have navbar/footer (full-page experience)
  const fullPageRoutes = ["/group-chat", "/messages"];
  const isFullPage = fullPageRoutes.some(route => pathname?.startsWith(route));

  if (isFullPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <ConditionalFooter />
    </div>
  );
}
