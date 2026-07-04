"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { Gamepad2, Wallet, HelpCircle, User } from "lucide-react";

const tabs = [
  { path: "/dashboard",         label: "Play",    icon: Gamepad2 },
  { path: "/dashboard/wallet",  label: "Wallet",  icon: Wallet },
  { path: "/dashboard/help",    label: "Help",    icon: HelpCircle },
  { path: "/dashboard/profile", label: "Profile", icon: User },
];

export const SideNav = () => {
  const pathname = usePathname();

  return (
    <aside
      className="desktop-only"
      style={{
        width: 240,
        flexShrink: 0,
        height: "100vh",
        position: "sticky",
        top: 0,
        flexDirection: "column",
        background: "var(--surface)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRight: "1px solid var(--border)",
        padding: "32px 16px",
        gap: 8,
        zIndex: 40,
        boxShadow: "var(--glass-shadow)",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 12px 28px" }}>
        <Image src="/images/favicon.png" alt="Super Awoof" width={36} height={36} style={{ borderRadius: 10, height: "auto" }} />
        <span className="font-display" style={{ fontSize: 18, color: "white", letterSpacing: "-0.03em" }}>Super Awoof</span>
      </div>

      {/* Nav Links */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              href={tab.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                borderRadius: 16,
                textDecoration: "none",
                background: isActive ? "var(--green-dim)" : "transparent",
                color: isActive ? "var(--green)" : "var(--muted)",
                fontWeight: isActive ? 800 : 600,
                fontSize: 15,
                transition: "all 0.3s ease",
                border: isActive ? "1px solid var(--green-glow)" : "1px solid transparent",
                boxShadow: isActive ? "0 4px 12px var(--green-dim)" : "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                  e.currentTarget.style.color = "white";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--muted)";
                }
              }}
            >
              <Icon
                size={20}
                style={{
                  opacity: isActive ? 1 : 0.5,
                  filter: isActive ? "drop-shadow(0 0 6px var(--green-glow))" : "none",
                  transition: "all 0.3s ease",
                }}
              />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "16px 12px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "var(--green)", flexShrink: 0,
            }}
            className="pulse-dot"
          />
          <span style={{ fontSize: 12, color: "var(--muted)" }}>Connected</span>
        </div>

        {/* Flair Technologies Credit */}
        <a
          href="https://www.flairtechlabs.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 10,
            color: "var(--muted)",
            textDecoration: "none",
            opacity: 0.55,
            lineHeight: 1.5,
            transition: "opacity 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.55")}
        >
          Built by{" "}
          <span style={{ fontWeight: 700, color: "var(--green)" }}>
            Flair Technologies Limited
          </span>
        </a>
      </div>
    </aside>
  );
};
