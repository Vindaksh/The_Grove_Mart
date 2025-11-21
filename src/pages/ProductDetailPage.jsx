import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../utils/Database";
import { useCart } from "../context/CartContext";
import { ShoppingCart, Package, Store, AlertCircle } from "lucide-react";

function ProductDetailPage() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const { addToCart } = useCart();
    const [selectedListing, setSelectedListing] = useState(null);

    useEffect(() => {
        const loadProduct = async () => {
            const data = await getProductById(productId);
            setProduct(data);

            if (data?.listings?.length > 0) {
                // Sort by price (cheapest first)
                const sorted = [...data.listings].sort((a, b) => a.price - b.price);
                setSelectedListing(sorted[0]);
            }
            setLoading(false);
        };
        loadProduct();
    }, [productId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-rose-50 text-rose-500 font-bold animate-pulse">
            Loading fresh details...
        </div>
    );

    if (!product) return (
        <div className="min-h-screen flex items-center justify-center bg-rose-50 text-slate-500">
            Product not found.
        </div>
    );

    const isInStock = selectedListing?.stock > 0;

    const handleSellerChange = (e) => {
        const listingId = e.target.value;
        const chosen = product.listings.find((l) => l.product_listings_id === listingId);
        setSelectedListing(chosen);
    };

    const handleAddToCart = () => {
        if (selectedListing) addToCart(selectedListing);
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-rose-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto bg-white rounded-[2rem] shadow-xl shadow-rose-100 overflow-hidden border border-rose-100">
                <div className="lg:grid lg:grid-cols-2 lg:gap-12">

                    {/* Left Column: Image */}
                    <div className="relative h-96 lg:h-full min-h-[400px] bg-rose-50/50 p-8 flex items-center justify-center">
                        <img
                            src={product.image_url || 'https://via.placeholder.com/500'}
                            alt={product.name}
                            className="max-h-full w-auto object-contain mix-blend-multiply drop-shadow-xl hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    {/* Right Column: Details */}
                    <div className="p-8 lg:p-12 flex flex-col">
                        <div className="mb-auto">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
                                {product.name}
                            </h1>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                {product.description || "Fresh, locally sourced, and ready for delivery directly to your doorstep."}
                            </p>

                            {/* Stock Status Badge */}
                            <div className="flex items-center gap-2 mb-8">
                                {isInStock ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold">
                                        <Package size={16} /> In Stock
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-bold">
                                        <AlertCircle size={16} /> Out of Stock
                                    </span>
                                )}
                                {selectedListing && (
                                    <span className="text-sm text-slate-400">
                                        ({selectedListing.stock} units available)
                                    </span>
                                )}
                            </div>

                            {/* Seller Selection */}
                            <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                                    <Store size={18} className="text-rose-500" />
                                    Choose your Seller
                                </label>
                                <div className="relative">
                                    <select
                                        className="block w-full pl-4 pr-10 py-3 text-base border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 sm:text-sm rounded-xl shadow-sm bg-white"
                                        value={selectedListing?.product_listings_id || ""}
                                        onChange={handleSellerChange}
                                    >
                                        {product.listings.map((l) => (
                                            <option key={l.product_listings_id} value={l.product_listings_id}>
                                                {l.seller?.name ?? "Unknown Seller"} — ₹{l.price}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Action Area */}
                        <div className="border-t border-slate-100 pt-8 mt-4">
                            <div className="flex items-end justify-between mb-6">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Total Price</p>
                                    <p className="text-4xl font-extrabold text-slate-900">
                                        ₹{selectedListing?.price || "0"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    className="flex-1 flex items-center justify-center gap-2 bg-rose-500 border border-transparent rounded-2xl py-4 px-8 text-lg font-bold text-white hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    disabled={!isInStock}
                                    onClick={handleAddToCart}
                                >
                                    <ShoppingCart size={20} />
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetailPage;