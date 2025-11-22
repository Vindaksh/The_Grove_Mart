import React, { useState, useEffect } from "react";
import { getAllProducts, getAllRetailers, getAllWholesalers } from "../utils/Database";
import ProductCard from "../components/ProductCard";
import PriceSlider from "../components/priceslider";
import { Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { FilterInterface, getFilteredListings, groupListingsByProduct } from "../utils/productsDB";
import { FilteredProductInterface, SellerInterface } from "../utils/Interfaces";
export default function DashboardPage() {
    const { user } = useAuth();

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

        const listings = await getFilteredListings(filter);
        const productData = groupListingsByProduct(listings!);
        // Determine which sellers to show listings from
        const allowedRole = user?user.role==="retailer"?"wholesaler":"retailer":"retailer";
                    
        const sellerData = await ((allowedRole==="retailer")?getAllRetailers():getAllWholesalers()); // Sellers table already filtered by role

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
        setLoading(true);
        setLoadingProducts(true);
        
        loadWithLoc({});
    }, [user]);

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
                        onChange={(vals: number[]) => {
                            setMinPrice(vals[0]);
                            setMaxPrice(vals[1]);
                        }}
                    />
                </div>

                {/* RETAILERS */}
                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Retailers</h3>
                    {retailers.map(r => (
                        <label key={r.id} className="flex items-center space-x-2 py-1">
                            <input
                                type="checkbox"
                                checked={selectedRetailers.includes(r.id)}
                                onChange={() => toggleRetailer(r.id)}
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

                {loadingProducts ? 
                <p className="text-gray-500">Loading products...</p>
                :filtered.length === 0 ? (
                    <p className="text-gray-500">No products found.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered
                            .map(product => (
                                <ProductCard key={product.id} product={product} displayDist={coord?true:false} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
