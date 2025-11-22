import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getUserDetails } from "../utils/Database";
import {
    getCartItems,
    updateCartQuantity,
    clearCart as clearCartDB,
    upsertCart
} from "../utils/CartDB";
import Supabase from "../utils/Database";

import { ListingInterface, CartItemInterface, UserInterface } from "../utils/Interfaces";
import { useAuth } from "./AuthContext";

interface CartContextInterface{
    cartItems: CartItemInterface[];
    totalPrice: number;
    addToCart: (listingId: string) => Promise<void>;
    removeFromCart: (item: CartItemInterface) => Promise<void>;
    updateQuantity: (item: CartItemInterface, newQty: number) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: (user: UserInterface) => Promise<void>;
}
const CartContext = createContext<CartContextInterface>({
    cartItems: [],
    totalPrice: 0,
    addToCart: async (listing)=>{},
    removeFromCart: async (item)=>{},
    updateQuantity: async (item)=>{},
    clearCart: async ()=>{},
    refreshCart: async (user)=>{}
});

export function useCart() {
    return useContext(CartContext);
}

export const CartProvider:  React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState<CartItemInterface[]>([]);
    const [totalPrice, setTotalPrice] = useState(0);

    // -------------------------------------------------
    // Load user + cart on startup
    // -------------------------------------------------
    useEffect(() => {
        const loadCart = async () => {
            if(!user) return;

            const items = await getCartItems(user.id);
            setCartItems(items);
        };

        loadCart();
    }, [user]);

    // -------------------------------------------------
    // Recalculate total price anytime cart changes
    // -------------------------------------------------
    useEffect(() => {
        const total = cartItems.reduce((sum, item) => {
            const listing = item.listing;
            return sum + listing.price * item.quantity;
        }, 0);

        setTotalPrice(total);
    }, [cartItems]);

    // -------------------------------------------------
    // Add item to cart
    // -------------------------------------------------
    const addToCart = async (listingId: string) => {
    if (!user) {
        alert("Please sign in to add to cart.");
        return;
    }

    const {data:addedItem, error} = await upsertCart(user.id, listingId);
    if (!addedItem) {
        console.error("failed to add item to cart", error);
        return;
    }

    // Reload cart
    const items = await getCartItems(user.id);
    setCartItems(items);
};


    // -------------------------------------------------
    // Remove an item
    // -------------------------------------------------
    const removeFromCart = async (item: CartItemInterface) => {
        const { error } = await Supabase.from("cart_items1")
            .delete()
            .eq("cart_item_id", item.cart_item_id);

        if(error) console.error(error);

        const items = await getCartItems(user!.id);
        setCartItems(items);
    };


    // -------------------------------------------------
    // Update quantity
    // -------------------------------------------------
    const updateQuantity = async (item: CartItemInterface, newQty: number) => {
        if (newQty < 1) {
            await removeFromCart(item);
            return;
        }

        await updateCartQuantity(item, newQty);

        const items = await getCartItems(user!.id);
        setCartItems(items);
    };

    // -------------------------------------------------
    // Clear cart
    // -------------------------------------------------
    const clearCart = async () => {
        if (!user) return;

        await clearCartDB(user);

        setCartItems([]);
    };

    const value = {
        cartItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart: async () => {
            const items = await getCartItems(user!.id);
            setCartItems(items);
        }
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}
