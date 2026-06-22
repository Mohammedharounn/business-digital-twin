import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '../components/elements/Card';
import { Button } from '../components/elements/Button';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { useAppStore } from '../store/useAppStore';
import { useSimulation } from '../hooks/useSimulation';

// ─── Static archetypes (existing UI preserved) ─────────────────────────────────
const ARCHETYPES = [
    { id: 1, name: "Neon Sushi Lounge", category: "HOSPITALITY", type: "PREMIUM", price: "E£299", rating: 4.9, icon: "🍣" },
    { id: 2, name: "Automated Micro-Logistics", category: "INDUSTRIAL", type: "ADVANCED", price: "E£599", rating: 5.0, icon: "📦" },
    { id: 3, name: "Boutique Fitness Hub", category: "RETAIL", type: "STANDARD", price: "FREE", rating: 4.7, icon: "💪" },
    { id: 4, name: "Quantum Computing Lab", category: "TECH", type: "EXPERIMENTAL", price: "E£999", rating: 4.8, icon: "⚛️" },
    { id: 5, name: "Urban Vertical Farm", category: "INDUSTRIAL", type: "ADVANCED", price: "E£449", rating: 4.9, icon: "🥬" },
    { id: 6, name: "VR Gaming Arena", category: "TECH", type: "PREMIUM", price: "E£349", rating: 4.6, icon: "🎮" },
];

const CATEGORIES = ["ALL", "RETAIL", "TECH", "HOSPITALITY", "INDUSTRIAL"];

// ─── Quick-search suggestions per business type ────────────────────────────────
const SUGGESTIONS = {
    cafe: ["Coffee Machine", "Espresso Machine", "Coffee Grinder", "Display Fridge", "POS System"],
    restaurant: ["Commercial Oven", "Food Processor", "Refrigerator", "Kitchen Equipment", "Tables and Chairs"],
    gym: ["Treadmill", "Dumbbells Set", "Exercise Bike", "Weight Bench", "Gym Flooring"],
    retail: ["Display Shelves", "Cash Register", "Barcode Scanner", "Security Camera", "Clothing Rack"],
    salon: ["Hair Dryer", "Salon Chair", "Hair Straightener", "Styling Station", "UV Sterilizer"],
    bakery: ["Commercial Mixer", "Bread Oven", "Dough Sheeter", "Proofing Cabinet", "Display Case"],
    coworking: ["Office Desk", "Office Chair", "Printer", "Whiteboard", "Monitor"],
    laundry: ["Washing Machine", "Commercial Dryer", "Ironing Board", "Laundry Cart", "Coin Sorter"],
    default: ["Coffee Machine", "Gaming Chair", "Treadmill", "Hair Dryer", "Printer", "Office Furniture"],
};

// Live USD→EGP rate, refreshed from the backend on mount (falls back to 50).
let FX_RATE = 50;
function USD_TO_EGP(usd) {
    return Math.round(usd * FX_RATE);
}

// ─── Condition badge ───────────────────────────────────────────────────────────
function ConditionBadge({ condition }) {
    const map = {
        'New': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'Like New': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
        'Very Good': 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20',
        'Good': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'Acceptable': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
    const cls = map[condition] || 'bg-white/5 text-zinc-400 border-white/10';
    return (
        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border tracking-widest ${cls}`}>
            {condition}
        </span>
    );
}

// ─── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, onAdd, isAdded, isAdding }) {
    const egp = USD_TO_EGP(product.price);
    const shippingEgp = product.shipping?.cost ? USD_TO_EGP(product.shipping.cost) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
        >
            <Card className="p-0 overflow-hidden hover:border-brand-primary/30 transition-all h-full flex flex-col">
                {/* Image */}
                <div className="relative w-full h-44 bg-white/[0.02] overflow-hidden flex-shrink-0">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                    ) : null}
                    <div
                        className={`absolute inset-0 flex items-center justify-center text-5xl ${product.image ? 'hidden' : 'flex'}`}
                        style={{ display: product.image ? 'none' : 'flex' }}
                    >
                        🛒
                    </div>
                    {/* eBay badge */}
                    <div className="absolute top-2 left-2">
                        <span className="text-[8px] font-black bg-[#e53238]/20 text-[#e53238] border border-[#e53238]/30 px-1.5 py-0.5 rounded tracking-widest">
                            eBay
                        </span>
                    </div>
                    {isAdded && (
                        <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                            <span className="text-3xl">✓</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-3">
                        <ConditionBadge condition={product.condition} />
                        <span className="text-[9px] text-zinc-600 truncate">{product.category}</span>
                    </div>

                    <h3 className="text-sm font-semibold text-white leading-tight mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors flex-1">
                        {product.title}
                    </h3>

                    {/* Seller */}
                    <div className="flex items-center gap-1 mb-4">
                        <span className="text-[9px] text-zinc-600">by</span>
                        <span className="text-[9px] font-mono text-zinc-500 truncate">{product.seller?.username}</span>
                        {product.seller?.feedbackPercentage && (
                            <span className="text-[9px] text-emerald-500 ml-auto shrink-0">
                                ⭐ {parseFloat(product.seller.feedbackPercentage).toFixed(0)}%
                            </span>
                        )}
                    </div>

                    {/* Price */}
                    <div className="pt-4 border-t border-white/5 mt-auto">
                        <div className="flex items-end justify-between mb-1">
                            <div>
                                <div className="text-[8px] text-zinc-700 uppercase tracking-widest mb-0.5">Price (USD)</div>
                                <div className="text-base font-display font-black text-white">${product.price.toFixed(2)}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[8px] text-zinc-700 uppercase tracking-widest mb-0.5">In E£</div>
                                <div className="text-sm font-bold text-brand-primary">E£{egp.toLocaleString()}</div>
                            </div>
                        </div>
                        {shippingEgp > 0 ? (
                            <div className="text-[9px] text-zinc-600 mb-3">
                                + E£{shippingEgp.toLocaleString()} shipping
                            </div>
                        ) : (
                            <div className="text-[9px] text-emerald-600 mb-3">Free shipping</div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant={isAdded ? 'secondary' : 'primary'}
                                className="flex-1 text-[10px]"
                                onClick={() => !isAdded && onAdd(product)}
                                disabled={isAdded || isAdding}
                            >
                                {isAdding ? '⏳ Adding...' : isAdded ? '✓ Added' : '+ Add to Business'}
                            </Button>
                            <a
                                href={product.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center px-3 py-1.5 text-[10px] font-bold text-zinc-400 bg-white/[0.03] border border-white/8 rounded-lg hover:border-white/20 hover:text-white transition-all"
                            >
                                View ↗
                            </a>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function MarketplacePage({ businessConfig, onEquipmentAdded }) {
    const [filter, setFilter] = useState("ALL");
    const [ebayQuery, setEbayQuery] = useState('');
    const [submittedQuery, setSubmittedQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [offset, setOffset] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [addingId, setAddingId] = useState(null);
    const [addedIds, setAddedIds] = useState(new Set());
    const [toast, setToast] = useState(null);
    const [fxRate, setFxRate] = useState(FX_RATE);

    // Live USD→EGP rate
    useEffect(() => {
        api.get('/market/fx').then(r => {
            if (r.data?.rate) { FX_RATE = r.data.rate; setFxRate(r.data.rate); }
        }).catch(() => {});
    }, []);

    const { activeBusiness, setActiveBusiness } = useAppStore();
    const { processConfig } = useSimulation();
    const inputRef = useRef(null);
    const LIMIT = 20;

    const businessType = (businessConfig || activeBusiness)?.businessType || 'default';
    const suggestions = SUGGESTIONS[businessType] || SUGGESTIONS.default;

    // Pre-populate addedIds from current project's purchasedEquipment
    useEffect(() => {
        const current = businessConfig || activeBusiness;
        const purchased = current?.purchasedEquipment;
        if (Array.isArray(purchased) && purchased.length > 0) {
            setAddedIds(new Set(purchased.map(e => e.id)));
        }
    }, [businessConfig, activeBusiness]);

    const search = useCallback(async (q, newOffset = 0) => {
        if (!q.trim()) return;
        setLoading(true);
        setError(null);
        if (newOffset === 0) setProducts([]);
        try {
            const res = await api.get('/marketplace/search', {
                params: { q: q.trim(), limit: LIMIT, offset: newOffset },
            });
            if (res.data.success) {
                setProducts(prev => newOffset === 0 ? res.data.items : [...prev, ...res.data.items]);
                setTotal(res.data.total);
                setOffset(newOffset + LIMIT);
            }
        } catch (err) {
            const msg = err.response?.data?.error || err.message;
            const code = err.response?.data?.code;
            if (code === 'RATE_LIMIT') setError('eBay rate limit reached. Please wait 30 seconds and try again.');
            else if (err.response?.status === 401) setError('Session expired. Please log in again.');
            else setError(msg || 'Failed to search eBay. Check your connection.');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!ebayQuery.trim()) return;
        setOffset(0);
        setSubmittedQuery(ebayQuery.trim());
        search(ebayQuery.trim(), 0);
    };

    const handleSuggestion = (s) => {
        setEbayQuery(s);
        setOffset(0);
        setSubmittedQuery(s);
        search(s, 0);
    };

    const handleLoadMore = () => {
        search(submittedQuery, offset);
    };

    const handleAdd = async (product) => {
        setAddingId(product.id);
        try {
            const res = await api.post('/marketplace/add-to-business', { product });
            if (res.data.success) {
                setAddedIds(prev => new Set([...prev, product.id]));

                // Update local activeBusiness config and re-run financial calculations
                const updatedConfig = {
                    ...(activeBusiness || businessConfig || {}),
                    ...res.data.data.updatedConfig,
                };
                setActiveBusiness(updatedConfig);

                // Trigger financial recalculation (updates Dashboard)
                if (typeof processConfig === 'function' && updatedConfig.businessType) {
                    try { processConfig(updatedConfig, false); } catch (_) {}
                }

                // Notify parent if callback provided
                if (typeof onEquipmentAdded === 'function') {
                    onEquipmentAdded(res.data.data.updatedConfig);
                }

                const egp = USD_TO_EGP(product.price);
                showToast(`✓ "${product.title.slice(0, 35)}…" added — E£${egp.toLocaleString()} added to startup costs`);
            }
        } catch (err) {
            const msg = err.response?.data?.error || err.message;
            showToast(`✗ ${msg}`, 'error');
        } finally {
            setAddingId(null);
        }
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const filteredArchetypes = ARCHETYPES.filter(a => filter === "ALL" || a.category === filter);
    const hasMore = products.length < total && products.length > 0;

    return (
        <div className="max-w-[1600px] mx-auto animate-fade-in">
            {/* ─── Header ─────────────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">🏛️</span>
                        <h1 className="text-2xl font-display font-bold text-white tracking-tight uppercase">Asset Marketplace</h1>
                    </div>
                    <p className="text-xs font-black text-brand-primary uppercase tracking-[0.3em]">Acquire battle-tested industry nodes and spatial assets</p>
                </div>
                <div className="flex gap-2 p-1 bg-white/[0.02] border border-white/10 rounded-xl overflow-x-auto max-w-full">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-2 text-[9px] font-black rounded-lg transition-all uppercase tracking-widest
                                ${filter === cat ? 'bg-brand-primary text-white shadow-lg' : 'text-zinc-600 hover:text-white'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* ─── eBay Search Section ─────────────────────────────────────────── */}
            <Card className="p-6 mb-8 border-white/8 bg-white/[0.015]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#e53238]/10 border border-[#e53238]/20 flex items-center justify-center text-sm">🛒</div>
                    <div>
                        <div className="text-sm font-bold text-white">eBay Equipment Search</div>
                        <div className="text-[10px] text-zinc-600">Search real products and add them directly to your startup costs</div>
                    </div>
                    <div className="ml-auto hidden sm:flex items-center gap-1.5 text-[9px] text-zinc-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live eBay data
                    </div>
                </div>

                {/* Search bar */}
                <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={ebayQuery}
                            onChange={e => setEbayQuery(e.target.value)}
                            placeholder="Search for equipment, furniture, electronics…"
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-brand-primary/50 focus:bg-white/[0.05] transition-all"
                        />
                        {ebayQuery && (
                            <button type="button" onClick={() => { setEbayQuery(''); inputRef.current?.focus(); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors text-lg leading-none">
                                ×
                            </button>
                        )}
                    </div>
                    <Button type="submit" disabled={loading || !ebayQuery.trim()} className="px-6">
                        {loading ? '⏳' : '🔍 Search'}
                    </Button>
                </form>

                {/* Suggestions */}
                <div className="flex flex-wrap gap-2">
                    <span className="text-[9px] text-zinc-700 uppercase tracking-widest self-center">Quick search:</span>
                    {suggestions.map(s => (
                        <button
                            key={s}
                            onClick={() => handleSuggestion(s)}
                            className="text-[10px] font-medium text-zinc-500 bg-white/[0.03] border border-white/8 px-3 py-1 rounded-lg hover:border-brand-primary/30 hover:text-white hover:bg-white/[0.06] transition-all"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </Card>

            {/* ─── eBay Results ────────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
                {/* Error */}
                {error && !loading && (
                    <motion.div key="error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mb-8 p-5 bg-red-500/8 border border-red-500/20 rounded-2xl flex items-start gap-4">
                        <span className="text-2xl shrink-0">⚠️</span>
                        <div>
                            <div className="text-sm font-bold text-red-400 mb-1">Search Error</div>
                            <div className="text-xs text-zinc-500">{error}</div>
                            <button onClick={() => search(submittedQuery, 0)} className="text-[10px] text-brand-primary mt-2 hover:underline">Try again →</button>
                        </div>
                    </motion.div>
                )}

                {/* Loading skeleton */}
                {loading && products.length === 0 && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="rounded-2xl border border-white/6 overflow-hidden animate-pulse">
                                <div className="h-44 bg-white/[0.03]" />
                                <div className="p-5 space-y-3">
                                    <div className="h-3 bg-white/[0.04] rounded w-1/3" />
                                    <div className="h-4 bg-white/[0.04] rounded" />
                                    <div className="h-4 bg-white/[0.04] rounded w-3/4" />
                                    <div className="h-8 bg-white/[0.04] rounded mt-4" />
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* Results */}
                {products.length > 0 && (
                    <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex items-center justify-between mb-5">
                            <div className="text-[10px] text-zinc-600">
                                <span className="text-white font-bold">{total.toLocaleString()}</span> results for "
                                <span className="text-brand-primary">{submittedQuery}</span>"
                            </div>
                            <div className="text-[9px] text-zinc-700">Prices in USD + live E£ (1 USD = E£{fxRate})</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {products.map((p, i) => (
                                <ProductCard
                                    key={`${p.id}-${i}`}
                                    product={p}
                                    onAdd={handleAdd}
                                    isAdded={addedIds.has(p.id)}
                                    isAdding={addingId === p.id}
                                />
                            ))}
                        </div>

                        {/* Load more */}
                        {hasMore && (
                            <div className="flex justify-center mb-10">
                                <Button variant="secondary" onClick={handleLoadMore} disabled={loading} className="px-10">
                                    {loading ? '⏳ Loading…' : `Load more (${total - products.length} remaining)`}
                                </Button>
                            </div>
                        )}

                        {/* Loading more indicator */}
                        {loading && products.length > 0 && (
                            <div className="text-center text-zinc-600 text-sm py-6">Loading more products…</div>
                        )}
                    </motion.div>
                )}

                {/* Empty state */}
                {!loading && !error && submittedQuery && products.length === 0 && (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center py-16 mb-10">
                        <div className="text-5xl mb-4">🔍</div>
                        <div className="text-lg font-bold text-white mb-2">No results for "{submittedQuery}"</div>
                        <div className="text-sm text-zinc-600 mb-6">Try a different search term or check the suggestions above</div>
                        <Button variant="secondary" onClick={() => { setEbayQuery(''); inputRef.current?.focus(); }}>
                            Clear search
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Divider between eBay results and static archetypes ─────────── */}
            {(products.length > 0 || submittedQuery) && (
                <div className="flex items-center gap-4 mb-10">
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-[9px] text-zinc-700 uppercase tracking-widest">Platform Archetypes</span>
                    <div className="flex-1 h-px bg-white/5" />
                </div>
            )}

            {/* ─── Static Archetypes (original UI) ─────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArchetypes.map((item, i) => (
                    <Card key={item.id} className="p-8 group hover:border-brand-primary/40" style={{ animationDelay: `${i * 0.05}s` }}>
                        <div className="flex justify-between items-start mb-10">
                            <div className="w-16 h-16 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                                {item.icon}
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`text-[8px] font-black px-2 py-1 rounded-full mb-1 tracking-widest
                                    ${item.type === 'PREMIUM' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                    item.type === 'ADVANCED' ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20' :
                                    'bg-white/5 text-zinc-400 border border-white/5'}`}>
                                    {item.type}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-500">⭐ {item.rating}</span>
                            </div>
                        </div>
                        <h3 className="text-lg font-display font-bold text-white mb-2 tracking-tight group-hover:text-brand-primary transition-colors">{item.name}</h3>
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-10">{item.category} NODAL ARCHETYPE</p>
                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-1">Asset Value</span>
                                <span className="text-lg font-display font-black text-white">{item.price}</span>
                            </div>
                            <Button size="sm" variant={item.price === 'FREE' ? 'secondary' : 'primary'}>
                                {item.price === 'FREE' ? 'Initialize' : 'Authorize Acquisition'}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* ─── Featured Banner ─────────────────────────────────────────────── */}
            <Card className="mt-12 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 p-12 border-brand-primary/20 overflow-hidden relative">
                <div className="absolute right-[-5%] top-[-20%] text-[240px] opacity-[0.03] rotate-12 select-none pointer-events-none">🏢</div>
                <div className="max-w-xl relative z-10">
                    <h2 className="text-2xl font-display font-bold text-white mb-4 tracking-tighter">Become a Digital Twin Architect</h2>
                    <p className="text-sm text-zinc-400 mb-8 font-medium leading-relaxed">
                        Create, simulate, and export your own business nodes. Publish to the marketplace and earn revenue from the decentralized digital twin ecosystem.
                    </p>
                    <Button variant="secondary" className="px-10">Open SDK Dashboard</Button>
                </div>
            </Card>

            {/* ─── Toast notification ──────────────────────────────────────────── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        key="toast"
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12 }}
                        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl text-sm font-semibold shadow-2xl max-w-md text-center
                            ${toast.type === 'error'
                                ? 'bg-red-500/90 text-white border border-red-400/30'
                                : 'bg-emerald-500/90 text-white border border-emerald-400/30'}`}
                    >
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
