"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { ToastProvider, useToast } from "@/context/ToastContext";
import { baseUrl, getAccessToken, getUser } from "@/lib/constants";
import { ArrowDownUp, X, ChevronLeft, Smartphone } from "lucide-react";

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

        {user?.loginMode === "phone" ? (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="card bg-[#151922] border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-6 border border-yellow-500/20">
                <Smartphone size={32} className="text-yellow-500" />
              </div>
              <h2 className="text-white text-2xl font-bold font-display mb-3">MTN Subscribers</h2>
              <p className="text-white/70 max-w-md mx-auto mb-8">
                As an MTN subscriber, you can easily top up your coins by dialing our USSD code or sending an SMS.
              </p>
              
              <div className="bg-[#0F1219] rounded-2xl p-6 w-full max-w-md border border-white/5 mb-6">
                <p className="text-white/50 text-xs font-bold tracking-wider uppercase mb-2">General USSD Code</p>
                <div className="text-2xl font-black text-yellow-500 tracking-wider font-display">
                  *920*20138#
                </div>
              </div>

              <div className="w-full max-w-lg mt-4 grid gap-4">
                <h3 className="text-white/60 text-sm font-bold uppercase tracking-widest text-left mb-2">SMS Packages to 20138</h3>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-white font-bold text-lg">Daily (5 Coins)</p>
                    <p className="text-white/50 text-sm mt-1">₦100 / day</p>
                  </div>
                  <div className="bg-[#1C2029] px-4 py-2 rounded-lg border border-white/10">
                    <span className="text-white/60 text-xs mr-2">Send</span>
                    <strong className="text-white text-lg font-mono">SA1</strong>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-white font-bold text-lg">Weekly (20 Coins)</p>
                    <p className="text-white/50 text-sm mt-1">₦200 / week</p>
                  </div>
                  <div className="bg-[#1C2029] px-4 py-2 rounded-lg border border-white/10">
                    <span className="text-white/60 text-xs mr-2">Send</span>
                    <strong className="text-white text-lg font-mono">SA7</strong>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#1DB954] text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10">BEST VALUE</div>
                  <div className="text-left relative z-20">
                    <p className="text-white font-bold text-lg">Monthly (50 Coins)</p>
                    <p className="text-white/50 text-sm mt-1">₦500 / month</p>
                  </div>
                  <div className="bg-[#1DB954]/10 px-4 py-2 rounded-lg border border-[#1DB954]/20 relative z-20">
                    <span className="text-[#1DB954]/70 text-xs mr-2">Send</span>
                    <strong className="text-[#1DB954] text-lg font-mono">SA30</strong>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => router.push("/dashboard/wallet")}
              className="w-full text-center text-[#A8A8A8] hover:text-white transition-colors mt-4 text-sm font-medium underline py-2 cursor-pointer"
            >
              Return to Wallet
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
