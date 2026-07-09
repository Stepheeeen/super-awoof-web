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
          <div className="animate-fade-in w-full max-w-xl mx-auto flex flex-col gap-10">

            {/* Intro */}
            <div>
              <h2 className="text-white text-2xl font-bold mb-3">How to top up your coins</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                You are on an MTN line. There are two ways to add coins — via <strong className="text-white/75">USSD</strong> or <strong className="text-white/75">SMS</strong>. Pick whichever is easier for you.
              </p>
            </div>
            {/* Step 1: USSD */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-yellow-400 text-black text-xs font-black flex items-center justify-center flex-shrink-0">1</span>
                <h3 className="text-white font-bold text-base">Dial the USSD code</h3>
              </div>
              <div className="border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-5">
                  <p className="text-white/40 text-xs mb-4 uppercase tracking-widest font-semibold">General code (works for all plans)</p>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <a
                      href="tel:*920*20138#"
                      className="text-yellow-400 text-2xl font-black font-mono tracking-widest hover:text-yellow-300 transition-colors"
                    >
                      *920*20138#
                    </a>
                    <button
                      onClick={() => handleCopy("*920*20138#", "USSD code")}
                      className="text-xs font-semibold text-white/60 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap"
                    >
                      {copiedText === "*920*20138#" ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                </div>
                <div className="border-t border-white/[0.06] px-5 py-3 bg-white/[0.02]">
                  <p className="text-white/30 text-xs">On mobile, tap the code to open your phone dialer automatically.</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-white/30 text-xs font-semibold uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* Step 2: SMS Plans */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-yellow-400 text-black text-xs font-black flex items-center justify-center flex-shrink-0">2</span>
                <h3 className="text-white font-bold text-base">Send an SMS to <span className="text-yellow-400 font-mono">20138</span></h3>
              </div>
              <p className="text-white/50 text-sm leading-relaxed pl-10">
                Choose a plan below, then tap <strong className="text-white/75">"Send SMS"</strong> — your phone will open with the message pre-filled. Coins are credited once confirmed.
              </p>

              {/* Plan Table */}
              <div className="border border-white/10 rounded-2xl overflow-hidden">
                {/* Table header */}
                <div className="hidden sm:grid grid-cols-3 px-5 py-3 border-b border-white/[0.07] bg-white/[0.02]">
                  <span className="text-white/35 text-xs font-bold uppercase tracking-wider">Plan</span>
                  <span className="text-white/35 text-xs font-bold uppercase tracking-wider text-center">SMS Keyword</span>
                  <span className="text-white/35 text-xs font-bold uppercase tracking-wider text-right">Action</span>
                </div>

                {/* Daily */}
                <div className="flex flex-col sm:grid sm:grid-cols-3 sm:items-center px-5 py-5 border-b border-white/[0.05] gap-3 sm:gap-0 hover:bg-white/[0.02] transition-colors">
                  <div>
                    <p className="text-white font-semibold text-sm">Daily</p>
                    <p className="text-white/40 text-xs mt-0.5">5 coins · ₦100/day</p>
                  </div>
                  <div className="sm:flex sm:justify-center">
                    <span className="font-mono font-black text-yellow-400 text-lg tracking-widest">SA1</span>
                  </div>
                  <div className="flex gap-2 sm:justify-end flex-wrap">
                    <a href="sms:20138?body=SA1" className="flex-1 sm:flex-none text-center text-xs font-semibold text-white/70 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg transition-all whitespace-nowrap">
                      Send SMS
                    </a>
                    <button onClick={() => handleCopy("SA1", "SA1")} className="flex-1 sm:flex-none text-center text-xs font-semibold text-white/50 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap">
                      {copiedText === "SA1" ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Weekly */}
                <div className="flex flex-col sm:grid sm:grid-cols-3 sm:items-center px-5 py-5 border-b border-white/[0.05] gap-3 sm:gap-0 hover:bg-white/[0.02] transition-colors">
                  <div>
                    <p className="text-white font-semibold text-sm">Weekly</p>
                    <p className="text-white/40 text-xs mt-0.5">20 coins · ₦200/week</p>
                  </div>
                  <div className="sm:flex sm:justify-center">
                    <span className="font-mono font-black text-yellow-400 text-lg tracking-widest">SA7</span>
                  </div>
                  <div className="flex gap-2 sm:justify-end flex-wrap">
                    <a href="sms:20138?body=SA7" className="flex-1 sm:flex-none text-center text-xs font-semibold text-white/70 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg transition-all whitespace-nowrap">
                      Send SMS
                    </a>
                    <button onClick={() => handleCopy("SA7", "SA7")} className="flex-1 sm:flex-none text-center text-xs font-semibold text-white/50 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap">
                      {copiedText === "SA7" ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Monthly */}
                <div className="flex flex-col sm:grid sm:grid-cols-3 sm:items-center px-5 py-5 gap-3 sm:gap-0 bg-yellow-400/[0.03] hover:bg-yellow-400/[0.05] transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold text-sm">Monthly</p>
                      <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400 border border-yellow-400/30 px-1.5 py-0.5 rounded">Best</span>
                    </div>
                    <p className="text-white/40 text-xs mt-0.5">50 coins · ₦500/month</p>
                  </div>
                  <div className="sm:flex sm:justify-center">
                    <span className="font-mono font-black text-yellow-400 text-lg tracking-widest">SA30</span>
                  </div>
                  <div className="flex gap-2 sm:justify-end flex-wrap">
                    <a href="sms:20138?body=SA30" className="flex-1 sm:flex-none text-center text-xs font-semibold text-white/70 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg transition-all whitespace-nowrap">
                      Send SMS
                    </a>
                    <button onClick={() => handleCopy("SA30", "SA30")} className="flex-1 sm:flex-none text-center text-xs font-black bg-yellow-400 text-black hover:bg-yellow-300 px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap">
                      {copiedText === "SA30" ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-white/[0.06] bg-white/[0.015]">
                  <p className="text-white/30 text-xs leading-relaxed">Coins are credited automatically once MTN confirms your payment. This usually takes under 5 minutes.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard/wallet")}
              className="text-sm text-white/35 hover:text-white/60 transition-colors py-2 cursor-pointer text-left"
            >
              ← Back to Wallet
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
