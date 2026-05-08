"use client";
import React from "react";
import { SideNav } from "./SideNav";
import { TabBar } from "./TabBar";
import { usePathname } from "next/navigation";

export const ResponsiveLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isShell = pathname === "/" || pathname.startsWith("/onboarding") || pathname.startsWith("/auth");

  if (isShell) {
    // Auth & onboarding: full-screen, no nav
    return (
      <div style={{ height: "100dvh", width: "100vw", overflow: "hidden" }} className="bg-[#0D0F14]">
        {children}
      </div>
    );
  }

  // Dashboard app shell: sidebar on desktop, tab bar on mobile
  return (
    <div className="flex bg-[#0D0F14]" style={{ height: "100dvh", width: "100vw", overflow: "hidden" }}>
      <SideNav />
      <main className="flex-1 relative overflow-y-auto md:h-screen pb-20 md:pb-0">
        {children}
      </main>
      <div className="md:hidden">
        <TabBar />
      </div>
    </div>
  );
};
