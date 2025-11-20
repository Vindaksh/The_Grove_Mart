import Supabase from "./Database";

/* -----------------------------
   1. Create Order (returns new order_id)
--------------------------------*/
export async function createOrder(buyerId, paymentId, address) {
    const { data, error } = await Supabase
        .from("orders")
        .insert([
            {
                buyer_id: buyerId,
                payment_id: paymentId,
                address1: address.address1,
                address2: address.address2,
                city: address.city,
                pincode: address.pincode,
                country: address.country
            }
        ])
        .select()
        .single();

    if (error) {
        console.error("Error creating order:", error);
        return null;
    }

    return data;
}


/* -----------------------------
   2. Insert order_items
--------------------------------*/
export async function addOrderItems(orderId, cartItems) {
    const itemsToInsert = cartItems.map(item => ({
        order_id: orderId,
        listing_id: item.product_listings.product_listings_id,
        name: item.product_listings.products.name,
        price: item.product_listings.price,
        quantity: item.quantity,
        order_status: "pending"
    }));

    const { error } = await Supabase
        .from("order_items")
        .insert(itemsToInsert);

    if (error) {
        console.error("Error adding order items:", error);
        return false;
    }

    return true;
}

/* -----------------------------
   3. Create Payment Record
--------------------------------*/
export async function createPayment(total) {
    const { data, error } = await Supabase
        .from("payments")
        .insert([
            {
                amount: total,
                is_offline: true
            }
        ])
        .select()
        .single();

    if (error) {
        console.error("Payment error:", error);
        return null;
    }

    return data;
}

/* -----------------------------
   4. Create reimbursements for each retailer
--------------------------------*/
export async function createReimbursements(cartItems, orderId) {
    const reimburseList = cartItems.map(item => ({
        seller_id: item.product_listings.seller_id,
        amount: item.product_listings.price * item.quantity,
        reimbursed: false
    }));

    const { error } = await Supabase
        .from("reimbursements")
        .insert(reimburseList);

    if (error) {
        console.error("Reimbursement error:", error);
        return false;
    }

    return true;
}

/* -----------------------------
   5. Update stock
--------------------------------*/
export async function decrementStock(cartItems) {
    for (const item of cartItems) {
        const newStock = item.product_listings.stock - item.quantity;

        await Supabase
            .from("product_listings")
            .update({ stock: newStock })
            .eq("product_listings_id", item.product_listings.product_listings_id);
    }
}

/* -----------------------------
   6. Clear cart
--------------------------------*/
export async function clearUserCart(userId) {
    const cartRes = await Supabase
        .from("carts")
        .select("cart_id")
        .eq("user_id", userId)
        .single();

    if (!cartRes.data) return;

    await Supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cartRes.data.cart_id);
}
