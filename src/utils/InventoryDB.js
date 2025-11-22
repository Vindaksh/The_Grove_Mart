import Supabase from "./Database";

// 1. Fetch all listings for the logged-in retailer
export async function getRetailerListings(userId) {
    const { data, error } = await Supabase
        .from('product_listings')
        .select(`
            product_listings_id,
            price,
            stock,
            product:products (
                product_id,
                name,
                image_url,
                description
            )
        `)
        .eq('seller_id', userId);

    if (error) {
        console.error("Error fetching listings:", error);
        return [];
    }
    return data;
}

// 2. Search the Master Product Database
export async function searchMasterProducts(query) {
    const { data, error } = await Supabase
        .from('products')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(5);

    if (error) return [];
    return data;
}

// 3. Create a Listing for an EXISTING Product
export async function createListingForExisting(userId, productId, price, stock) {
    const { data, error } = await Supabase
        .from('product_listings')
        .insert([{
            seller_id: userId,
            product_id: productId,
            price: parseFloat(price),
            stock: parseInt(stock)
        }])
        .select()
        .single();

    return { data, error };
}

// 4. Create a NEW Product AND a Listing (Transaction-like)
export async function createNewProductAndListing(userId, productData, price, stock) {
    // A. Insert Product
    const { data: product, error: prodError } = await Supabase
        .from('products')
        .insert([{
            name: productData.name,
            description: productData.description,
            image_url: productData.image_url
        }])
        .select()
        .single();

    if (prodError) return { error: prodError };

    // B. Insert Listing linked to that new Product
    const { data: listing, error: listError } = await Supabase
        .from('product_listings')
        .insert([{
            seller_id: userId,
            product_id: product.product_id,
            price: parseFloat(price),
            stock: parseInt(stock)
        }])
        .select()
        .single();

    return { data: listing, error: listError };
}

// 5. Update an existing listing (Price/Stock only)
export async function updateListing(listingId, updates) {
    const { data, error } = await Supabase
        .from('product_listings')
        .update(updates)
        .eq('product_listings_id', listingId)
        .select();

    return { data, error };
}

// 6. Delete a listing
export async function deleteListing(listingId) {
    const { error, count } = await Supabase
        .from('product_listings')
        .delete({ count: 'exact' }) // Request the count of deleted rows
        .eq('product_listings_id', listingId);

    return { error, count };
}

// 7. Adjust Stock (Decrement on buy, Increment on cancel)
export async function adjustListingStock(listingId, adjustment) {
    // 1. Get current stock
    const { data: current, error: fetchError } = await Supabase
        .from('product_listings')
        .select('stock')
        .eq('product_listings_id', listingId)
        .single();

    if (fetchError) {
        console.error("Stock fetch failed:", fetchError);
        return { error: fetchError };
    }

    const newStock = current.stock + adjustment;

    // 2. Update with new stock (prevent going below 0)
    const { data, error } = await Supabase
        .from('product_listings')
        .update({ stock: Math.max(0, newStock) })
        .eq('product_listings_id', listingId)
        .select();

    return { data, error };
}

// 8. Check if stock is sufficient
export async function checkStockAvailability(listingId, requiredQty) {
    const { data, error } = await Supabase
        .from('product_listings')
        .select('stock')
        .eq('product_listings_id', listingId)
        .single();

    if (error) {
        console.error("Stock check failed:", error);
        return false;
    }

    return data.stock >= requiredQty;
}