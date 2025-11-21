import React, { useState, useEffect } from "react";
import { getAllProducts, getAllRetailers } from "../utils/Database";
import ProductCard from "../components/ProductCard";
import { Search } from "lucide-react";
//import "./Dashboard.css";
import PriceSlider from "../components/priceslider";


function DashboardPage() {
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [retailers, setRetailers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // -------- FILTER STATES --------
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(0);

    const [selectedRetailers, setSelectedRetailers] = useState([]);
    const [maxDistance, setMaxDistance] = useState("");
    const [sortType, setSortType] = useState("");
    const [priceBounds, setPriceBounds] = useState({ min: 0, max: 5000 });


    function extractPrice(product) {
        if (!product.listings || product.listings.length === 0) return 0;
        return Math.min(...product.listings.map(l => l.price || 0));
    }
    function productMinListingDistance(product) {
        const dist = (product.listings || []).map(l => Number(l.distance_from_user ?? Infinity)).filter(d => !Number.isNaN(d));
        if (dist.length === 0) return Infinity;
        return Math.min(...dist);
    }

    useEffect(() => {
        const fetchData = async () => {
            const productData = await getAllProducts();
            const retailerData = await getAllRetailers(); // Helper needed

            const retailerIds = new Set(retailerData.map(r => r.user_id));

            // For each product, keep only listings that belong to retailers
            const productsWithRetailListings = (productData || []).map(p => {
                const listings = (p.listings || []).filter(l => retailerIds.has(l.seller_id));
                return {
                    ...p,
                    listings
                };
            })
            // drop products that have zero retailer listings
            .filter(p => (p.listings || []).length > 0);

            const allListingPrices = [];
            for (const p of productsWithRetailListings) {
                for (const l of p.listings) {
                    const price = Number(l.price ?? 0);
                    if (!Number.isNaN(price)) allListingPrices.push(price);
                }
            }

            const minP = allListingPrices.length ? Math.min(...allListingPrices) : 0;
            const maxP = allListingPrices.length ? Math.max(...allListingPrices) : 0;

            setProducts(productData);
            setFiltered(productData);
            setRetailers(retailerData);

            setPriceBounds({ min: minP, max: maxP });
            setMinPrice(minP);
            setMaxPrice(maxP);


            setLoading(false);
        };

        fetchData();
    }, []);

    // -------- HANDLE RETAILER CHECKBOX --------
    const toggleRetailer = (id) => {
        setSelectedRetailers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };


    // -------- APPLY FILTER FUNCTION --------
    const applyFilters = () => {
        const minP = Number(minPrice);
    const maxP = Number(maxPrice);
    const distanceLimit = maxDistance ? Number(maxDistance) : null;

    // product passes if ANY of its retailer listings match all filters
    const f = products.filter(product => {
        const validListings = (product.listings || []).filter(listing => {
            const price = Number(listing.price ?? 0);
            const seller = listing.seller_id;

            // ---- PRICE FILTER ----
            if (price < minP || price > maxP) return false;

            // ---- RETAILER FILTER ----
            if (selectedRetailers.length > 0 && !selectedRetailers.includes(seller)) {
                return false;
            }

            // ---- DISTANCE FILTER ----
            if (distanceLimit !== null) {
                const d = Number(listing.distance_from_user ?? Infinity);
                if (d > distanceLimit) return false;
            }

            return true;
        });

        // include product only if at least one listing is valid
        return validListings.length > 0;
    });

    // ---- SORTING ----
    if (sortType === "price_asc") {
        f.sort((a, b) => extractPrice(a) - extractPrice(b));
    } 
    else if (sortType === "price_desc") {
        f.sort((a, b) => extractPrice(b) - extractPrice(a));
    } 
    else if (sortType === "distance") {
        // sort by min listing distance
        const dist = p =>
            Math.min(
                ...(p.listings || []).map(l => Number(l.distance_from_user ?? Infinity))
            );
        f.sort((a, b) => dist(a) - dist(b));
    }

    setFiltered(f);
};


    if (loading) {
        return (
            <div className="dashboard-container">
                <h1 className="dashboard-title">Loading Products...</h1>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] bg-rose-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
    
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Marketplace</h1>
                        <p className="text-slate-500 mt-1">Items available in your area.</p>
                    </div>
    
                    {/* Search Bar */}
                    <div className="relative max-w-md w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-rose-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for apples, bread..."
                            className="block w-full pl-10 pr-3 py-3 border border-rose-100 rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 sm:text-sm shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
    
                {/* Content Area */}
                {loading ? (
                    <div className="flex justify-center items-center h-64 text-rose-400 font-medium animate-pulse">
                        Loading fresh products...
                    </div>
                ) : (
                    <>
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-rose-100">
                                <p className="text-slate-500 text-lg">No products found matching "{searchTerm}".</p>
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="mt-4 text-rose-600 font-bold hover:underline"
                                >
                                    Clear Search
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.map((product) => (
                                    <div key={product.id || product.product_id} className="h-full">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default DashboardPage;