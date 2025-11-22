import React, { useEffect, useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import {
    createOrder,
    completePayment
} from "../utils/OrderDB";
import { useAuth } from '../context/AuthContext';
import { getSavedAddresses, saveAddressForUser } from "../utils/AdressDB";
import { MapPin, CreditCard, Truck, AlertCircle, ArrowLeft, Plus, X } from 'lucide-react';
import { AddressInterface, SavedAddressInterface } from '../utils/Interfaces';
import { GeoPickerMap, LocationInterface, StaticLocationMap } from '../components/GeoPickerMap';

// Define an extended interface for a user's selected address (either saved or newly picked)
interface SelectedAddress extends LocationInterface {
    address_id?: string | null; // Null if newly picked, ID if saved
    formatted_address: string;
}

// Define possible map states
type MapMode = 'picker' | 'viewer' | null;
const MAP_HEIGHT = 'max-h-[350px]';

function CheckoutPage() {
    const { cartItems, totalPrice, refreshCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Replaced all individual address fields with a single location object state
    const [selectedLocation, setSelectedLocation] = useState<SelectedAddress | null>(null);

    // State for managing saved addresses and selection
    const [savedAddresses, setSavedAddresses] = useState<SavedAddressInterface[]>([]);
    const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string | null>(null);

    // State for controlling map UI
    const [activeMapMode, setActiveMapMode] = useState<MapMode>(null);

    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [loading, setLoading] = useState(false);

    // --- Data Loading Effect ---
    useEffect(() => {
        const loadAddresses = async () => {
            if (!user) return;
            setLoading(true);
            const list = await getSavedAddresses(user);
            setSavedAddresses(list || []);
            setLoading(false);

            // Auto-select the first address if available
            if (list && list.length > 0) {
                setSelectedSavedAddressId(list[0].address_id!);
            }
        };
        loadAddresses();
    }, [user]);

    // --- Effect to sync selected saved address to selectedLocation state ---
    useEffect(() => {
        if (!selectedSavedAddressId || savedAddresses.length === 0) {
            // Only clear the location if we explicitly deselected (i.e. selectedSavedAddressId is null)
            if (selectedSavedAddressId === null) {
                setSelectedLocation(null);
            }
            return;
        }

        const addr = savedAddresses.find(a => a.address_id === selectedSavedAddressId);
        if (!addr) return;

        // Map the saved address to the standardized LocationInterface
        setSelectedLocation({
            address_id: addr.address_id,
            lat: addr.lat,
            lng: addr.lng,
            formatted_address: addr.formatted_address
        });

    }, [selectedSavedAddressId, savedAddresses]);

    // Handler when a location is picked on the GeoPickerMap
    const handleLocationPicked = (location: LocationInterface) => {
        const shouldSave = true;
        setActiveMapMode(null); // Switch back to main view

        const f = async () => {
            let addressID: string | undefined = undefined;

            if (user && shouldSave) {
                // Save the new address to the user's saved list
                try {
                    const savedAddr = await saveAddressForUser(user, location);
                    addressID = savedAddr?.address_id;
                    // Reload addresses list to show the new one
                    const list = await getSavedAddresses(user);
                    setSavedAddresses(list || []);
                    setSelectedSavedAddressId(addressID || null);
                } catch (err) {
                    console.warn('Failed to save address', err);
                }
            }

            // Set the final selected address for checkout
            setSelectedLocation({
                ...location,
                address_id: addressID // Use the new ID if saved, otherwise undefined
            });
        };

        f();
    };

    const handleSubmitOrder = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        if (!user) {
            alert("You must be logged in.");
            setLoading(false);
            return;
        }
        if (!selectedLocation) {
            alert("Please select a shipping location.");
            setLoading(false);
            return;
        }

        const payment = await completePayment(totalPrice);
        if (!payment) {
            alert("Payment creation failed.");
            setLoading(false);
            return;
        }

        // The address object structure must now match the new location structure
        const addressData = {
            formatted_address: selectedLocation.formatted_address,
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
            address_id: selectedLocation.address_id || null
        };

        // 1. Create the Order
        const order = await createOrder(user, payment, addressData);

        if (!order) {
            alert("Order creation failed.");
            setLoading(false);
            return;
        }

        // 3. Finalize
        await refreshCart(user);
        navigate("/order-success", { state: { orderId: order.order_id } });
        setLoading(false);
    };


    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-rose-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Your Cart is Empty</h2>
                    <p className="text-slate-500">Add some items before checking out.</p>
                </div>
            </div>
        );
    }

    // Simple helper to render the selected address
    const CurrentAddressCard = useMemo(() => {
        if (!selectedLocation) {
            return null;
        }

        return (
            <div className={`p-4 rounded-2xl border transition-all ${selectedLocation.address_id ? 'border-blue-300 bg-blue-50' : 'border-rose-300 bg-rose-50'}`}>
                <div className="flex items-start justify-between">
                    <div className='flex-1 pr-4'>
                        <p className="font-bold text-slate-800 mb-1">
                            {selectedLocation.address_id ? 'Saved Address' : 'Temporary Address'}
                        </p>
                        <p className="text-sm text-slate-600">{selectedLocation.formatted_address}</p>
                    </div>
                    {/* Button to change or view the address */}
                    <button
                        type="button"
                        onClick={() => setActiveMapMode('picker')}
                        className="text-sm text-rose-600 font-bold hover:text-rose-700 transition-colors py-1 px-3 bg-white rounded-lg border border-rose-200"
                    >
                        Use a new address instead
                    </button>
                </div>
                {/* Static map viewer for confirmation */}
                <div className={`${MAP_HEIGHT} mt-4 rounded-xl overflow-hidden shadow-md border border-slate-100`}>
                    <StaticLocationMap
                        location={selectedLocation}
                    />
                </div>
            </div>
        )
    }, [selectedLocation]);


    return (
        <div className="min-h-screen bg-rose-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                {/* BACK BUTTON */}
                <button
                    onClick={() => navigate('/cart')}
                    className="flex items-center gap-2 text-slate-500 hover:text-rose-600 font-bold mb-6 transition-colors group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Cart
                </button>

                <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Secure Checkout</h1>

                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">

                    {/* LEFT COLUMN: Forms */}
                    <div className="lg:col-span-7">
                        <form onSubmit={handleSubmitOrder}>

                            {/* Address Section */}
                            <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-6 sm:p-8 mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-rose-100 rounded-full text-rose-600">
                                        <MapPin size={24} />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800">Shipping Location</h2>
                                </div>

                                {/* ⭐ FIXED: Saved Addresses Dropdown (RENDERED UNCONDITIONALLY) */}
                                <div className="mb-6 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                    <label className="block text-sm font-bold text-blue-800 mb-2">Load Saved Address</label>
                                    <select
                                        className="block w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={selectedSavedAddressId || ''}
                                        onChange={(e) => {
                                            setSelectedSavedAddressId(e.target.value || null);
                                            // Reset map view to default when a saved address is selected
                                            setActiveMapMode(null);
                                        }}
                                    >
                                        <option value="">-- Select saved address or add new --</option>
                                        {savedAddresses.map(addr => (
                                            <option key={addr.address_id} value={addr.address_id!}>
                                                {addr.formatted_address}
                                            </option>
                                        ))}
                                    </select>
                                </div>


                                {/* Current Selected Address Viewer (Visible if a location is selected AND the map picker is NOT active) */}
                                {selectedLocation && activeMapMode !== 'picker' && (
                                    <div className='mb-6'>
                                        {CurrentAddressCard}
                                    </div>
                                )}

                                {/* Add New Address Button (Visible if no location is selected AND the map picker is NOT active) */}
                                {!selectedLocation && activeMapMode !== 'picker' && (
                                    <button
                                        type='button'
                                        onClick={() => setActiveMapMode('picker')}
                                        className="w-full py-5 border-2 border-dashed border-rose-200 rounded-2xl text-rose-500 hover:bg-rose-50 transition-colors flex flex-col items-center justify-center gap-1"
                                    >
                                        <Plus size={24} />
                                        <p className="font-bold text-sm">Select Location on Map</p>
                                    </button>
                                )}

                                {/* GeoPickerMap (Only appears when activeMapMode is 'picker') */}
                                {activeMapMode === 'picker' && (
                                    <div className="border border-slate-200 rounded-2xl overflow-hidden p-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-md font-bold text-slate-800">
                                                Pick Location
                                            </h3>
                                            <button
                                                type='button'
                                                onClick={() => setActiveMapMode(null)}
                                                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                        <GeoPickerMap
                                            onLocationPicked={handleLocationPicked}
                                            submitText="Use This Location"
                                            successText="Location Selected"
                                        />
                                    </div>
                                )}

                                {/* Error message if no location selected */}
                                {!selectedLocation && activeMapMode !== 'picker' && (
                                    <p className="mt-4 text-sm text-red-500 font-medium flex items-center gap-1">
                                        <AlertCircle size={16} /> Please select a location to proceed.
                                    </p>
                                )}
                            </div>

                            {/* Payment Section (Unchanged) */}
                            <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-6 sm:p-8 mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-green-100 rounded-full text-green-600">
                                        <CreditCard size={24} />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800">Payment Method</h2>
                                </div>

                                <div className="space-y-3">
                                    <label className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-rose-500 bg-rose-50 ring-1 ring-rose-500' : 'border-slate-200 hover:border-rose-300'}`}>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="cod"
                                                checked={paymentMethod === 'cod'}
                                                onChange={() => setPaymentMethod('cod')}
                                                className="w-5 h-5 text-rose-600 focus:ring-rose-500"
                                            />
                                            <div className="flex items-center gap-2">
                                                <Truck size={20} className="text-slate-500" />
                                                <span className="font-bold text-slate-700">Cash on Delivery</span>
                                            </div>
                                        </div>
                                    </label>

                                    <label className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl opacity-60 cursor-not-allowed bg-slate-50">
                                        <div className="flex items-center gap-3">
                                            <input type="radio" name="payment" disabled />
                                            <span className="font-bold text-slate-500">Online Payment (Coming Soon)</span>
                                        </div>
                                        <AlertCircle size={18} className="text-slate-400" />
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !selectedLocation || activeMapMode === 'picker'} // Also disable if map picker is open
                                className="w-full py-4 px-6 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-lg rounded-2xl shadow-lg shadow-rose-200 transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
                            >
                                {loading ? 'Processing...' : `Confirm Order for ₹${totalPrice.toFixed(2)}`}
                            </button>
                        </form>
                    </div>

                    {/* RIGHT COLUMN: Order Summary (Unchanged) */}
                    <div className="lg:col-span-5 mt-8 lg:mt-0">
                        <div className="bg-white rounded-3xl shadow-xl shadow-rose-100/50 border border-rose-100 p-6 sm:p-8 sticky top-24">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">Order Summary</h2>

                            <ul className="space-y-4 mb-6 max-h-96 overflow-auto pr-2 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <li key={item.cart_item_id} className="flex justify-between text-sm">
                                        <span className="text-slate-600 flex-1 pr-4">
                                            <span className="font-bold text-slate-900">{item.quantity}x</span> {item.listing.productInfo.name}
                                        </span>
                                        <span className="font-bold text-slate-900 whitespace-nowrap">
                                            ₹{(item.listing.price * item.quantity).toFixed(2)}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <div className="border-t border-slate-100 pt-4 space-y-2">
                                <div className="flex justify-between text-slate-500">
                                    <span>Subtotal</span>
                                    <span>₹{totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>Delivery Fee</span>
                                    <span className="text-green-600 font-bold">Free</span>
                                </div>
                                <div className="flex justify-between text-xl font-extrabold text-slate-900 pt-4 border-t border-slate-100 mt-4">
                                    <span>Total</span>
                                    <span>₹{totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPage;