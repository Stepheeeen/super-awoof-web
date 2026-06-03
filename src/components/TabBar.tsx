"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const tabs = [
  { path: "/dashboard",         label: "Play",    activeIcon: "/images/homeActiveIcon.png",    inactiveIcon: "/images/homeNotActiveIcon.png" },
  { path: "/dashboard/wallet",  label: "Wallet",  activeIcon: "/images/money.png",             inactiveIcon: "/images/money.png" },
  { path: "/dashboard/help",    label: "Help",    activeIcon: "/images/helpActiveIcon.png",    inactiveIcon: "/images/helpNotActiveIcon.png" },
  { path: "/dashboard/profile", label: "Profile", activeIcon: "/images/profileActiveIcon.png", inactiveIcon: "/images/profileNotActiveIcon.png" },
];

export const TabBar = () => {
  const pathname = usePathname();

  return (
    <div
      className="mobile-only"
      style={{
        position: "fixed",
        bottom: 24,
        left: 16,
        right: 16,
        height: 72,
        background: "var(--surface)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid var(--border)",
        borderRadius: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-evenly",
        zIndex: 100,
        boxShadow: "var(--glass-shadow)",
        padding: "0 8px",
      }}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <Link
            key={tab.path}
            href={tab.path}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              textDecoration: "none",
              padding: "10px 16px",
              borderRadius: 24,
              color: isActive ? "var(--green)" : "var(--muted)",
              background: isActive ? "var(--green-dim)" : "transparent",
              transition: "all 0.3s ease",
            }}
          >
            <Image
              src={isActive ? tab.activeIcon : tab.inactiveIcon}
              alt={tab.label}
              width={22}
              height={22}
              style={{ objectFit: "contain", opacity: isActive ? 1 : 0.5, filter: isActive ? "drop-shadow(0 0 8px var(--green-glow))" : "none" }}
            />
            <span style={{ fontSize: 10, fontWeight: isActive ? 800 : 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};
