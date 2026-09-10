"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Layers,
  Plus,
  Save,
  CheckCircle2,
  AlertCircle,
  Archive,
  RefreshCw,
  Edit2,
  X,
} from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [unmetSearches, setUnmetSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // New product modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newStory, setNewStory] = useState("");
  const [newFabric, setNewFabric] = useState("");
  const [newPrice, setNewPrice] = useState("18000");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newColor, setNewColor] = useState("Crimson Wine");
  const [newColorHex, setNewColorHex] = useState("#4A0E17");
  const [newSize, setNewSize] = useState("M");
  const [newSku, setNewSku] = useState("ZR-BESPOKE-01");
  const [newStock, setNewStock] = useState("5");
  const [submitting, setSubmitting] = useState(false);

  // Local inventory input buffer
  const [stockInputs, setStockInputs] = useState<Record<string, number>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setCategories(data.categories || []);
        if (data.categories?.length > 0 && !newCategoryId) {
          setNewCategoryId(data.categories[0].id);
        }

        // Initialize stock inputs
        const initialStock: Record<string, number> = {};
        (data.products || []).forEach((p: any) => {
          (p.variants || []).forEach((v: any) => {
            initialStock[v.id] = v.inventory?.quantity ?? 0;
          });
        });
        setStockInputs(initialStock);
      }

      // Load Section 8.5 unmet search insights
      const unmetRes = await fetch("/api/admin/unmet-searches");
      if (unmetRes.ok) {
        const unmetData = await unmetRes.json();
        setUnmetSearches(unmetData.requests || []);
      }
    } catch (err) {
      console.error("Failed to load admin products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (variantId: string) => {
    const qty = stockInputs[variantId];
    if (qty === undefined || qty < 0) return;

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity: qty }),
      });

      if (res.ok) {
        setFeedback({ msg: "Inventory stock updated successfully.", type: "success" });
        setTimeout(() => setFeedback(null), 3000);
      } else {
        const err = await res.json();
        setFeedback({ msg: err.error || "Failed to update stock.", type: "error" });
      }
    } catch (err) {
      setFeedback({ msg: "Connection error.", type: "error" });
    }
  };

  const handleToggleActive = async (productId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, active: !currentActive } : p
          )
        );
        setFeedback({
          msg: `Product ${!currentActive ? "activated" : "archived"} in catalogue.`,
          type: "success",
        });
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      setFeedback({ msg: "Failed to update product state.", type: "error" });
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: newName,
        description: newDesc,
        story: newStory || undefined,
        fabric: newFabric || undefined,
        basePrice: Number(newPrice),
        categoryId: newCategoryId,
        imageUrl: newImageUrl || "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b",
        variants: [
          {
            color: newColor,
            colorHex: newColorHex,
            size: newSize,
            sku: newSku,
            stock: Number(newStock),
          },
        ],
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback({ msg: "Heirloom product added to catalogue.", type: "success" });
        setShowAddModal(false);
        loadData();
      } else {
        setFeedback({ msg: data.error || "Failed to create product.", type: "error" });
      }
    } catch (err: any) {
      setFeedback({ msg: err.message || "Failed to create product.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-[#161214] border border-gold/30 dark:border-gold/20 p-6 shadow-xs transition-colors">
        <div>
          <h1 className="font-serif text-2xl text-oxblood dark:text-gold-foil font-semibold flex items-center gap-2">
            <Layers className="w-5 h-5 text-gold-dark dark:text-gold" />
            Atelier Products & Variant Inventory
          </h1>
          <p className="text-xs text-noir/60 dark:text-ivory/60 mt-1">
            Manage live pricing, active states, and real-time inventory quantities per SKU.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="gap-1.5 text-xs text-oxblood dark:text-gold-light border-gold/30 dark:border-gold/30 hover:bg-gold/10 dark:hover:bg-gold/10"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
          <Button
            variant="oxblood"
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="gap-1.5 text-xs tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Garment Piece
          </Button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 text-xs flex items-center gap-2 border ${
            feedback.type === "success"
              ? "bg-emerald/10 border-emerald/30 text-emerald"
              : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300"
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

      {/* Products Table */}
      {loading ? (
        <div className="py-20 text-center text-xs uppercase tracking-widest text-noir/50 dark:text-ivory/50">
          Loading atelier database...
        </div>
      ) : (
        <div className="space-y-6">
          {products.map((product) => (
            <div
              key={product.id}
              className={`bg-white/90 dark:bg-[#161214] border transition-all p-6 shadow-xs ${
                product.active ? "border-gold/30 dark:border-gold/20" : "border-gray-300 dark:border-white/10 opacity-60 bg-gray-50 dark:bg-white/5"
              }`}
            >
              {/* Product Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gold/15 dark:border-gold/10">
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-18 bg-noir/5 dark:bg-white/5 border border-gold/20 overflow-hidden shrink-0">
                    <Image
                      src={
                        product.images?.[0]?.url ||
                        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b"
                      }
                      alt={product.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-lg text-oxblood dark:text-gold-foil font-semibold">
                        {product.name}
                      </h3>
                      <span
                        className={`text-[9px] uppercase tracking-widest px-2 py-0.5 border font-medium ${
                          product.active
                            ? "bg-emerald/10 text-emerald border-emerald/30"
                            : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-ivory/60 border-gray-300 dark:border-white/10"
                        }`}
                      >
                        {product.active ? "Active" : "Archived"}
                      </span>
                    </div>
                    <p className="text-xs text-noir/60 dark:text-ivory/60 mt-0.5">
                      Category: <span className="font-medium text-noir dark:text-ivory">{product.category?.name}</span> · Base
                      Price: <span className="font-semibold text-oxblood dark:text-gold-light">{formatPrice(product.basePrice)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(product.id, product.active)}
                    className="text-[10px] uppercase tracking-wider text-noir dark:text-ivory border-gold/30 dark:border-gold/20 hover:bg-gold/10"
                  >
                    <Archive className="w-3.5 h-3.5 mr-1" />
                    {product.active ? "Archive Piece" : "Activate"}
                  </Button>
                </div>
              </div>

              {/* Variants & Stock Matrix */}
              <div className="mt-4">
                <p className="text-[10px] uppercase tracking-widest text-noir/50 dark:text-ivory/50 font-semibold mb-2">
                  Variant SKU & Stock Quantities:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {product.variants.map((v: any) => (
                    <div
                      key={v.id}
                      className="p-3 bg-ivory/60 dark:bg-[#1C1719] border border-gold/20 dark:border-gold/15 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            style={{ backgroundColor: v.colorHex }}
                            className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                          />
                          <span className="font-medium text-noir dark:text-ivory truncate max-w-[120px]">
                            {v.color} ({v.size})
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-noir/40 dark:text-ivory/40 mt-0.5">{v.sku}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          value={stockInputs[v.id] ?? 0}
                          onChange={(e) =>
                            setStockInputs({
                              ...stockInputs,
                              [v.id]: Math.max(0, parseInt(e.target.value) || 0),
                            })
                          }
                          className="w-14 h-8 px-1.5 text-center text-xs font-semibold bg-white dark:bg-[#120F10] text-noir dark:text-ivory border border-gold/40 dark:border-gold/30 focus:border-oxblood dark:focus:border-gold outline-none"
                        />
                        <button
                          onClick={() => handleUpdateStock(v.id)}
                          title="Save Stock"
                          className="w-8 h-8 flex items-center justify-center bg-oxblood text-gold-light hover:bg-oxblood-light transition-colors"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section 8.5: Unmet Search Inquiries (AI Demand Intelligence) */}
      <div className="mt-12 bg-white dark:bg-[#161214] border border-gold/30 dark:border-gold/20 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gold/20 pb-3">
          <div>
            <h2 className="font-serif text-lg text-oxblood dark:text-gold-foil font-semibold">
              Requested But Not in Stock
            </h2>
            <p className="text-xs text-noir/60 dark:text-ivory/60">
              Patron queries where Gemini found 0 matching pieces — captures genuine unmet customer demand.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-gold/10 text-gold-dark border border-gold/30">
            {unmetSearches.length} logged
          </span>
        </div>

        {unmetSearches.length === 0 ? (
          <p className="text-xs text-noir/50 dark:text-ivory/50 italic py-4">
            No unmet search requests recorded. The assistant is currently satisfying all customer discovery queries.
          </p>
        ) : (
          <div className="divide-y divide-gold/15 max-h-60 overflow-y-auto text-xs">
            {unmetSearches.map((req) => (
              <div key={req.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-oxblood dark:text-ivory">
                    &ldquo;{req.query}&rdquo;
                  </span>
                  {req.filtersUsed && (
                    <span className="text-[10px] text-noir/50 dark:text-ivory/50 ml-2 font-mono">
                      {JSON.stringify(req.filtersUsed)}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-noir/40 dark:text-ivory/40 shrink-0 ml-4">
                  {new Date(req.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-noir/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ivory dark:bg-[#161214] border border-gold/40 dark:border-gold/30 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 text-noir dark:text-ivory transition-colors">
            <div className="flex items-center justify-between border-b border-gold/20 pb-4">
              <h2 className="font-serif text-2xl text-oxblood dark:text-gold-foil font-semibold">
                Commission New Garment Piece
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-noir/60 dark:text-ivory/60 hover:text-oxblood dark:hover:text-gold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider font-semibold mb-1 text-noir/80 dark:text-ivory/80">
                    Garment Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. The Jodhpur Silk Achkan"
                    className="w-full h-10 px-3 bg-white dark:bg-[#120F10] text-noir dark:text-ivory border border-gold/30 dark:border-gold/30 outline-none focus:border-oxblood dark:focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold mb-1 text-noir/80 dark:text-ivory/80">
                    Category *
                  </label>
                  <select
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(e.target.value)}
                    className="w-full h-10 px-3 bg-white dark:bg-[#120F10] text-noir dark:text-ivory border border-gold/30 dark:border-gold/30 outline-none focus:border-oxblood dark:focus:border-gold cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-white dark:bg-[#161214] text-noir dark:text-ivory">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold mb-1 text-noir/80 dark:text-ivory/80">
                    Base Investment Price (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full h-10 px-3 bg-white dark:bg-[#120F10] text-noir dark:text-ivory border border-gold/30 dark:border-gold/30 outline-none focus:border-oxblood dark:focus:border-gold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider font-semibold mb-1 text-noir/80 dark:text-ivory/80">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Detailed craftsmanship narrative..."
                    className="w-full p-3 bg-white dark:bg-[#120F10] text-noir dark:text-ivory border border-gold/30 dark:border-gold/30 outline-none focus:border-oxblood dark:focus:border-gold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider font-semibold mb-1 text-noir/80 dark:text-ivory/80">
                    Fabric Composition
                  </label>
                  <input
                    type="text"
                    value={newFabric}
                    onChange={(e) => setNewFabric(e.target.value)}
                    placeholder="e.g. Pure Mulberry Silk with Tested Zari"
                    className="w-full h-10 px-3 bg-white dark:bg-[#120F10] text-noir dark:text-ivory border border-gold/30 dark:border-gold/30 outline-none focus:border-oxblood dark:focus:border-gold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider font-semibold mb-1 text-noir/80 dark:text-ivory/80">
                    Editorial Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full h-10 px-3 bg-white dark:bg-[#120F10] text-noir dark:text-ivory border border-gold/30 dark:border-gold/30 outline-none focus:border-oxblood dark:focus:border-gold"
                  />
                </div>

                {/* Primary Variant Details */}
                <div className="sm:col-span-2 pt-2 border-t border-gold/15 dark:border-gold/10">
                  <p className="font-semibold uppercase tracking-wider text-oxblood dark:text-gold-light mb-2">
                    Initial Variant Specification
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider mb-1 text-noir/70 dark:text-ivory/70">Shade</label>
                      <input
                        type="text"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        className="w-full h-9 px-2 bg-white dark:bg-[#120F10] text-noir dark:text-ivory border border-gold/30 dark:border-gold/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider mb-1 text-noir/70 dark:text-ivory/70">Hex Code</label>
                      <input
                        type="text"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="w-full h-9 px-2 bg-white dark:bg-[#120F10] text-noir dark:text-ivory border border-gold/30 dark:border-gold/30 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider mb-1 text-noir/70 dark:text-ivory/70">Size</label>
                      <input
                        type="text"
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                        className="w-full h-9 px-2 bg-white dark:bg-[#120F10] text-noir dark:text-ivory border border-gold/30 dark:border-gold/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider mb-1 text-noir/70 dark:text-ivory/70">Stock Qty</label>
                      <input
                        type="number"
                        min="0"
                        value={newStock}
                        onChange={(e) => setNewStock(e.target.value)}
                        className="w-full h-9 px-2 bg-white dark:bg-[#120F10] text-noir dark:text-ivory border border-gold/30 dark:border-gold/30"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gold/20 dark:border-gold/15">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="text-noir dark:text-ivory border-gold/30 dark:border-gold/30 hover:bg-gold/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="oxblood"
                  size="sm"
                  disabled={submitting}
                >
                  {submitting ? "Inscribing Piece..." : "Create Garment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
