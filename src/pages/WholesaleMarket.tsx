import React, { useState, useEffect } from 'react';
import { getAllRetailers, getAllWholesalers, getAllCategories } from '../utils/Database';
import ProductCard from '../components/ProductCard';
import { Search, Filter, ChevronDown, ChevronUp, X, Check } from 'lucide-react'; // <--- Added 'Check' here
import { FilteredProductInterface } from "../utils/Interfaces";
import PriceSlider from '../components/priceslider';
import useAuth from '../context/AuthContext';
import { FilterInterface, getFilteredListings, groupListingsByProduct } from '../utils/productsDB';

interface Seller {
    seller_id: string;
    name: string;
    user_role: string;
}

function WholesaleMarket() {
    const { user, loading: userLoading } = useAuth();

    const [filtered, setFiltered] = useState<FilteredProductInterface[]>([]);
    const [retailers, setRetailers] = useState<Seller[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);

    // Toggle for the filter panel
    const [showFilters, setShowFilters] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(0);
    const [selectedRetailers, setSelectedRetailers] = useState<string[]>([]);
    const [maxDistance, setMaxDistance] = useState("");
    const [sortType, setSortType] = useState("");
    const [priceBounds, setPriceBounds] = useState({ min: 0, max: 5000 });
    const [categories, setCategories] = useState<{ category_id: string, category_name: string }[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // Debounced Price
    const [debouncedPriceRange, setDebouncedPriceRange] = useState([0, 0]);

    const [coord, setCoord] = useState<{ lat: number, lng: number } | null>(null);

    // --- Location & Initial Load Logic ---
    const getCurrentLocation = async (): Promise<{ lat: number, lng: number } | null> => {
        return new Promise((resolve) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude: lat, longitude: lng } = position.coords;
                        resolve({ lat, lng });
                    },
                    (error) => {
                        console.error("Error getting location: ", error);
                        resolve(null);
                    }
                );
            } else {
                resolve(null);
            }
        });
    };

    const toggleCategory = (id: string) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const toggleRetailer = (id: string) => {
        setSelectedRetailers(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const loadData = async (filter: FilterInterface) => {
        const allowedRole = user ? (user.role === "retailer" ? "wholesaler" : "retailer") : "retailer";

        const rawSellers = (allowedRole === "retailer") ? await getAllRetailers() : await getAllWholesalers();
        const sellerData = rawSellers as Seller[];
        setRetailers(sellerData.filter(s => s.user_role === allowedRole));

        if (!filter.sellerIds || filter.sellerIds.length === 0) {
            filter.sellerIds = sellerData.map(i => i.seller_id);
        }
        const rawCategories = await getAllCategories();
        setCategories(rawCategories);

        const listings = await getFilteredListings(filter);

        if (!listings) {
            setLoading(false);
            setLoadingProducts(false);
            return;
        }

        const productData = groupListingsByProduct(listings);
        let cleaned = productData;

        // Front-end Sort
        if (filter.orderBy === 'price') {
            const isAsc = filter.priceAsc ?? true;
            cleaned.sort((a, b) => {
                const priceA = a.lowest_price ?? Infinity;
                const priceB = b.lowest_price ?? Infinity;
                return isAsc ? priceA - priceB : priceB - priceA;
            });
        }

        // Set Price Bounds dynamically based on data
        const allPrices = cleaned.flatMap(p => p.listings.map(l => l.price));
        if (allPrices.length > 0) {
            const minP = Math.min(...allPrices);
            const maxP = Math.max(...allPrices);
            if (priceBounds.max === 5000 && priceBounds.min === 0) {
                setPriceBounds({ min: minP, max: maxP });
                setMinPrice(minP);
                setMaxPrice(maxP);
                setDebouncedPriceRange([minP, maxP]);
            }
        }

        setFiltered(cleaned);
        setLoading(false);
        setLoadingProducts(false);
    };

    const loadMarketplace = async (initialLoad: boolean = false) => {
        setLoadingProducts(true);
        let currentCoord = null;
        const newCoord = await getCurrentLocation();
        if (newCoord) {
            currentCoord = newCoord;
            setCoord(newCoord);
        } else if (user && user.location) {
            currentCoord = { lat: user.location.latitude, lng: user.location.longitude };
            setCoord(currentCoord);
        }

        let baseFilter: FilterInterface = {};
        if (currentCoord) baseFilter.distFrom = currentCoord;

        if (!initialLoad) {
            baseFilter.minPrice = debouncedPriceRange[0];
            baseFilter.maxPrice = debouncedPriceRange[1];
            baseFilter.sellerIds = (selectedRetailers.length > 0) ? selectedRetailers : undefined;
            if (searchTerm !== "") baseFilter.searchTerm = searchTerm;
            if (maxDistance) baseFilter.maxDist = Number(maxDistance);
            if (selectedCategories.length > 0) baseFilter.categoryIds = selectedCategories;

            if (sortType === 'price_asc') {
                baseFilter.orderBy = 'price';
                baseFilter.priceAsc = true;
            } else if (sortType === 'price_desc') {
                baseFilter.orderBy = 'price';
                baseFilter.priceAsc = false;
            } else if (sortType === 'distance') {
                baseFilter.orderBy = 'distance';
            } else {
                baseFilter.orderBy = 'relevance';
            }
        }
        await loadData(baseFilter);
    };

    useEffect(() => {
        if (!userLoading) loadMarketplace(true);
    }, [user, userLoading]);

    // Debounce Price
    useEffect(() => {
        if (loading) return;
        const delay = setTimeout(() => setDebouncedPriceRange([minPrice, maxPrice]), 500);
        return () => clearTimeout(delay);
    }, [minPrice, maxPrice]);

    // Trigger Search
    useEffect(() => {
        const delay = setTimeout(() => { if (!loading) applyFilters(false); }, 500);
        return () => clearTimeout(delay);
    }, [searchTerm]);

    // Trigger Filters
    useEffect(() => {
        if (!loading) applyFilters(false);
    }, [debouncedPriceRange, selectedRetailers, selectedCategories, sortType, maxDistance]);


    const applyFilters = (reset: boolean = false) => {
        const minP = reset ? priceBounds.min : debouncedPriceRange[0];
        const maxP = reset ? priceBounds.max : debouncedPriceRange[1];
        const sellerIds = reset ? retailers.map(i => i.seller_id) : (selectedRetailers.length > 0) ? selectedRetailers : retailers.map(i => i.seller_id);
        const currentCategories = reset ? [] : selectedCategories;

        setLoadingProducts(true);

        let filter: FilterInterface = {
            minPrice: minP,
            maxPrice: maxP,
            sellerIds: sellerIds,
            categoryIds: currentCategories.length > 0 ? currentCategories : undefined,
        };

        if (searchTerm !== "") filter.searchTerm = searchTerm;
        const dist = maxDistance ? Number(maxDistance) : undefined;
        if (dist) filter.maxDist = dist;
        if (coord) filter.distFrom = coord;

        const currentSortType = reset ? "" : sortType;
        if (currentSortType === 'price_asc') {
            filter.orderBy = 'price';
            filter.priceAsc = true;
        } else if (currentSortType === 'price_desc') {
            filter.orderBy = 'price';
            filter.priceAsc = false;
        } else if (currentSortType === 'distance') {
            filter.orderBy = 'distance';
        } else {
            filter.orderBy = 'relevance';
        }

        loadData(filter);
    };

    const clearAllFilters = () => {
        setSearchTerm("");
        setMinPrice(priceBounds.min);
        setMaxPrice(priceBounds.max);
        setDebouncedPriceRange([priceBounds.min, priceBounds.max]);
        setSelectedRetailers([]);
        setMaxDistance("");
        setSortType("");
        setSelectedCategories([]);
        applyFilters(true);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-green-50 text-green-400 font-medium animate-pulse">
            Loading marketplace...
        </div>
    );

    // Calculate active filter count for badge
    const activeFilterCount =
        (minPrice > priceBounds.min ? 1 : 0) +
        (maxPrice < priceBounds.max ? 1 : 0) +
        selectedRetailers.length +
        selectedCategories.length +
        (maxDistance ? 1 : 0);

    return (
        <div className="min-h-[calc(100vh-80px)] bg-green-50 flex flex-col">
            <main className="flex-1 p-6 sm:p-8">

                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Wholesale Market</h1>
                        <p className="text-slate-500">
                            Showing <span className="font-bold text-green-600">{filtered.length}</span> items
                        </p>
                    </div>
                </div>

                {/* ───────────────── NEW EXPANDABLE FILTER BAR ───────────────── */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-green-100 mb-8 overflow-hidden transition-all">

                    {/* Top Control Bar (Always Visible) */}
                    <div className="p-4 flex flex-wrap items-center gap-4 justify-between bg-white">

                        {/* Search (Left) */}
                        <div className="relative flex-grow max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400" size={20} />
                            <input
                                type="text"
                                className="w-full pl-11 pr-4 py-3 bg-green-50 border border-transparent rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-medium"
                                placeholder="Search wholesale items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3 ml-auto">
                            {/* Sort Dropdown */}
                            <div className="relative min-w-[180px]">
                                <select
                                    className="w-full p-3 bg-green-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-green-500 outline-none font-bold text-slate-700 text-sm appearance-none cursor-pointer"
                                    value={sortType}
                                    onChange={e => setSortType(e.target.value)}
                                >
                                    <option value="">Sort: Recommended</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="distance" disabled={!coord}>Nearest Distance</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>

                            {/* Toggle Filter Panel Button */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all ${showFilters
                                        ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                                        : 'bg-white border-2 border-green-100 text-green-600 hover:bg-green-50'
                                    }`}
                            >
                                <Filter size={18} />
                                <span>Filters</span>
                                {activeFilterCount > 0 && (
                                    <span className="ml-1 bg-white text-green-600 text-xs px-2 py-0.5 rounded-full">
                                        {activeFilterCount}
                                    </span>
                                )}
                                {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Expanded Filter Panel */}
                    {showFilters && (
                        <div className="p-6 md:p-8 border-t border-green-100 bg-green-50/30 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                                {/* Col 1: Price & Distance */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Price Range</h3>
                                        <div className="px-2">
                                            <PriceSlider
                                                min={priceBounds.min}
                                                max={priceBounds.max}
                                                value={[minPrice, maxPrice]}
                                                onChange={(vals: number[]) => { setMinPrice(vals[0]); setMaxPrice(vals[1]); }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Max Distance (km)</h3>
                                        <input
                                            type="number"
                                            className="w-full p-3 bg-white border border-green-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium"
                                            placeholder="Any distance"
                                            value={maxDistance}
                                            onChange={(e) => setMaxDistance(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Col 2: Categories */}
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Categories</h3>
                                    <div className="bg-white p-3 rounded-2xl border border-green-100 max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                                        {categories.map(c => (
                                            <label key={c.category_id} className="flex items-center justify-between p-2 rounded-xl hover:bg-green-50 cursor-pointer transition-colors group">
                                                <span className="text-sm font-medium text-slate-600 group-hover:text-green-700">{c.category_name}</span>
                                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedCategories.includes(c.category_id) ? 'bg-green-500 border-green-500' : 'border-slate-200 bg-white'}`}>
                                                    {selectedCategories.includes(c.category_id) && <Check size={14} className="text-white" strokeWidth={3} />}
                                                </div>
                                                <input type="checkbox" className="hidden" checked={selectedCategories.includes(c.category_id)} onChange={() => toggleCategory(c.category_id)} />
                                            </label>
                                        ))}
                                        {categories.length === 0 && <p className="text-xs text-slate-400 p-2">No categories.</p>}
                                    </div>
                                </div>

                                {/* Col 3: Sellers */}
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Sellers</h3>
                                    <div className="bg-white p-3 rounded-2xl border border-green-100 max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                                        {retailers.map(r => (
                                            <label key={r.seller_id} className="flex items-center justify-between p-2 rounded-xl hover:bg-green-50 cursor-pointer transition-colors group">
                                                <span className="text-sm font-medium text-slate-600 group-hover:text-green-700">{r.name}</span>
                                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedRetailers.includes(r.seller_id) ? 'bg-green-500 border-green-500' : 'border-slate-200 bg-white'}`}>
                                                    {selectedRetailers.includes(r.seller_id) && <Check size={14} className="text-white" strokeWidth={3} />}
                                                </div>
                                                <input type="checkbox" className="hidden" checked={selectedRetailers.includes(r.seller_id)} onChange={() => toggleRetailer(r.seller_id)} />
                                            </label>
                                        ))}
                                        {retailers.length === 0 && <p className="text-xs text-slate-400 p-2">No sellers found.</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-6 flex justify-end border-t border-green-200 pt-4">
                                <button onClick={clearAllFilters} className="text-sm font-bold text-slate-500 hover:text-red-500 flex items-center gap-1">
                                    <X size={16} /> Clear Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Product Grid */}
                {loadingProducts ? (
                    <div className="flex justify-center items-center h-64 text-green-400 font-medium animate-pulse">
                        Updating results...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-96 text-center bg-white rounded-[2rem] border border-green-50">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                            <Search className="text-green-300" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No products found</h3>
                        <p className="text-slate-500 mt-2 max-w-xs">Try adjusting your filters or search term.</p>
                        <button
                            onClick={clearAllFilters}
                            className="mt-6 text-green-600 font-bold hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map(product => (
                            <div key={product.id} className="h-full">
                                <ProductCard product={product} displayDist={true} />
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default WholesaleMarket;