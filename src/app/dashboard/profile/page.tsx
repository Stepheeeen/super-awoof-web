"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, clearTokens } from "@/lib/constants";
import { ToastProvider, useToast } from "@/context/ToastContext";

function ProfileContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.push("/auth/signin");
      return;
    }
    setUser(u);
  }, [router]);

  const handleLogout = () => {
    clearTokens();
    showToast("Logged out successfully.", "success");
    setTimeout(() => {
      router.push("/auth/signin");
    }, 1000);
  };

  if (!user) return null;

  return (
    <div className="app-screen anim-fade-up" style={{ padding: "24px 20px 80px", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 28 }}>
        <h1 className="font-display" style={{ fontSize: 28, color: "white" }}>
          Your Profile
        </h1>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>
          Manage your account settings and credentials.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 600 }}>
        {/* User Card */}
        <div className="card" style={{ padding: 24, display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--green-dim)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(29, 185, 84, 0.2)",
            }}
          >
            <span className="font-display" style={{ fontSize: 20, color: "var(--green)", fontWeight: 800 }}>
              {user.fullname ? user.fullname.substring(0, 2).toUpperCase() : "U"}
            </span>
          </div>
          <div>
            <h2 className="font-display" style={{ fontSize: 18, color: "white", marginBottom: 2 }}>
              {user.fullname ?? "Player"}
            </h2>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>
              {user.email || user.phone || "No contact info"}
            </p>
          </div>
        </div>

        {/* Details Section */}
        <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>Subscription Level</span>
            <span style={{ fontSize: 14, color: "white", fontWeight: 700 }}>
              {user.subscription ? user.subscription.toUpperCase() : "FREE"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>Coins Balance</span>
            <span style={{ fontSize: 14, color: "var(--gold)", fontWeight: 700 }}>
              {user.coins ?? 0}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>Login Mode</span>
            <span style={{ fontSize: 14, color: "white", fontWeight: 700, textTransform: "capitalize" }}>
              {user.loginMode ?? "Email"}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            height: 56,
            width: "100%",
            borderRadius: 16,
            background: "transparent",
            border: "1.5px solid var(--danger)",
            color: "var(--danger)",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s ease",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 77, 77, 0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          Logout Account
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ToastProvider>
      <ProfileContent />
    </ToastProvider>
  );
}
