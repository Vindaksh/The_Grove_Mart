import React, { useState, useEffect } from 'react';
import { getAllProducts } from '../utils/Database';
import ProductCard from '../components/ProductCard';

function WholesaleMarket() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            const productData = await getAllProducts();
            if (productData) setProducts(productData);
            setLoading(false);
        };
        fetchProducts();
    }, []);

    return (
        <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-3xl font-extrabold text-slate-900">Wholesale Market</h1>
                <p className="text-slate-500 mt-2">Restock your inventory directly from top suppliers.</p>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-400 animate-pulse">Loading market data...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        // Reusing our cute ProductCard component
                        <div key={product.id} className="h-full">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default WholesaleMarket;