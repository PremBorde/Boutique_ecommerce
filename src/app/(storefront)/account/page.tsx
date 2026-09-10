"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/lib/utils";
import { User, Package, ShieldCheck, LogOut, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

function AccountContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Orders state for logged-in user
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const errorParam = searchParams.get("error");

  useEffect(() => {
    if (errorParam === "AdminLoginRequired") {
      setErrorMsg("Please log in with an administrator account to access the Atelier console.");
    }
  }, [errorParam]);

  useEffect(() => {
    if (session?.user) {
      fetchUserOrders();
    }
  }, [session]);

  const fetchUserOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await fetch("/api/user/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to fetch user orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create account.");
      } else {
        setSuccessMsg("Account created with distinction! Signing you in...");
        // Auto-login after registration
        await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        router.refresh();
      }
    } catch (err) {
      setErrorMsg("Failed to connect to atelier server.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCustomer = () => {
    setEmail("ananya@luxury.com");
    setPassword("Customer@1234");
    setActiveTab("login");
  };

  const fillDemoAdmin = () => {
    setEmail("admin@zaria.com");
    setPassword("Admin@1234");
    setActiveTab("login");
  };

  if (status === "loading") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-serif text-sm uppercase tracking-[0.25em] text-oxblood">Opening Atelier Vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-regal-texture py-16 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gold/20">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.25em] text-oxblood dark:text-gold-light hover:text-gold transition-colors font-medium flex items-center gap-1"
          >
            ← Return to Atelier
          </Link>
          <p className="text-[11px] uppercase tracking-[0.3em] text-noir/40 dark:text-ivory/40">Client Privileges</p>
        </div>

        {session?.user ? (
          /* Logged In Dashboard */
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-ivory dark:bg-[#161214] border border-gold/30 dark:border-gold/20 p-4 sm:p-8 shadow-xs transition-colors duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-gold/15">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-oxblood text-gold-light flex items-center justify-center font-serif text-lg sm:text-xl border border-gold shrink-0">
                    {session.user.name?.[0] || "Z"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-serif text-oxblood dark:text-gold-foil font-normal truncate">
                        {session.user.name}
                      </h1>
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 border border-gold/40 text-gold-dark dark:text-gold-light bg-gold/10 font-medium rounded-xs">
                        {(session.user as any).role || "CUSTOMER"}
                      </span>
                    </div>
                    <p className="text-xs text-noir/60 dark:text-ivory/60 tracking-wider mt-0.5 truncate">
                      {session.user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {(session.user as any).role === "ADMIN" && (
                    <Link href="/admin">
                      <Button variant="gold" size="sm" className="gap-1.5 text-xs">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Admin Console
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: "/account" })}
                    className="gap-1.5 text-xs text-oxblood border-oxblood/30 hover:bg-oxblood/10"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </Button>
                </div>
              </div>

              {/* Order History Section */}
              <div className="mt-6 sm:mt-8">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base sm:text-lg font-serif font-normal text-noir dark:text-ivory flex items-center gap-2">
                    <Package className="w-4 h-4 text-gold shrink-0" />
                    Bespoke Order History
                  </h2>
                  <span className="text-[11px] sm:text-xs text-noir/50 dark:text-ivory/50">
                    {orders.length} {orders.length === 1 ? "order" : "orders"} on record
                  </span>
                </div>

                {ordersLoading ? (
                  <div className="py-10 text-center text-xs uppercase tracking-widest text-noir/50">
                    Retrieving orders from archive...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-10 sm:py-12 text-center border border-dashed border-gold/30 p-5 sm:p-8">
                    <p className="font-serif text-base sm:text-lg text-noir/70 dark:text-ivory/70 font-normal mb-1.5">
                      No orders placed yet
                    </p>
                    <p className="text-xs text-noir/50 dark:text-ivory/50 max-w-sm mx-auto mb-5">
                      Explore our handcrafted collections and acquire your first heirloom piece.
                    </p>
                    <Link href="/shop">
                      <Button variant="oxblood" size="sm" className="text-xs px-5">
                        Explore Catalogue
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gold/25 p-5 bg-white/40 hover:bg-white/80 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gold/15 text-xs">
                          <div>
                            <span className="text-noir/50 tracking-wider">Order No:</span>{" "}
                            <span className="font-medium text-oxblood tracking-wide">{order.orderNumber}</span>
                            <span className="text-noir/30 mx-2">·</span>
                            <span className="text-noir/60">{formatDate(order.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-[10px] uppercase tracking-[0.2em] px-2.5 py-0.5 font-medium border ${
                                order.status === "DELIVERED"
                                  ? "bg-emerald/10 text-emerald border-emerald/30"
                                  : order.status === "CANCELLED"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-gold/10 text-gold-dark border-gold/30"
                              }`}
                            >
                              {order.status}
                            </span>
                            <Link href={`/orders/${order.id}`}>
                              <span className="text-[11px] uppercase tracking-wider text-oxblood hover:text-gold flex items-center gap-1 font-medium">
                                View Timeline →
                              </span>
                            </Link>
                          </div>
                        </div>

                        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="text-noir/70">
                            {order.items.map((it: any, idx: number) => (
                              <span key={it.id}>
                                {it.title} ({it.color}, {it.size}) × {it.qty}
                                {idx < order.items.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </div>
                          <div className="font-serif text-sm text-oxblood font-semibold">
                            {formatPrice(order.total)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Authentication Forms */
          <div className="bg-ivory dark:bg-[#161214] border border-gold/30 dark:border-gold/20 p-8 md:p-12 shadow-sm max-w-lg mx-auto transition-colors duration-300">
            <div className="text-center mb-8">
              <p className="text-[10px] uppercase tracking-[0.35em] text-gold-antique dark:text-gold-light mb-2 font-semibold">
                Client Sanctuary
              </p>
              <h1 className="text-3xl font-serif text-oxblood dark:text-gold-foil">The Atelier Account</h1>
              <p className="text-xs text-noir/60 dark:text-ivory/60 mt-2">
                Access your bespoke orders, curated wishlist, and private consultations.
              </p>
            </div>

            {/* Quick Demo Credentials Bar */}
            <div className="mb-6 p-3 bg-gold/10 border border-gold/30 rounded-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold-dark dark:text-gold-light font-semibold text-center mb-2">
                Instant Evaluator Logins
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={fillDemoCustomer}
                  className="flex-1 text-[11px] py-1.5 px-2 bg-white/70 dark:bg-[#20181B] hover:bg-white text-oxblood dark:text-gold-light border border-gold/30 tracking-wider transition-colors"
                >
                  Customer (Ananya)
                </button>
                <button
                  type="button"
                  onClick={fillDemoAdmin}
                  className="flex-1 text-[11px] py-1.5 px-2 bg-oxblood text-gold-light hover:bg-oxblood-light tracking-wider transition-colors"
                >
                  Admin (Prem Borde)
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gold/25 mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`flex-1 pb-3 text-xs uppercase tracking-[0.2em] font-medium transition-all ${
                  activeTab === "login"
                    ? "border-b-2 border-oxblood text-oxblood font-semibold"
                    : "text-noir/40 hover:text-noir/70"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("register");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`flex-1 pb-3 text-xs uppercase tracking-[0.2em] font-medium transition-all ${
                  activeTab === "register"
                    ? "border-b-2 border-oxblood text-oxblood font-semibold"
                    : "text-noir/40 hover:text-noir/70"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Alerts */}
            {errorMsg && (
              <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {activeTab === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] text-noir/70 mb-1.5 font-medium">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@luxury.com"
                    className="w-full h-11 px-3.5 text-xs bg-white/70 border border-gold/30 focus:border-oxblood focus:ring-1 focus:ring-oxblood outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] text-noir/70 mb-1.5 font-medium">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 px-3.5 text-xs bg-white/70 border border-gold/30 focus:border-oxblood focus:ring-1 focus:ring-oxblood outline-none transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  variant="oxblood"
                  className="w-full mt-6 h-12 text-xs tracking-[0.25em]"
                >
                  {loading ? "Verifying Credentials..." : "Enter Atelier"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] text-noir/70 mb-1.5 font-medium">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ananya Singhania"
                    className="w-full h-11 px-3.5 text-xs bg-white/70 border border-gold/30 focus:border-oxblood focus:ring-1 focus:ring-oxblood outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] text-noir/70 mb-1.5 font-medium">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@luxury.com"
                    className="w-full h-11 px-3.5 text-xs bg-white/70 border border-gold/30 focus:border-oxblood focus:ring-1 focus:ring-oxblood outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] text-noir/70 mb-1.5 font-medium">
                    Password (min. 6 characters)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 px-3.5 text-xs bg-white/70 border border-gold/30 focus:border-oxblood focus:ring-1 focus:ring-oxblood outline-none transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  variant="oxblood"
                  className="w-full mt-6 h-12 text-xs tracking-[0.25em]"
                >
                  {loading ? "Inscribing Registry..." : "Register Atelier Profile"}
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-serif text-sm uppercase tracking-[0.25em] text-oxblood">
            Opening Atelier Sanctuary...
          </p>
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
