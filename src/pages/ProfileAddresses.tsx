import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, MapPin, Trash2, Globe, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GeoPickerMap, LocationInterface, OnLocationPicedInterface, StaticLocationMap } from '../components/GeoPickerMap';
import { deleteSavedAddress, getSavedAddresses, saveAddressForUser } from "../utils/AdressDB";
import { SavedAddressInterface } from "../utils/Interfaces";

// Define possible map states
type MapMode = 'picker' | 'viewer' | null;

// Define CSS class constants
const TRANSITION_DURATION = 500; // Define duration for cleaner code, matching CSS duration-500
const MAX_GROWTH_HEIGHT = 'max-h-[60rem]'; 
const MAP_INLINE_HEIGHT = 'max-h-[450px]'; // Sufficient height for the map viewer

export const ProfileAddressesPage = () => {
    const { user, loading: userLoading } = useAuth(); 
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [addresses, setAddresses] = useState<SavedAddressInterface[]>([]);

    // STATE TO CONTROL WHICH MAP IS ACTIVE
    const [activeMapMode, setActiveMapMode] = useState<MapMode>(null);
    
    // Tracks the ID of the address currently being viewed
    const [viewingAddressId, setViewingAddressId] = useState<string | null>(null);
    
    // Track if the picker content should be mounted (used to ensure it unmounts after collapse)
    const [isPickerContentMounted, setIsPickerContentMounted] = useState(false);
    
    // EFFECT: Controls picker content mounting/unmounting
    useEffect(() => {
        if (activeMapMode === 'picker') {
            setIsPickerContentMounted(true);
        } else if (isPickerContentMounted) {
            // Unmount content only AFTER the transition has completed (500ms duration)
            const timer = setTimeout(() => {
                 setIsPickerContentMounted(false);
            }, TRANSITION_DURATION); 
            return () => clearTimeout(timer);
        }
    }, [activeMapMode, isPickerContentMounted]);


    // --- DATA HANDLING ---
    const loadAddresses = async () => {
        try {
            // Ensure user object exists before making the database call
            if (!user) return; 
            const addressesData = await getSavedAddresses(user!);
            setAddresses(addressesData);
        } catch (error) {
            console.error("Failed to load addresses:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(()=> {
        if (user && !userLoading) {
             setLoading(true);
             loadAddresses();
        }
    }, [user, userLoading])

    const handleLocationPicked: OnLocationPicedInterface = (location) => {
        setLoading(true);
        const f = async () => {
            // Ensure user object exists before making the database call
            if (!user) return; 
            await saveAddressForUser(user!, location);
            setActiveMapMode(null);
            await loadAddresses();
        }
        f();
    };

    const handleDeleteAddress = (address_id:string) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;
        setLoading(true);
        const f = async () => {
            await deleteSavedAddress(address_id);
            // Close viewer if the deleted address was the one being viewed
            if (address_id === viewingAddressId) {
                 setViewingAddressId(null);
                 setActiveMapMode(null);
            }
            await loadAddresses();
        }
        f();
    }
    
    // Handler for viewing an address (sets state to 'viewer')
    const handleViewAddress = (addr: SavedAddressInterface) => {
        // If already viewing this address, close the viewer
        if (addr.address_id === viewingAddressId && activeMapMode === 'viewer') {
            setActiveMapMode(null);
            setViewingAddressId(null);
            return;
        }

        // Set the active mode and ID
        setViewingAddressId(addr.address_id || null);
        setActiveMapMode('viewer');
        
        // Scroll to the element after a small delay to allow transition to start
        setTimeout(() => {
            document.getElementById(`addr-${addr.address_id}`)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
    
    // Function to close the map viewer gracefully
    const handleCloseMap = () => {
        setActiveMapMode(null);
        // Delay clearing the ID to allow the item to shrink first
        setTimeout(() => setViewingAddressId(null), 500);
    }


    // --- RENDERING ---
    return (

        <div className="space-y-8 animate-fade-in max-w-2xl mx-auto py-12">

            {/* BACK BUTTON */}
            <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 text-slate-500 hover:text-rose-600 font-bold transition-colors group"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Profile
            </button>


            <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Saved Addresses</h2>
                <p className="text-slate-500">Manage your shipping locations.</p>
            </div>

            {/* Address List & Add Button Box */}
            {loading ? (
                <div className="text-center py-10 text-rose-400 font-medium animate-pulse">Loading addresses...</div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    
                    {/* SAVED ADDRESSES GRID ITERATION - RENDERED FIRST */}
                    {addresses.map(addr => {
                        const isViewing = activeMapMode === 'viewer' && viewingAddressId === addr.address_id;
                        const addressLocation: LocationInterface = {
                            lat: addr.lat,
                            lng: addr.lng,
                            formatted_address: addr.formatted_address
                        };

                        return (
                            <div 
                                key={addr.address_id}
                                id={`addr-${addr.address_id}`}
                                className={`
                                    bg-white rounded-[2rem] shadow-sm border border-rose-100 transition-all duration-500 ease-in-out
                                    ${isViewing ? 'shadow-xl shadow-rose-100/50' : 'hover:shadow-md'}
                                    ${isViewing ? MAP_INLINE_HEIGHT : 'max-h-64'} 
                                    ${isViewing ? 'p-0 overflow-hidden' : 'p-6 overflow-visible'}
                                `}
                            >
                                {/* Standard Address Card Content (Hidden when viewing map) */}
                                {!isViewing && (
                                    <div className="p-0"> {/* Use p-0 here, padding is handled in the outer container when not viewing */}
                                        <div className="flex items-start gap-3 p-0">
                                            <div className="mt-1 p-2 bg-rose-50 rounded-xl text-rose-500">
                                                <MapPin size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-slate-800">{addr.formatted_address}</p>
                                            </div>
                                        </div>
                                        
                                        {/* ACTION BUTTONS (Visible when not viewing map) */}
                                        <div className="flex gap-2 mt-6 justify-end">
                                            <button 
                                                onClick={() => handleViewAddress(addr)} 
                                                className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-1"
                                            >
                                                <Globe size={16} /> View Map
                                            </button>
                                            <button onClick={() => handleDeleteAddress(addr.address_id!)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Map Viewer Content (Visible when viewing map) */}
                                {isViewing && (
                                    <div className="p-8">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                <MapPin size={20} className="text-rose-500" />
                                                Viewing Address Location
                                            </h3>
                                            <button 
                                                onClick={handleCloseMap} 
                                                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                        {/* Pass the static location data */}
                                        <StaticLocationMap location={addressLocation} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    
                    {/* ADD NEW ADDRESS BOX / IN-PLACE PICKER CONTAINER - RENDERED LAST */}
                    <div 
                        className={`
                            bg-white rounded-[2rem] shadow-sm transition-all duration-500 ease-in-out
                            ${activeMapMode === 'picker' 
                                ? 'shadow-xl shadow-rose-100/50 border border-rose-100'
                                : 'border-2 border-dashed border-rose-200 cursor-pointer hover:bg-rose-50'
                            }
                            ${activeMapMode === 'picker' ? `${MAX_GROWTH_HEIGHT}` : 'max-h-32'} 
                            overflow-hidden
                        `}
                        onClick={activeMapMode === 'picker' ? undefined : () => setActiveMapMode('picker')}
                    >
                        {/* 🎯 CHANGE 1: Use a flex column layout for centering the icon and text */}
                        {/* 🎯 CHANGE 2: Add 'invisible' class when not active to hide contents during transition */}
                        {activeMapMode !== 'picker' && (
                            <div className={`h-full flex flex-col items-center justify-center text-center text-rose-500 max-h-32 p-6 transition-opacity duration-300 ${activeMapMode === 'viewer' ? 'invisible opacity-0' : 'opacity-100'}`}>
                                <Plus size={32} className="mx-auto mb-2" />
                                {/* 🎯 CHANGE 1: Text is now naturally below the Plus icon */}
                                <p className="font-bold">Add New Address</p>
                            </div>
                        )}
                        {/* 🎯 CHANGE 2: Content should only be rendered when the mode is active AND mounted */}
                        {isPickerContentMounted && activeMapMode === 'picker' && (
                            <div className="p-8">
                                {/* Title and Close Button */}
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <MapPin size={20} className="text-rose-500" />
                                        Select New Address Location
                                    </h3>
                                    <button 
                                        onClick={() => setActiveMapMode(null)} 
                                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <GeoPickerMap onLocationPicked={handleLocationPicked} submitText="Save Address" successText="Saved Address Successfully"/>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileAddressesPage;