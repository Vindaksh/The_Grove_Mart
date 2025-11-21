import React, { useState, useEffect } from "react";
import { getAllProducts } from "../utils/Database";
import ProductCard from "../components/ProductCard";
import { Search } from "lucide-react";

function DashboardPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productData = await getAllProducts();
                // Safety check to ensure data is an array
                if (productData && Array.isArray(productData)) {
                    setProducts(productData);
                } else {
                    console.error("Invalid product data:", productData);
                    setProducts([]);
                }
            } catch (err) {
                console.error("Failed to fetch products:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Filter products based on search
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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