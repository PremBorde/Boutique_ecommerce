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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 border border-gold/30 p-6 shadow-xs">
        <div>
          <h1 className="font-serif text-2xl text-oxblood font-semibold flex items-center gap-2">
            <Layers className="w-5 h-5 text-gold-dark" />
            Atelier Products & Variant Inventory
          </h1>
          <p className="text-xs text-noir/60 mt-1">
            Manage live pricing, active states, and real-time inventory quantities per SKU.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="gap-1.5 text-xs text-oxblood border-gold/30"
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

      {/* Products Table */}
      {loading ? (
        <div className="py-20 text-center text-xs uppercase tracking-widest text-noir/50">
          Loading atelier database...
        </div>
      ) : (
        <div className="space-y-6">
          {products.map((product) => (
            <div
              key={product.id}
              className={`bg-white/90 border transition-all p-6 shadow-xs ${
                product.active ? "border-gold/30" : "border-gray-300 opacity-60 bg-gray-50"
              }`}
            >
              {/* Product Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gold/15">
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-18 bg-noir/5 border border-gold/20 overflow-hidden shrink-0">
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
                      <h3 className="font-serif text-lg text-oxblood font-semibold">
                        {product.name}
                      </h3>
                      <span
                        className={`text-[9px] uppercase tracking-widest px-2 py-0.5 border font-medium ${
                          product.active
                            ? "bg-emerald/10 text-emerald border-emerald/30"
                            : "bg-gray-100 text-gray-600 border-gray-300"
                        }`}
                      >
                        {product.active ? "Active" : "Archived"}
                      </span>
                    </div>
                    <p className="text-xs text-noir/60 mt-0.5">
                      Category: <span className="font-medium text-noir">{product.category?.name}</span> · Base
                      Price: <span className="font-semibold text-oxblood">{formatPrice(product.basePrice)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(product.id, product.active)}
                    className="text-[10px] uppercase tracking-wider"
                  >
                    <Archive className="w-3.5 h-3.5 mr-1" />
                    {product.active ? "Archive Piece" : "Activate"}
                  </Button>
                </div>
              </div>

              {/* Variants & Stock Matrix */}
              <div className="mt-4">
                <p className="text-[10px] uppercase tracking-widest text-noir/50 font-semibold mb-2">
                  Variant SKU & Stock Quantities:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {product.variants.map((v: any) => (
                    <div
                      key={v.id}
                      className="p-3 bg-ivory/60 border border-gold/20 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            style={{ backgroundColor: v.colorHex }}
                            className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                          />
                          <span className="font-medium text-noir truncate max-w-[120px]">
                            {v.color} ({v.size})
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-noir/40 mt-0.5">{v.sku}</p>
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
                          className="w-14 h-8 px-1.5 text-center text-xs font-semibold bg-white border border-gold/40 focus:border-oxblood outline-none"
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

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-noir/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ivory border border-gold/40 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gold/20 pb-4">
              <h2 className="font-serif text-2xl text-oxblood font-semibold">
                Commission New Garment Piece
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-noir/60 hover:text-oxblood"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider font-semibold mb-1">
                    Garment Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. The Jodhpur Silk Achkan"
                    className="w-full h-10 px-3 bg-white border border-gold/30 outline-none focus:border-oxblood"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-gold/30 outline-none focus:border-oxblood"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold mb-1">
                    Base Investment Price (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-gold/30 outline-none focus:border-oxblood"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider font-semibold mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Detailed craftsmanship narrative..."
                    className="w-full p-3 bg-white border border-gold/30 outline-none focus:border-oxblood"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider font-semibold mb-1">
                    Fabric Composition
                  </label>
                  <input
                    type="text"
                    value={newFabric}
                    onChange={(e) => setNewFabric(e.target.value)}
                    placeholder="e.g. Pure Mulberry Silk with Tested Zari"
                    className="w-full h-10 px-3 bg-white border border-gold/30 outline-none focus:border-oxblood"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider font-semibold mb-1">
                    Editorial Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full h-10 px-3 bg-white border border-gold/30 outline-none focus:border-oxblood"
                  />
                </div>

                {/* Primary Variant Details */}
                <div className="sm:col-span-2 pt-2 border-t border-gold/15">
                  <p className="font-semibold uppercase tracking-wider text-oxblood mb-2">
                    Initial Variant Specification
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider mb-1">Shade</label>
                      <input
                        type="text"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        className="w-full h-9 px-2 bg-white border border-gold/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider mb-1">Hex Code</label>
                      <input
                        type="text"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="w-full h-9 px-2 bg-white border border-gold/30 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider mb-1">Size</label>
                      <input
                        type="text"
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                        className="w-full h-9 px-2 bg-white border border-gold/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider mb-1">Stock Qty</label>
                      <input
                        type="number"
                        min="0"
                        value={newStock}
                        onChange={(e) => setNewStock(e.target.value)}
                        className="w-full h-9 px-2 bg-white border border-gold/30"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gold/20">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
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
