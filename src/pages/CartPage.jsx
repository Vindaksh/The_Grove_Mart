import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import './CartPage.css';

function CartPage() {
    const { cartItems, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart();

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="cart-empty">
                <h1>Your Cart is Empty</h1>
                <p>Looks like you haven't added anything to your cart yet.</p>
                <Link to="/dashboard" className="cart-checkout-btn">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <h1>Your Shopping Cart</h1>

            <div className="cart-items-list">
                {cartItems.map(item => {
                    const listing = item.product_listings;
                    const product = listing.products;

                    return (
                        <div key={item.cart_item_id} className="cart-item">
                            
                            {/* PRODUCT IMAGE */}
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="cart-item-image"
                            />

                            {/* PRODUCT DETAILS */}
                            <div className="cart-item-details">
                                <h3>{product.name}</h3>
                                <p>₹{listing.price}</p>

                                {/* Seller Name */}
                                <p className="cart-seller">
                                    Sold by: {listing.seller?.name ?? "Unknown Seller"}
                                </p>
                            </div>

                            {/* ACTIONS */}
                            <div className="cart-item-actions">
                                <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) =>
                                        updateQuantity(item.cart_item_id, e.target.value)
                                    }
                                    className="cart-item-quantity"
                                />

                                <button
                                    onClick={() => removeFromCart(item.cart_item_id)}
                                    className="cart-item-remove-btn"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* SUMMARY */}
            <div className="cart-summary">
                <h2>Total: ₹{totalPrice.toFixed(2)}</h2>

                <div className="cart-summary-buttons">
                    {/* ✔ Clear Cart Button */}
                    <button
                        className="cart-clear-btn"
                        onClick={() => {
                            if (window.confirm("Are you sure you want to clear your cart?")) {
                                clearCart();
                            }
                        }}
                    >
                        Clear Cart
                    </button>

                    <Link to="/checkout" className="cart-checkout-btn">
                        Proceed to Checkout
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default CartPage;
