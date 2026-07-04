"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, clearTokens, getAccessToken, baseUrl } from "@/lib/constants";
import { ToastProvider, useToast } from "@/context/ToastContext";
import { Button } from "@/components/Button";
import { X } from "lucide-react";
import axios from "axios";

function ProfileContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  
  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.push("/auth/signin");
      return;
    }
    setUser(u);
  }, [router]);

  const handleLogout = async () => {
    try {
      const token = getAccessToken();
      if (token) {
        await axios.post(
          `${baseUrl}/account/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      console.error("Failed to call logout API:", err);
    } finally {
      clearTokens();
      showToast("Logged out successfully.", "success");
      setTimeout(() => {
        router.push("/auth/signin");
      }, 1000);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      showToast("Please fill in all fields.", "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast("New password must be at least 8 characters.", "error");
      return;
    }
    try {
      const token = getAccessToken();
      await axios.post(
        `${baseUrl}/account/update/password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Password updated successfully!", "success");
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to update password.", "error");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      showToast("Please type 'DELETE' to confirm.", "error");
      return;
    }
    try {
      const token = getAccessToken();
      await axios.delete(`${baseUrl}/account`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Account deleted successfully.", "success");
      clearTokens();
      setShowDeleteModal(false);
      setTimeout(() => {
        router.push("/auth/signin");
      }, 1200);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to delete account.", "error");
    }
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

        {/* Account Actions Section */}
        <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <h3 className="font-display" style={{ fontSize: 16, color: "white" }}>Account Settings</h3>
          <button
            onClick={() => setShowPasswordModal(true)}
            style={{
              height: 48,
              width: "100%",
              borderRadius: 14,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
          >
            Change Password
          </button>
          
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              height: 48,
              width: "100%",
              borderRadius: 14,
              background: "rgba(255, 77, 77, 0.05)",
              border: "1px solid rgba(255, 77, 77, 0.2)",
              color: "var(--danger)",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 77, 77, 0.12)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 77, 77, 0.05)")}
          >
            Delete Account
          </button>
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
            marginTop: 8,
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

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-card max-w-sm animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowPasswordModal(false)} className="absolute top-4 right-4 text-[#A8A8A8] hover:text-white transition-colors">
              <X size={22} className="w-5 h-5" />
            </button>
            <h2 className="text-white text-xl font-bold text-center mb-6 font-display">Change Password</h2>
            <div className="flex flex-col gap-4">
              <input
                type="password"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="input"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
              />
              <Button text="Update Password" onClick={handleChangePassword} className="mt-2" />
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-card max-w-sm animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowDeleteModal(false)} className="absolute top-4 right-4 text-[#A8A8A8] hover:text-white transition-colors">
              <X size={22} className="w-5 h-5" />
            </button>
            <h2 className="text-white text-xl font-bold text-center mb-2 font-display">Delete Account</h2>
            <p className="text-[#FF4D4D] text-sm text-center mb-5 font-semibold">Warning: This action is permanent and cannot be undone.</p>
            <div className="flex flex-col gap-4">
              <p className="text-white/60 text-xs text-center">Type <strong className="text-white font-bold">DELETE</strong> to confirm deletion.</p>
              <input
                type="text"
                placeholder="DELETE"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="input text-center"
              />
              <Button text="Delete Account" variant="danger" onClick={handleDeleteAccount} className="mt-2" />
            </div>
          </div>
        </div>
      )}
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
