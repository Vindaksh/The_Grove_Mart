import React, { useState, useEffect } from "react";
import { getAllProducts, getAllRetailers } from "../utils/Database";
import ProductCard from "../components/ProductCard";
import PriceSlider from "../components/priceslider";
import { Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
    const { user } = useAuth();

    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(0);
    const [selectedRetailers, setSelectedRetailers] = useState([]);
    const [maxDistance, setMaxDistance] = useState("");
    const [sortType, setSortType] = useState("");
    const [priceBounds, setPriceBounds] = useState({ min: 0, max: 5000 });

    // Helpers
    function lowestListingPrice(product) {
        return Math.min(...product.listings.map(l => l.price));
    }

    useEffect(() => {
        const loadData = async () => {
            try {
                const productData = await getAllProducts();
                const sellerData = await getAllRetailers();

                // 1. Determine "Who am I buying from?"
                // If guest or customer -> buy from Retailers
                // If Retailer -> buy from Wholesalers
                let targetSellerRole = 'retailer';

                if (user?.role === 'retailer') {
                    targetSellerRole = 'wholesaler';
                }

                // 2. Get IDs of valid sellers
                const allowedSellerIds = sellerData
                    .filter(s => s.user_role === targetSellerRole)
                    .map(s => s.seller_id);

                // 3. Filter listings to only show those sellers
                const cleaned = productData
                    .map(p => {
                        // If p.listings is undefined, default to empty array
                        const listings = p.listings || [];
                        const allowedListings = listings.filter(l =>
                            allowedSellerIds.includes(l.seller_id)
                        );
                        return { ...p, listings: allowedListings };
                    })
                    .filter(p => p.listings.length > 0) // Remove products with no valid listings
                    .map(p => ({
                        ...p,
                        lowest_price: lowestListingPrice(p)
                    }));

                // 4. Set State
                if (cleaned.length > 0) {
                    const allPrices = cleaned.flatMap(p => p.listings.map(l => l.price));
                    const minP = Math.min(...allPrices);
                    const maxP = Math.max(...allPrices);
                    setPriceBounds({ min: minP, max: maxP });
                    setMinPrice(minP);
                    setMaxPrice(maxP);
                }

                setProducts(cleaned);
                setFiltered(cleaned);

                // 5. Set Retailer Filter List
                setRetailers(
                    sellerData.filter(s => s.user_role === targetSellerRole)
                );

            } catch (err) {
                console.error("Dashboard Error:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    const toggleRetailer = (id) => {
        setSelectedRetailers(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    //─ APPLY FILTERS ─────────────────────────────────────────────
    const applyFilters = () => {
        let f = [...products];
        const minP = Number(minPrice);
        const maxP = Number(maxPrice);
        const distanceLimit = maxDistance ? Number(maxDistance) : null;

        f = f.filter(product => {
            const valid = product.listings.filter(l => {
                if (l.price < minP || l.price > maxP) return false;
                if (selectedRetailers.length > 0 && !selectedRetailers.includes(l.seller_id))
                    return false;
                if (distanceLimit !== null) {
                    const d = Number(l.distance_from_user ?? Infinity);
                    if (d > distanceLimit) return false;
                }
                return true;
            });
            return valid.length > 0;
        });

        if (sortType === "price_asc")
            f.sort((a, b) => a.lowest_price - b.lowest_price);

        if (sortType === "price_desc")
            f.sort((a, b) => b.lowest_price - a.lowest_price);

        setFiltered(f);
    };

    if (loading) return <div className="p-10 text-center text-xl">Loading...</div>;

    return (
        <div className="min-h-screen bg-rose-50 flex">

            {/* ───────────────── LEFT SIDEBAR ───────────────── */}
            <aside className="w-72 bg-white shadow-lg p-5 sticky top-0 h-screen overflow-y-auto">

                <h2 className="text-xl font-bold mb-5">Filters</h2>

                {/* SEARCH */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            className="w-full pl-10 pr-3 py-2 rounded-xl border"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* PRICE */}
                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Price Range</h3>
                    <PriceSlider
                        min={priceBounds.min}
                        max={priceBounds.max}
                        value={[minPrice, maxPrice]}
                        onChange={(vals) => {
                            setMinPrice(vals[0]);
                            setMaxPrice(vals[1]);
                        }}
                    />
                </div>

                {/* RETAILERS */}
                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Retailers</h3>
                    {retailers.map(r => (
                        <label key={r.seller_id} className="flex items-center space-x-2 py-1">
                            <input
                                type="checkbox"
                                checked={selectedRetailers.includes(r.seller_id)}
                                onChange={() => toggleRetailer(r.seller_id)}
                            />
                            <span>{r.name}</span>
                        </label>
                    ))}
                </div>

                {/* DISTANCE */}
                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Distance (km)</h3>
                    <input
                        type="number"
                        className="w-full border rounded-xl px-3 py-2"
                        placeholder="max distance"
                        value={maxDistance}
                        onChange={(e) => setMaxDistance(e.target.value)}
                    />
                </div>

                {/* SORTING */}
                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Sort By</h3>
                    <select
                        className="w-full border rounded-xl px-3 py-2"
                        value={sortType}
                        onChange={e => setSortType(e.target.value)}
                    >
                        <option value="">None</option>
                        <option value="price_asc">Price: Low → High</option>
                        <option value="price_desc">Price: High → Low</option>
                    </select>
                </div>

                <button
                    className="w-full py-3 bg-rose-500 text-white rounded-xl font-semibold"
                    onClick={applyFilters}
                >
                    Apply Filters
                </button>
            </aside>

            {/* ───────────────── PRODUCT GRID ───────────────── */}
            <main className="flex-1 p-8">
                <h1 className="text-3xl font-extrabold mb-6">Marketplace</h1>

                {filtered.length === 0 ? (
                    <p className="text-gray-500">No products found.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered
                            .filter(p =>
                                p.name.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                    </div>
                )}
            </main>
        </div>
    );
}
