"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { Button } from "@/components/Button";
import { ToastProvider, useToast } from "@/context/ToastContext";
import { baseUrl } from "@/lib/constants";

function ForgotPasswordOTPForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 3) refs[idx + 1].current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) refs[idx - 1].current?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").trim();
    if (/^\d{4}$/.test(text)) {
      const digits = text.split("");
      setOtp(digits);
      refs[3].current?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length < 4) {
      showToast("Please fill in all 4 digits.", "error");
      return;
    }
    try {
      setLoading(true);
      const email = localStorage.getItem("passwordEmailReset") || "";
      const storedEndpoint = localStorage.getItem("verifyEndpoint") || "/account/verify-otp";
      
      const response = await axios.post(`${baseUrl}${storedEndpoint}`, { 
        email,
        otp: otpCode 
      });

      if (response.status === 200) {
        // Save OTP so update-password page can use it as old_password
        localStorage.setItem("passwordResetOtp", otpCode);
        showToast("Verification successful! Please choose a new password.", "success");
        setTimeout(() => router.push("/auth/update-password"), 1200);
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Invalid or expired code. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      const email = localStorage.getItem("passwordEmailReset");
      if (email) {
        await axios.post(`${baseUrl}/account/request-password-reset`, { email });
        showToast("Reset code resent to your email!", "success");
      } else {
        showToast("Email address not found. Please try again.", "error");
        router.push("/auth/forgot-password");
      }
    } catch {
      showToast("Failed to resend code. Try again.", "error");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-cols">
        {/* Left – Branding (desktop only) */}
        <div
          className="desktop-only"
          style={{
            flex: "0 0 50%",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 48px",
            gap: 32,
          }}
        >
          <Image
            src="/images/favicon.png"
            alt="Super Awoof"
            width={72}
            height={72}
            style={{ borderRadius: 20, height: "auto" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h1 className="font-display" style={{ fontSize: 48, lineHeight: 1.1, color: "white" }}>
              Reset<br />your password.
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 340 }}>
              Enter the 4-digit verification code sent to your email to reset your credentials.
            </p>
          </div>
        </div>

        {/* Right – Form card */}
        <div className="auth-form-col">
          <div
            className="card auth-form-card"
            style={{
              flex: "0 0 50%",
              display: "flex",
              flexDirection: "column",
              gap: 28,
              padding: "40px 32px",
              width: "100%",
            }}
          >
            {/* Mobile: logo centered */}
            <div className="mobile-only" style={{ justifyContent: "center", marginBottom: 4 }}>
              <Image
                src="/images/favicon.png"
                alt="Super Awoof"
                width={56}
                height={56}
                style={{ borderRadius: 16, height: "auto" }}
              />
            </div>

            {/* Heading */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <h2 className="font-display" style={{ fontSize: 26, color: "white" }}>
                Verification Code
              </h2>
              <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
                Check your email or phone for your 4-digit OTP.
              </p>
            </div>

            {/* OTP digit boxes */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", width: "100%" }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={refs[i]}
                  id={`otp-digit-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  autoComplete="one-time-code"
                  onChange={(e) => handleChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  onPaste={handlePaste}
                  style={{
                    width: 64,
                    height: 72,
                    flexShrink: 0,
                    background: "var(--surface-2)",
                    border: `2px solid ${digit ? "var(--green)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 16,
                    color: "white",
                    fontSize: 28,
                    fontWeight: 700,
                    textAlign: "center",
                    outline: "none",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--green)";
                    e.currentTarget.style.boxShadow = "0 0 0 4px rgba(29,185,84,0.12)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = digit ? "var(--green)" : "rgba(255,255,255,0.08)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Button text="Verify OTP" onClick={handleVerify} isLoading={loading} />
              <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
                Didn&apos;t receive a code?{" "}
                <button
                  onClick={handleResend}
                  disabled={resending}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "var(--green)",
                    fontWeight: 700,
                    opacity: resending ? 0.5 : 1,
                  }}
                >
                  {resending ? "Resending..." : "Resend"}
                </button>
              </p>
            </div>

            {/* Divider + back */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, textAlign: "center" }}>
              <button
                onClick={() => router.back()}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "var(--muted)",
                }}
              >
                ← Go back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordOTPPage() {
  return (
    <ToastProvider>
      <ForgotPasswordOTPForm />
    </ToastProvider>
  );
}
