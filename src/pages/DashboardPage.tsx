import React, { useState, useEffect } from "react";
import { getAllProducts, getAllRetailers, getAllWholesalers } from "../utils/Database";
import ProductCard from "../components/ProductCard";
import PriceSlider from "../components/priceslider";
import { Check, Filter, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { FilterInterface, getFilteredListings, groupListingsByProduct } from "../utils/productsDB";
import { FilteredProductInterface, SellerInterface } from "../utils/Interfaces";
export default function DashboardPage() {
    const { user, loading: userLoading } = useAuth();

    const [products, setProducts] = useState<FilteredProductInterface[]>([]);
    const [filtered, setFiltered] = useState<FilteredProductInterface[]>([]);
    const [retailers, setRetailers] = useState<SellerInterface[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(0);
    const [selectedRetailers, setSelectedRetailers] = useState<string[]>([]);
    const [maxDistance, setMaxDistance] = useState("");
    const [sortType, setSortType] = useState("");
    const [priceBounds, setPriceBounds] = useState({ min: 0, max: 5000 });

    const [coord, setCoord] = useState<{lat: number, lng: number}|null>(null);

    const getCurrentLocation = async (): Promise<{ lat: number, lng: number } | null> => {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude: lat, longitude: lng } = position.coords;
                        resolve({ lat, lng });
                    },
                    (error) => {
                        console.error("Error getting location: ", error);
                        reject(null);
                    }
                );
            } else {
                console.error("Geolocation not supported");
                reject(null);
            }
        });
    };


    const loadData = async (filter:FilterInterface) => {

        const allowedRole = user?user.role==="retailer"?"wholesaler":"retailer":"retailer";
        const sellerData = await ((allowedRole==="retailer")?getAllRetailers():getAllWholesalers()); // Sellers table already filtered by role
        console.log(allowedRole, sellerData);


        if(!filter.sellerIds || filter.sellerIds.length==0) {
            filter.sellerIds = sellerData.map(i=>i.id);
            console.log(filter.sellerIds);
        }

        const listings = await getFilteredListings(filter);
        const productData = groupListingsByProduct(listings!);
        // Determine which sellers to show listings from
                    

        // Filter listing table
        const cleaned = productData;

        // Compute price bounds
        const allPrices = cleaned.flatMap(p => p.listings.map(l => l.price));
        const minP = Math.min(...allPrices);
        const maxP = Math.max(...allPrices);

        setProducts(cleaned);
        setFiltered(cleaned);
        if(minPrice==maxPrice) {
            setPriceBounds({ min: minP, max: maxP });
            setMinPrice(minP);
            setMaxPrice(maxP);
        }

        // Only retailers if customer
        setRetailers(
            sellerData.filter(s => s.role === allowedRole)
        );

        setLoading(false);
        setLoadingProducts(false);
    };
    const loadWithLoc = async (filter: FilterInterface) => {
        // Wait for coordinates before passing to loadData
        if(coord) {
            filter.distFrom = coord;
        } else {
            const newCoord = await getCurrentLocation();
            if (newCoord) {
                filter.distFrom = newCoord;
                setCoord(newCoord);
            } else if (user && user.location) {
                filter.distFrom = { lat: user.location.latitude, lng: user.location.longitude };
                setCoord({ lat: user.location.latitude, lng: user.location.longitude })
            }
        }

        await loadData(filter);  // Proceed with loading data after getting coordinates
    };

    useEffect(() => {
        if(!userLoading) {
            setLoading(true);
            setLoadingProducts(true);
            
            loadWithLoc({});
        }
    }, [user, userLoading]);

    // --- LIVE SEARCH EFFECT ---
    useEffect(() => {
        applyFilters();
    }, [searchTerm]);

    const toggleRetailer = (id: string) => {
        const retailerIds = retailers.map(i=>i.id);
        if(retailerIds.includes(id)) {
            const toggle = (prev: string[]) => {
                return prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
            };
            setSelectedRetailers(toggle(selectedRetailers));
        }
    };

    //─ APPLY FILTERS ─────────────────────────────────────────────
    const applyFilters = () => {
        const minP = Number(minPrice);
        const maxP = Number(maxPrice);
        const distanceLimit = maxDistance ? Number(maxDistance) : null;
        
        setLoadingProducts(true);
        let filter:FilterInterface = {
            minPrice:minP,
            maxPrice:maxP,
            sellerIds:(selectedRetailers.length>0)?selectedRetailers:retailers.map(i=>i.id)
        };
        if(searchTerm!=="") {
            filter.searchTerm = searchTerm;
        }
        if(distanceLimit) {
            filter.maxDist = distanceLimit;
        }
        loadWithLoc(filter);
    };

    // --- CLEAR FILTERS FUNCTION ---
    const clearAllFilters = () => {
        // 1. Reset all filter states
        setSearchTerm("");
        setMinPrice(priceBounds.min);
        setMaxPrice(priceBounds.max);
        setSelectedRetailers([]);
        setMaxDistance("");
        setSortType("");

        // 2. IMPORTANT: Immediately reset the list to show all products
        setFiltered(products);
    };

    if (loading) return <div className="p-10 text-center text-xl">Loading...</div>;

    return (
        <div className="min-h-[calc(100vh-80px)] bg-rose-50 flex flex-col md:flex-row">

            {/* ───────────────── LEFT SIDEBAR (Filters Only) ───────────────── */}
            <aside className="w-full md:w-72 bg-white border-r border-rose-100 p-6 md:sticky md:top-20 md:h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar z-40">

                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <Filter className="text-rose-500" size={20} />
                        <h2 className="text-xl font-extrabold text-slate-900">Filters</h2>
                    </div>
                    {/* Mini Clear Button in Sidebar */}
                    <button
                        onClick={clearAllFilters}
                        className="text-xs font-bold text-rose-500 hover:text-rose-700"
                    >
                        Reset
                    </button>
                </div>

                {/* PRICE */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price Range</h3>
                    </div>
                    <div className="px-1">
                        <PriceSlider
                            min={priceBounds.min}
                            max={priceBounds.max}
                            value={[minPrice, maxPrice]}
                            onChange={(vals: number[]) => {
                                setMinPrice(vals[0]);
                                setMaxPrice(vals[1]);
                            }}
                        />
                    </div>
                </div>

                {/* RETAILERS */}
                <div className="mb-8">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Sellers</h3>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {retailers.map(r => (
                            <label key={r.id} className="flex items-center space-x-3 p-2 rounded-xl hover:bg-rose-50 cursor-pointer transition-colors group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-200 checked:border-rose-500 checked:bg-rose-500 transition-all"
                                        checked={selectedRetailers.includes(r.id)}
                                        onChange={() => toggleRetailer(r.id)}
                                    />
                                    <Check className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" size={12} strokeWidth={4} />
                                </div>
                                <span className="text-sm font-medium text-slate-600 group-hover:text-rose-600 transition-colors">{r.name}</span>
                            </label>
                        ))}
                        {retailers.length === 0 && <p className="text-sm text-slate-400 italic">No retailers found.</p>}
                    </div>
                </div>

                {/* DISTANCE & SORT */}
                <div className="grid grid-cols-1 gap-4 mb-8">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Max Dist (km)</label>
                        <input
                            type="number"
                            className="w-full p-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition-all font-medium text-slate-700"
                            placeholder="Any"
                            value={maxDistance}
                            onChange={(e) => setMaxDistance(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sort By</label>
                        <div className="relative">
                            <select
                                className="w-full p-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition-all font-medium text-slate-700 text-sm appearance-none cursor-pointer"
                                value={sortType}
                                onChange={e => setSortType(e.target.value)}
                            >
                                <option value="">Recommended</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button
                    className="w-full py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-rose-500 hover:shadow-rose-200 hover:-translate-y-0.5 transition-all duration-300"
                    onClick={applyFilters}
                >
                    Apply Filters
                </button>
            </aside>

            {/* ───────────────── MAIN CONTENT ───────────────── */}
            <main className="flex-1 p-6 sm:p-8">

                {/* Top Header with Live Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Marketplace</h1>
                        <p className="text-slate-500">
                            Showing <span className="font-bold text-rose-500">{filtered.length}</span> items
                        </p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-rose-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-11 pr-4 py-3 bg-white border border-rose-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent shadow-sm transition-all"
                            placeholder="Search for items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Product Grid */}
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-96 text-center bg-white rounded-[2rem] border border-rose-50">
                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                            <Search className="text-rose-300" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No products found</h3>
                        <p className="text-slate-500 mt-2 max-w-xs">Try adjusting your filters or search term.</p>
                        <button
                            onClick={clearAllFilters}
                            className="mt-6 text-rose-600 font-bold hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {filtered.map(product => (
                            <div key={product.id || product.id} className="h-full">
                                <ProductCard product={product} displayDist={coord?true:false} />
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
