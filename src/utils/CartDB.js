import Supabase from "./Database";

// ---------------------------
// 1) Ensure the user has a cart
// ---------------------------
export async function getOrCreateCart(userId) {
    const { data: existing, error: findError } = await Supabase
        .from("carts")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

    if (findError) {
        console.error("Error finding cart:", findError);
        return null;
    }

    // Cart already exists
    if (existing) return existing;

    // Create a new cart
    const { data: created, error: createError } = await Supabase
        .from("carts")
        .insert([{ user_id: userId }])
        .select()
        .single();

    if (createError) {
        console.error("Error creating cart:", createError);
        return null;
    }

    return created;
}

// ---------------------------
// 2) Add an item to the cart
// ---------------------------
export async function addItemToCart(userId, productListingId) {
    // Step 1 — ensure cart exists
    const cart = await getOrCreateCart(userId);
    if (!cart) return null;

    // Step 2 — check if item already exists
    const { data: existingItem } = await Supabase
        .from("cart_items")
        .select("*")
        .eq("cart_id", cart.cart_id)
        .eq("product_listing_id", productListingId)
        .maybeSingle();

    if (existingItem) {
        // Increment quantity
        const { error: updateError } = await Supabase
            .from("cart_items")
            .update({ quantity: existingItem.quantity + 1 })
            .eq("cart_item_id", existingItem.cart_item_id);

        if (updateError) {
            console.error("Error updating cart item:", updateError);
            return null;
        }

        return { ...existingItem, quantity: existingItem.quantity + 1 };
    }

    // Step 3 — insert a new item
    const { data: newItem, error: insertError } = await Supabase
        .from("cart_items")
        .insert([
            {
                cart_id: cart.cart_id,
                product_listing_id: productListingId,
                quantity: 1
            }
        ])
        .select()
        .single();

    if (insertError) {
        console.error("Error adding new cart item:", insertError);
        return null;
    }

    return newItem;
}

// ---------------------------
// 3) Get all items in cart (for CartPage)
// ---------------------------
export async function getCartItems(userId) {
    const cart = await getOrCreateCart(userId);
    if (!cart) return [];

    const { data, error } = await Supabase
        .from("cart_items")
        .select(`
            cart_item_id,
            quantity,
            product_listings:product_listing_id (
                product_listings_id,
                price,
                stock,
                seller_id,
                retailers:seller_id (
                    name,
                    location
                ),
                products:product_id (
                    name,
                    image_url,
                    description
                )
            )
        `)
        .eq("cart_id", cart.cart_id);

    if (error) {
        console.error("Error fetching cart items:", error);
        return [];
    }

    return data;
}

