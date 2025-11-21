import Supabase from "./Database";

/* -----------------------------
   1. Create Order (returns new order_id)
--------------------------------*/
export async function createOrder(buyer, payment, address) {
    // Ensure we handle the case where Supabase RPC expects specific JSON structure
    const { data, error } = await Supabase.rpc("checkout_json", {
        data: {
            uid: buyer.id,
            ...payment,
            ...address
        }
    })
        .select()
        .maybeSingle();

    if (error) {
        console.error("Error creating order:", error);
        return null;
    }
    console.log("Order Created:", data);

    return data;
}

/* -----------------------------
   2. Make Payment (Mock function)
--------------------------------*/
export const completePayment = async (total) => {
    console.log(`Processing payment for amount: ${total}`);

    // Simulating a successful payment response
    const payment = {
        payment_ref: "OFFLINE_REF_" + Math.floor(Math.random() * 10000),
        payment_mode: "offline"
    };
    return payment;
}