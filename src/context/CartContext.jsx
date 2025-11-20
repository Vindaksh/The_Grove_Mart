import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserDetails } from "../utils/Database";
import {
    getCartItems,
    addItemToCart,
    getOrCreateCart
} from "../utils/CartDB";
import Supabase from "../utils/Database";

const CartContext = createContext();

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }) {
    const [user, setUser] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [cartId, setCartId] = useState(null);
    const [totalPrice, setTotalPrice] = useState(0);

    // -------------------------------------------------
    // Load user + cart on startup
    // -------------------------------------------------
    useEffect(() => {
        const loadUserAndCart = async () => {
            const u = await getUserDetails();
            if (!u) return; // not logged in

            setUser(u);

            const cart = await getOrCreateCart(u.id);
            setCartId(cart.cart_id);

            const items = await getCartItems(u.id);
            setCartItems(items);
        };

        loadUserAndCart();
    }, []);

    // -------------------------------------------------
    // Recalculate total price anytime cart changes
    // -------------------------------------------------
    useEffect(() => {
        const total = cartItems.reduce((sum, item) => {
            const listing = item.product_listings;
            return sum + listing.price * item.quantity;
        }, 0);

        setTotalPrice(total);
    }, [cartItems]);

    // -------------------------------------------------
    // Add item to cart
    // -------------------------------------------------
    const addToCart = async (listing) => {
    if (!user) {
        alert("Please sign in to add to cart.");
        return;
    }

    if (!listing?.product_listings_id) {
        console.error("addToCart called without a valid listing:", listing);
        return;
    }

    const addedItem = await addItemToCart(user.id, listing.product_listings_id);
    if (!addedItem) return;

    // Reload cart
    const items = await getCartItems(user.id);
    setCartItems(items);
};


    // -------------------------------------------------
    // Remove an item
    // -------------------------------------------------
    const removeFromCart = async (cartItemId) => {
        if (!user) return;

        await Supabase.from("cart_items")
            .delete()
            .eq("cart_item_id", cartItemId);

        const items = await getCartItems(user.id);
        setCartItems(items);
    };

    // -------------------------------------------------
    // Update quantity
    // -------------------------------------------------
    const updateQuantity = async (cartItemId, newQty) => {
        const qty = parseInt(newQty, 10);
        if (qty < 1) {
            removeFromCart(cartItemId);
            return;
        }

        await Supabase.from("cart_items")
            .update({ quantity: qty })
            .eq("cart_item_id", cartItemId);

        const items = await getCartItems(user.id);
        setCartItems(items);
    };

    // -------------------------------------------------
    // Clear cart locally (checkout handles DB)
    // -------------------------------------------------
    const clearCart = () => {
        setCartItems([]);
    };

    const value = {
        cartItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}
