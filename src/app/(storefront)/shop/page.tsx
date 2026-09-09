"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state
  const initialCategory = searchParams.get("category") || "all";
  const initialQuery = searchParams.get("q") || "";
  const initialSort = searchParams.get("sort") || "newest";
  const initialPage = Number(searchParams.get("page") || "1");

  // Local filter states
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Data states
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  // Sync category when query param changes
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && cat !== selectedCategory) {
      setSelectedCategory(cat);
      setPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedSort, selectedSize, inStockOnly, page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedSize && selectedSize !== "all") params.set("size", selectedSize);
      if (inStockOnly) params.set("inStock", "true");
      if (selectedSort) params.set("sort", selectedSort);
      params.set("page", page.toString());
      params.set("limit", "9");

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setCategories(data.categories || []);
        setPagination(data.pagination || { total: 0, page: 1, totalPages: 1 });
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleResetFilters = () => {
    setQuery("");
    setSelectedCategory("all");
    setSelectedSize("all");
    setInStockOnly(false);
    setSelectedSort("newest");
    setPage(1);
  };

  const sizes = ["all", "XS", "S", "M", "L", "XL", "Free Size"];

  return (
    <div className="min-h-screen bg-regal-texture py-12 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Editorial Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-[10px] uppercase tracking-[0.35em] text-gold-antique dark:text-gold-light mb-2 font-semibold">
            Bespoke Collection Archive
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-oxblood dark:text-gold-foil">
            The Atelier Catalogue
          </h1>
          <p className="text-xs md:text-sm text-noir/60 dark:text-ivory/60 mt-3 leading-relaxed">
            Every garment cut by hand from heritage weaves. Browse our limited-batch lehengas,
            Banarasi sarees, and tailored festive silhouettes.
          </p>
        </div>

        {/* Filter & Sort Bar */}
        <div className="bg-ivory dark:bg-[#141012] border border-gold/30 dark:border-gold/20 p-4 mb-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-300">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search silk, velvet, zari..."
              className="w-full h-10 pl-9 pr-4 text-xs bg-white/70 dark:bg-[#1D171A] border border-gold/30 dark:border-gold/20 focus:border-oxblood dark:focus:border-gold outline-none transition-all placeholder:text-noir/40 dark:placeholder:text-ivory/40 text-noir dark:text-ivory"
            />
            <Search className="w-4 h-4 text-noir/40 dark:text-ivory/40 absolute left-3 top-3 pointer-events-none" />
          </form>

          {/* Category Tabs (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 overflow-x-auto max-w-xl py-1">
            <button
              onClick={() => {
                setSelectedCategory("all");
                setPage(1);
              }}
              className={`text-[11px] uppercase tracking-[0.18em] px-3.5 py-1.5 transition-all font-medium whitespace-nowrap ${
                selectedCategory === "all"
                  ? "bg-oxblood text-gold-light border border-oxblood"
                  : "bg-white/50 dark:bg-[#1D171A] text-noir/70 dark:text-ivory/70 border border-gold/25 hover:bg-gold/10"
              }`}
            >
              All Pieces
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCategory(c.slug);
                  setPage(1);
                }}
                className={`text-[11px] uppercase tracking-[0.18em] px-3.5 py-1.5 transition-all font-medium whitespace-nowrap ${
                  selectedCategory === c.slug
                    ? "bg-oxblood text-gold-light border border-oxblood"
                    : "bg-white/50 dark:bg-[#1D171A] text-noir/70 dark:text-ivory/70 border border-gold/25 hover:bg-gold/10"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Right Controls: Sort & Mobile Filter Toggle */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-1.5 text-xs uppercase tracking-wider text-oxblood dark:text-gold-light border border-gold/30 px-3 py-2 bg-white/70 dark:bg-[#1D171A]"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-noir/50 dark:text-ivory/50 uppercase tracking-widest text-[10px] hidden sm:inline">
                Sort By:
              </span>
              <select
                value={selectedSort}
                onChange={(e) => {
                  setSelectedSort(e.target.value);
                  setPage(1);
                }}
                className="h-10 px-3 text-xs bg-white/80 dark:bg-[#1D171A] border border-gold/30 text-noir dark:text-ivory focus:border-oxblood dark:focus:border-gold outline-none cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Secondary Filter Strip (Sizes & Stock toggle) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-gold/20 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-noir/50 dark:text-ivory/50 uppercase tracking-widest text-[10px] mr-1">
              Select Size:
            </span>
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSelectedSize(s);
                  setPage(1);
                }}
                className={`px-2.5 py-1 text-[11px] font-medium border transition-colors ${
                  selectedSize === s
                    ? "bg-gold text-noir font-semibold border-gold"
                    : "bg-white/50 dark:bg-[#1D171A] text-noir/60 dark:text-ivory/60 border-gold/25 hover:bg-gold/10"
                }`}
              >
                {s === "all" ? "All Sizes" : s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none text-noir/70 dark:text-ivory/70 text-xs font-medium">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  setInStockOnly(e.target.checked);
                  setPage(1);
                }}
                className="accent-oxblood w-4 h-4 cursor-pointer"
              />
              In Stock Only
            </label>

            {(selectedCategory !== "all" || selectedSize !== "all" || inStockOnly || query) && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] uppercase tracking-wider text-oxblood hover:text-gold flex items-center gap-1 font-medium"
              >
                <X className="w-3 h-3" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Active Results Count */}
        <div className="flex items-center justify-between mb-8 text-xs text-noir/50">
          <span>
            Displaying <strong className="text-oxblood font-semibold">{products.length}</strong> of{" "}
            <strong className="text-oxblood font-semibold">{pagination.total}</strong> pieces in vault
          </span>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-serif text-sm uppercase tracking-[0.25em] text-oxblood">
              Curating Catalogue...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center bg-white/40 border border-dashed border-gold/30 p-8 max-w-lg mx-auto">
            <p className="font-serif text-xl text-oxblood mb-2">No creations found</p>
            <p className="text-xs text-noir/60 max-w-xs mx-auto mb-6">
              We could not find any pieces matching your specific criteria. Try clearing filters or exploring a different category.
            </p>
            <Button variant="oxblood" size="sm" onClick={handleResetFilters}>
              Reset All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="mt-16 pt-8 border-t border-gold/20 flex items-center justify-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 border border-gold/30 text-xs uppercase tracking-wider text-noir disabled:opacity-30 hover:bg-gold/10 transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`w-9 h-9 border text-xs font-serif transition-colors ${
                  page === num
                    ? "bg-oxblood text-gold-light border-oxblood font-semibold"
                    : "border-gold/30 text-noir hover:bg-gold/10"
                }`}
              >
                {num}
              </button>
            ))}
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              className="px-4 py-2 border border-gold/30 text-xs uppercase tracking-wider text-noir disabled:opacity-30 hover:bg-gold/10 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-serif text-sm uppercase tracking-[0.25em] text-oxblood">
            Curating Atelier Catalogue...
          </p>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
