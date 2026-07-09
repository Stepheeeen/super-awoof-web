"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { ToastProvider, useToast } from "@/context/ToastContext";
import { baseUrl, getAccessToken, getUser } from "@/lib/constants";
import { ArrowDownUp, X, ChevronLeft, Smartphone, Copy, Check, Send, Sparkles } from "lucide-react";

const PACKAGES = [
  { id: "starter", name: "Starter Pack", coins: 10, price: 250, badge: null },
  { id: "classic", name: "Classic Pack", coins: 40, price: 1000, badge: "Popular" },
  { id: "booster", name: "Win Booster", coins: 100, price: 2500, badge: null },
  { id: "roller", name: "High Roller", coins: 200, price: 5000, badge: "Best Value" },
];

const CoinStackIcon = ({ size = 48, active = false }: { size?: number; active?: boolean }) => {
  const strokeColor = active ? "#1DB954" : "rgba(255, 255, 255, 0.35)";
  const fillOpacity = active ? "0.2" : "0.1";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transition: "all 0.3s ease" }}>
      {/* Back/bottom coin */}
      <ellipse cx="24" cy="34" rx="16" ry="6" fill={`url(#coinStackGrad-${active})`} stroke={strokeColor} strokeWidth="1.5" />
      <path d="M8 34V38C8 41.3 15.2 44 24 44C32.8 44 40 41.3 40 38V34" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Middle coin */}
      <ellipse cx="24" cy="26" rx="16" ry="6" fill={`url(#coinStackGrad-${active})`} stroke={strokeColor} strokeWidth="1.5" />
      <path d="M8 26V30C8 33.3 15.2 36 24 36C32.8 36 40 33.3 40 30V26" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Top coin */}
      <ellipse cx="24" cy="18" rx="16" ry="6" fill={`url(#coinStackGrad-${active})`} stroke={strokeColor} strokeWidth="1.5" />
      <path d="M8 18V22C8 25.3 15.2 28 24 28C32.8 28 40 25.3 40 22V18" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Shiny top coin surface detail */}
      <circle cx="24" cy="18" r="8" stroke={active ? "rgba(29, 185, 84, 0.6)" : "rgba(255, 255, 255, 0.2)"} strokeWidth="1" />
      
      <defs>
        <linearGradient id={`coinStackGrad-${active}`} x1="8" y1="12" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor={active ? "#1DB954" : "#242936"} />
          <stop offset="1" stopColor="#0F1219" />
        </linearGradient>
      </defs>
    </svg>
  );
};

function DepositForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [coin, setCoin] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [user, setUser] = useState<any>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    showToast(`${label} copied to clipboard!`, "success");
    setTimeout(() => setCopiedText(null), 2000);
  };

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleCoinChange = (val: string) => {
    const sanitized = val.replace(/\D/g, "");
    setCoin(sanitized);
    setAmount(sanitized ? (Number(sanitized) * 25).toString() : "");
  };

  const handleAmountChange = (val: string) => {
    const sanitized = val.replace(/\D/g, "");
    setAmount(sanitized);
    setCoin(sanitized ? Math.floor(Number(sanitized) / 25).toString() : "");
  };

  const selectPackage = (coins: number) => {
    setCoin(coins.toString());
    setAmount((coins * 25).toString());
  };

  const isValid = Number(coin) >= 1 && Number(amount) >= 25;

  const handlePay = async () => {
    const token = getAccessToken();
    if (!token) {
      router.push("/auth/signin");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(
        `${baseUrl}/wallet/fund`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPaymentUrl(response.data.authorization_url);
      setReference(response.data.reference);
    } catch (error: any) {
      showToast("Payment initiation failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClose = async () => {
    setPaymentUrl(null);
    try {
      const token = getAccessToken();
      await axios.get(`${baseUrl}/wallet/verify/${reference}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Payment Successful!", "success");
      router.push("/dashboard/wallet");
    } catch {
      showToast("Payment was abandoned or not completed.", "error");
    }
  };

  if (!user) {
    return (
      <div className="page-container min-h-screen bg-[#0F1219] flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page-container min-h-screen bg-[#0F1219] animate-fade-in" style={{ padding: "64px 28px 160px 28px" }}>
      <div style={{ maxWidth: 850, margin: "0 auto", width: "100%" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
          <button 
            onClick={() => router.back()} 
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-white font-bold text-3xl font-display tracking-wide">Deposit Coins</h1>
        </div>

        {user?.loginMode === "phone" || user?.phone ? (
          <div className="flex flex-col gap-10 animate-fade-in max-w-2xl mx-auto">
            {/* Operator Header Card */}
            <div className="relative overflow-hidden rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-[#1E1B15] to-[#12141C] pt-12 pb-10 px-8 md:px-12 shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(255,198,0,0.04)] text-center flex flex-col items-center">
              {/* Ambient top glow */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-500/8 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="relative z-10 w-18 h-18 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 p-[1.5px] shadow-[0_8px_24px_rgba(245,166,35,0.3)] mb-7" style={{ width: 72, height: 72 }}>
                <div className="w-full h-full rounded-2xl bg-[#14110A] flex items-center justify-center">
                  <Smartphone size={32} className="text-yellow-400" />
                </div>
              </div>
              
              <span className="relative z-10 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-extrabold uppercase tracking-widest mb-5">
                <Sparkles size={10} /> Official Operator Billing
              </span>
              
              <h2 className="relative z-10 text-white text-4xl font-black font-display tracking-tight mb-4">MTN Airtime Recharge</h2>
              <p className="relative z-10 text-white/60 text-sm max-w-sm mx-auto mb-10 leading-[1.8]">
                Fund your wallet directly from your MTN line balance. Pick a plan below to activate via SMS or USSD.
              </p>
              
              {/* USSD Box */}
              <div className="relative z-10 w-full max-w-md rounded-2xl bg-[#0B0D14] border border-white/5 pt-6 pb-5 px-7 shadow-inner flex flex-col items-center gap-4">
                <p className="text-white/35 text-[10px] font-black uppercase tracking-[0.18em]">General Activation USSD</p>
                <div className="flex items-center gap-4">
                  <a 
                    href="tel:*920*20138#" 
                    className="text-3xl font-black text-yellow-400 tracking-wider font-display hover:text-yellow-300 transition-colors leading-none"
                  >
                    *920*20138#
                  </a>
                  <button 
                    onClick={() => handleCopy("*920*20138#", "USSD code")}
                    className="flex-shrink-0 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
                    title="Copy USSD Code"
                  >
                    {copiedText === "*920*20138#" ? <Check size={17} className="text-green-400" /> : <Copy size={17} />}
                  </button>
                </div>
                <p className="text-[11px] text-white/25 italic">Tap the code to dial on your mobile device</p>
              </div>
            </div>

            {/* Packages Section */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between px-1 mb-1">
                <h3 className="text-white/50 text-[11px] font-bold uppercase tracking-[0.15em]">Choose a Plan</h3>
                <span className="text-[10px] text-white/25 font-semibold tracking-wide">SMS to 20138</span>
              </div>
              
              <div className="flex flex-col gap-3">
                {/* Daily Pack */}
                <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#131720] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all duration-300 hover:border-white/12 hover:bg-[#181E2C] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center gap-5">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/35 group-hover:text-yellow-400 group-hover:border-yellow-500/25 group-hover:bg-yellow-500/5 transition-all duration-300">
                      <Send size={22} strokeWidth={1.8} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-[17px] leading-snug">Daily (5 Coins)</h4>
                      <p className="text-white/45 text-sm mt-1.5 font-medium">₦100 charged per day</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-auto">
                    <a 
                      href="sms:20138?body=SA1"
                      className="inline-flex items-center px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/15 transition-all text-sm font-semibold whitespace-nowrap"
                    >
                      Send SMS
                    </a>
                    <button 
                      onClick={() => handleCopy("SA1", "Daily package keyword")}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 hover:border-yellow-500/35 transition-all text-sm font-black font-mono cursor-pointer whitespace-nowrap min-w-[72px] justify-center"
                    >
                      {copiedText === "SA1" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                      SA1
                    </button>
                  </div>
                </div>

                {/* Weekly Pack */}
                <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#131720] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all duration-300 hover:border-white/12 hover:bg-[#181E2C] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center gap-5">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/35 group-hover:text-yellow-400 group-hover:border-yellow-500/25 group-hover:bg-yellow-500/5 transition-all duration-300">
                      <Send size={22} strokeWidth={1.8} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-[17px] leading-snug">Weekly (20 Coins)</h4>
                      <p className="text-white/45 text-sm mt-1.5 font-medium">₦200 charged per week</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-auto">
                    <a 
                      href="sms:20138?body=SA7"
                      className="inline-flex items-center px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/15 transition-all text-sm font-semibold whitespace-nowrap"
                    >
                      Send SMS
                    </a>
                    <button 
                      onClick={() => handleCopy("SA7", "Weekly package keyword")}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 hover:border-yellow-500/35 transition-all text-sm font-black font-mono cursor-pointer whitespace-nowrap min-w-[72px] justify-center"
                    >
                      {copiedText === "SA7" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                      SA7
                    </button>
                  </div>
                </div>

                {/* Monthly Pack (Best Value) */}
                <div className="group relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-[#17140A] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all duration-300 hover:border-yellow-500/35 hover:bg-[#1E1A0E] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(245,166,35,0.12)]">
                  {/* Best Value badge — top-left so it never overlaps the buttons */}
                  <div className="absolute top-0 left-0 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-[9px] font-black px-3 py-1.5 rounded-br-xl uppercase tracking-widest shadow">
                    Best Value
                  </div>
                  
                  <div className="flex items-center gap-5 mt-3 sm:mt-0">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 group-hover:border-yellow-500/40 group-hover:bg-yellow-500/15 transition-all duration-300">
                      <Sparkles size={22} strokeWidth={1.8} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-[17px] leading-snug group-hover:text-yellow-300 transition-colors">Monthly (50 Coins)</h4>
                      <p className="text-white/45 text-sm mt-1.5 font-medium">₦500 charged per month</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-auto">
                    <a 
                      href="sms:20138?body=SA30"
                      className="inline-flex items-center px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/15 transition-all text-sm font-semibold whitespace-nowrap"
                    >
                      Send SMS
                    </a>
                    <button 
                      onClick={() => handleCopy("SA30", "Monthly package keyword")}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-yellow-400 text-black hover:bg-yellow-300 transition-all text-sm font-black font-mono cursor-pointer shadow-lg shadow-yellow-500/15 whitespace-nowrap min-w-[80px] justify-center"
                    >
                      {copiedText === "SA30" ? <Check size={14} className="text-black" /> : <Copy size={14} />}
                      SA30
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard/wallet")}
              className="w-full text-center text-white/35 hover:text-white/70 transition-colors text-sm font-medium py-4 cursor-pointer"
            >
              ← Return to Wallet
            </button>
          </div>
        ) : (
          <>
            {/* Package Grid */}
        <div style={{ marginBottom: 48 }}>
          <h2 className="text-white/60 text-xs font-bold tracking-wider uppercase mb-6 px-1">Select Coin Package</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PACKAGES.map((pkg) => {
              const isSelected = Number(coin) === pkg.coins;
              return (
                <div
                  key={pkg.id}
                  onClick={() => selectPackage(pkg.coins)}
                  className={`relative flex flex-col items-center justify-between rounded-3xl p-6 border transition-all duration-300 select-none cursor-pointer ${
                    isSelected 
                      ? "bg-[#1DB954]/10 border-[#1DB954] shadow-[0_0_30px_rgba(29,185,84,0.25)] scale-[1.03]" 
                      : "bg-[#151922] border-white/10 hover:border-white/20 hover:bg-[#1C212E] hover:scale-[1.02]"
                  }`}
                  style={{ minHeight: 200 }}
                >
                  {pkg.badge && (
                    <div 
                      className={`absolute top-3 right-3 rounded-full text-[10px] font-black tracking-wider uppercase shadow-md flex items-center justify-center ${
                        pkg.badge === "Popular" 
                          ? "bg-amber-500 text-black shadow-amber-500/20" 
                          : "bg-cyan-500 text-black shadow-cyan-500/20"
                      }`}
                      style={{
                        fontFamily: "'DM Sans', 'Inter', sans-serif",
                        padding: "4px 12px",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {pkg.badge}
                    </div>
                  )}
                  
                  <div className="my-2">
                    <CoinStackIcon size={52} active={isSelected} />
                  </div>

                  <div className="text-center mt-4 mb-5">
                    <p className="text-white text-3xl font-bold tracking-normal" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
                      {pkg.coins}
                    </p>
                    <p className="text-[#A8A8A8] text-[10px] font-bold uppercase tracking-widest mt-1" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
                      Coins
                    </p>
                  </div>

                  <span 
                    className={`text-xs font-bold px-4 py-1.5 rounded-xl transition-colors ${
                      isSelected ? "bg-[#1DB954]/20 text-[#1DB954]" : "bg-white/5 text-white/70"
                    }`}
                    style={{
                      fontFamily: "'DM Sans', 'Inter', sans-serif",
                    }}
                  >
                    ₦{pkg.price.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Separator */}
        <div className="flex items-center gap-6" style={{ marginTop: 48, marginBottom: 48 }}>
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-[10px] font-extrabold text-white/30 tracking-widest uppercase">Or Enter Custom Amount</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        {/* Inputs */}
        <div className="bg-[#151922]/50 border border-white/5 rounded-3xl relative" style={{ padding: 32, marginBottom: 48 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <Input
              label="Coins"
              placeholder="Enter coins"
              value={coin}
              onChange={(e) => handleCoinChange(e.target.value)}
              error={!!coin && Number(coin) < 1 ? "Minimum 1 coin" : undefined}
            />

            {/* On desktop, show a horizontal double arrow or exchange rate. On mobile, show vertical */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex-col items-center justify-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1C2029] border border-white/10 text-white/50 shadow-lg">
                <ArrowDownUp size={18} className="rotate-90" />
              </div>
              <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-wider mt-1.5 bg-[#0F1219] px-2.5 py-0.5 rounded border border-white/5">
                1 Coin = ₦25
              </span>
            </div>

            <div className="flex md:hidden justify-center my-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1C2029] border border-white/10 text-white/40 shadow-md">
                <ArrowDownUp size={16} />
              </div>
            </div>

            <Input
              label="Amount (Naira)"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              error={!!amount && Number(amount) < 25 ? "Minimum ₦25" : undefined}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ marginTop: 48 }}>
          <Button
            text={`Fund Wallet with ₦${Number(amount || 0).toLocaleString()}`}
            onClick={handlePay}
            disabled={!isValid}
            isLoading={loading}
            style={{
              height: 56,
              borderRadius: 16,
              fontSize: 16,
              fontWeight: 800,
            }}
          />
          <button
            onClick={() => router.push("/dashboard/wallet")}
            className="w-full text-center text-[#A8A8A8] hover:text-white transition-colors mt-6 text-sm font-medium underline py-2 cursor-pointer"
            style={{ display: "block", marginTop: 24, marginBottom: 64 }}
          >
            Cancel and Return to Wallet
          </button>
        </div>
        </>
        )}
      </div>

      {/* Paystack iFrame Overlay */}
      {paymentUrl && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
          <div className="flex justify-between items-center px-4 py-3 bg-[#12151D]">
            <span className="text-white font-semibold">Complete Payment</span>
            <button onClick={handlePaymentClose} className="text-white/70 hover:text-white">
              <X size={24} />
            </button>
          </div>
          <iframe
            src={paymentUrl}
            className="flex-1 w-full"
            title="Paystack Payment"
          />
        </div>
      )}
    </div>
  );
}

export default function DepositPage() {
  return (
    <ToastProvider>
      <DepositForm />
    </ToastProvider>
  );
}
