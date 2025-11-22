import Supabase from "./Database"; // Assuming 'Database' exports the Supabase client
import { FilteredListingsInterface, FilteredProductInterface, ProductListingInterface } from "./Interfaces";

/**
 * Defines the structure for the input parameters to the RPC.
 * NOTE: The backend RPC expects categoryIds and sellerIds as text[] (string[] in JS).
 */
export interface FilterInterface {
    searchTerm?: string;
    distFrom?: { lat: number, lng: number };
    productId?: string;
    minPrice?: number;
    maxPrice?: number;
    maxDist?: number;
    categoryIds?: string[]; // Corresponds to category_ids_param (text[] in SQL)
    sellerIds?: string[];   // Corresponds to seller_ids_param (text[] in SQL)
    orderBy?: 'relevance' | 'price' | 'distance'; // Corresponds to order_by_param (text in SQL)
    priceAsc?: boolean;
    limit?: number;
}

export async function getFilteredListings(filters: FilterInterface) {
    // --- Prepare RPC Arguments ---
    // The RPC expects all parameters to be passed in the correct order/key.
    // Use null for undefined parameters, as the SQL function uses 'DEFAULT NULL'.
    const rpcArgs = {
        search_term: filters.searchTerm,
        target_lat: filters.distFrom?.lat ?? undefined, 
        target_long: filters.distFrom?.lng ?? undefined,
        product_id_param: filters.productId,
        min_price_param: filters.minPrice,
        max_price_param: filters.maxPrice,
        max_distance_param: filters.maxDist,
        category_ids_param: filters.categoryIds, 
        seller_ids_param: filters.sellerIds,
        order_by_param: filters.orderBy,
        price_asc_param: filters.priceAsc,
        limit_param: filters.limit,
    };

    // --- Execute RPC ---
    const { data, error } = await Supabase.rpc('get_filtered_products', rpcArgs);

    if(error) {
        console.error("Error getting products", error);
        return null;
    }
    else {

        return data;
    }

}

export function groupListingsByProduct(listings: FilteredListingsInterface[]): FilteredProductInterface[] {

    // 1. Group the listings by product_id using a Map
    const productMap = new Map<string, {
        data: Omit<FilteredProductInterface, 'listings' | 'minDist' | 'minPrice' | 'avgPrice' | 'maxPrice'> & { total_price: number, count: number },
        listings: ProductListingInterface[],
        minDistance: number,
        minPrice: number,
        maxPrice: number,
    }>();

    for (const item of listings) {
        const {
            product_id, product_name, product_description, product_image_url, category_ids, relevance_score,
            listing_id, price, stock, distance_km,
            seller_id, seller_name, seller_role
        } = item;
        
        // Assemble the nested listing object
        const listing: ProductListingInterface = {
            listing_id,
            price,
            stock,
            distance: distance_km,
            seller: {
                id: seller_id,
                name: seller_name,
                role: seller_role,
            }
        };

        if (productMap.has(product_id)) {
            // --- Update existing product group ---
            const existing = productMap.get(product_id)!;
            
            existing.listings.push(listing);
            existing.data.total_price += price;
            existing.data.count += 1;
            existing.minDistance = Math.min(existing.minDistance, distance_km);
            existing.minPrice = Math.min(existing.minPrice, price);
            existing.maxPrice = Math.max(existing.maxPrice, price);

        } else {
            // --- Create new product group ---
            productMap.set(product_id, {
                data: {
                    id: product_id,
                    name: product_name,
                    description: product_description,
                    imageURL: product_image_url,
                    categoryIDs: category_ids,
                    relevance: relevance_score,
                    total_price: price,
                    count: 1,
                },
                listings: [listing],
                minDistance: distance_km,
                minPrice: price,
                maxPrice: price,
            });
        }
    }

    // 2. Map the grouped values into the final FilteredProducts structure
    return Array.from(productMap.values()).map(grouped => {
        const { data, listings, minDistance, minPrice, maxPrice } = grouped;

        return {
            id: data.id,
            name: data.name,
            description: data.description,
            imageURL: data.imageURL,
            categoryIDs: data.categoryIDs,
            relevance: data.relevance,
            minDist: minDistance,
            minPrice: minPrice,
            avgPrice: data.total_price / data.count, 
            maxPrice: maxPrice,
            listings: listings,
        };
    });
}