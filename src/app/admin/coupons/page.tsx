"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/utils";
import {
  Tag,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Percent,
  CalendarDays,
  ShoppingBag,
} from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  percentOff: number;
  minOrderValue: string;
  maxDiscount: string | null;
  expiresAt: string;
  active: boolean;
  createdAt: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [code, setCode] = useState("");
  const [percentOff, setPercentOff] = useState("15");
  const [minOrderValue, setMinOrderValue] = useState("0");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [expiresAt, setExpiresAt] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().slice(0, 16);
  });

  const showFeedback = (msg: string, type: "success" | "error") => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch {
      showFeedback("Failed to load coupons.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.toUpperCase(),
          percentOff: Number(percentOff),
          minOrderValue: Number(minOrderValue),
          maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
          expiresAt: new Date(expiresAt).toISOString(),
          active: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback(`Coupon "${code.toUpperCase()}" created.`, "success");
        setShowModal(false);
        fetchCoupons();
        setCode("");
        setPercentOff("15");
        setMinOrderValue("0");
        setMaxDiscount("");
      } else {
        showFeedback(data.error || "Failed to create coupon.", "error");
      }
    } catch {
      showFeedback("Connection error.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, active: !active } : c))
        );
        showFeedback(
          `Coupon ${!active ? "activated" : "deactivated"}.`,
          "success"
        );
      }
    } catch {
      showFeedback("Failed to toggle coupon.", "error");
    }
  };

  const handleDelete = async (id: string, couponCode: string) => {
    if (
      !confirm(
        `Permanently delete coupon "${couponCode}"? This cannot be undone.`
      )
    )
      return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
        showFeedback(`Coupon "${couponCode}" deleted.`, "success");
      }
    } catch {
      showFeedback("Failed to delete coupon.", "error");
    }
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 border border-gold/30 p-6 shadow-xs">
        <div>
          <h1 className="font-serif text-2xl text-oxblood font-semibold flex items-center gap-2">
            <Tag className="w-5 h-5 text-gold-dark" />
            Promotional Coupon Engine
          </h1>
          <p className="text-xs text-noir/60 mt-1">
            Create and manage exclusive discount codes for Zaria Atelier
            patrons.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCoupons}
            className="gap-1.5 text-xs text-oxblood border-gold/30"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
          <Button
            variant="oxblood"
            size="sm"
            onClick={() => setShowModal(true)}
            className="gap-1.5 text-xs tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            New Code
          </Button>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`p-3.5 text-xs flex items-center gap-2 border ${
            feedback.type === "success"
              ? "bg-emerald/10 border-emerald/30 text-emerald"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Coupons Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs uppercase tracking-widest text-noir/50">
          Loading coupon registry...
        </div>
      ) : coupons.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-gold/30 bg-white/60">
          <Tag className="w-8 h-8 text-gold/40 mx-auto mb-3" />
          <p className="font-serif text-lg text-noir/60">No coupon codes yet</p>
          <p className="text-xs text-noir/40 mt-1">
            Create your first promotional code for the atelier.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {coupons.map((coupon) => {
            const expired = isExpired(coupon.expiresAt);
            const isInactive = !coupon.active || expired;

            return (
              <div
                key={coupon.id}
                className={`bg-white/90 border p-5 shadow-xs transition-all ${
                  isInactive ? "opacity-60 border-gray-300" : "border-gold/30 hover:border-gold"
                }`}
              >
                {/* Code Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-lg font-bold text-oxblood tracking-widest">
                        {coupon.code}
                      </span>
                      <span
                        className={`text-[9px] uppercase tracking-widest px-2 py-0.5 border font-semibold ${
                          expired
                            ? "bg-red-50 text-red-600 border-red-200"
                            : coupon.active
                            ? "bg-emerald/10 text-emerald border-emerald/30"
                            : "bg-gray-100 text-gray-500 border-gray-300"
                        }`}
                      >
                        {expired ? "Expired" : coupon.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-[10px] text-noir/40 mt-0.5 font-mono">
                      Created {formatDate(coupon.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggle(coupon.id, coupon.active)}
                      disabled={expired}
                      className="w-8 h-8 flex items-center justify-center text-noir/40 hover:text-oxblood transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title={coupon.active ? "Deactivate" : "Activate"}
                    >
                      {coupon.active ? (
                        <ToggleRight className="w-5 h-5 text-emerald" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(coupon.id, coupon.code)}
                      className="w-8 h-8 flex items-center justify-center text-noir/40 hover:text-red-600 transition-colors"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-noir/70">
                    <Percent className="w-3.5 h-3.5 text-gold shrink-0" />
                    <span>
                      <strong>{coupon.percentOff}% off</strong>
                      {coupon.maxDiscount && (
                        <span className="text-noir/50">
                          {" "}(max {formatPrice(coupon.maxDiscount)})
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-noir/70">
                    <ShoppingBag className="w-3.5 h-3.5 text-gold shrink-0" />
                    <span>
                      Min order:{" "}
                      <strong>
                        {Number(coupon.minOrderValue) === 0
                          ? "None"
                          : formatPrice(coupon.minOrderValue)}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-noir/70">
                    <CalendarDays className="w-3.5 h-3.5 text-gold shrink-0" />
                    <span>
                      Expires:{" "}
                      <strong className={expired ? "text-red-600" : ""}>
                        {formatDate(coupon.expiresAt)}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-noir/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ivory border border-gold/40 p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gold/20 pb-4">
              <h2 className="font-serif text-2xl text-oxblood font-semibold">
                Commission New Code
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-noir/60 hover:text-oxblood"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase tracking-wider font-semibold mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ROYAL15"
                  className="w-full h-10 px-3 bg-white border border-gold/30 outline-none focus:border-oxblood font-mono uppercase tracking-widest"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-semibold mb-1">
                    Discount % *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={percentOff}
                    onChange={(e) => setPercentOff(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-gold/30 outline-none focus:border-oxblood"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold mb-1">
                    Min Order (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-gold/30 outline-none focus:border-oxblood"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold mb-1">
                    Max Discount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    placeholder="No cap"
                    className="w-full h-10 px-3 bg-white border border-gold/30 outline-none focus:border-oxblood"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold mb-1">
                    Expires At *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-gold/30 outline-none focus:border-oxblood text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gold/20">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="oxblood"
                  size="sm"
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Create Coupon"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
