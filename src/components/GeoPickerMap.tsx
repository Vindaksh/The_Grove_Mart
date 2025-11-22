import { useEffect, useState, useRef } from "react";
import { AlertTriangle, Search } from "lucide-react";
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

// --- CONFIGURATION ---
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GMAP_KEY;
const MAP_LIBRARIES: ("geometry" | "core" | "maps" | "places" | "geocoding" | "routes" | "marker" | "elevation" | "streetView" | "journeySharing" | "drawing" | "visualization")[] = ['places'];
const DEFAULT_CENTER = { lat: 17.5454217, lng: 78.5705673 };

export type LocationInterface = { lat: number, lng: number, formatted_address: string };
export type OnLocationPicedInterface = (location: LocationInterface) => void;

interface GeoPickerMapProps {
    onLocationPicked: OnLocationPicedInterface;
    submitText: string;
    successText: string;
}

export const GeoPickerMap = ({ onLocationPicked, submitText, successText }: GeoPickerMapProps) => {

    const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const geocoderRef = useRef<google.maps.Geocoder | null>(null);
    const addressInputRef = useRef<HTMLInputElement>(null);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: MAP_LIBRARIES as never[],
    });

    // Initialize Geocoder
    useEffect(() => {
        if (isLoaded && !geocoderRef.current) {
            // @ts-ignore
            geocoderRef.current = new window.google.maps.Geocoder();
        }
    }, [isLoaded]);

    const resetForm = () => {
        setSelectedLocation(null);
        setStatusMessage(null);
        if (addressInputRef.current) {
            addressInputRef.current.value = "";
        }
    };

    // Function to parse place details and set location state
    const setLocationFromPlace = (place: google.maps.places.PlaceResult, lat: number, lng: number) => {
        setSelectedLocation({ lat, lng });

        const formattedAddress = place.formatted_address || "Coordinates set.";
        setStatusMessage({ type: 'success', message: `Location set: ${formattedAddress}` });

        if (addressInputRef.current) {
            addressInputRef.current.value = formattedAddress;
        }
    };

    const onPlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                setLocationFromPlace(place, lat, lng);
            } else {
                setStatusMessage({ type: 'error', message: "Selected place has no geographical coordinates. Try a more specific address." });
            }
        }
    };

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (!geocoderRef.current) {
            setStatusMessage({ type: 'error', message: "Map services are still loading. Please wait." });
            return;
        }

        const lat = e.latLng?.lat() ?? 0;
        const lng = e.latLng?.lng() ?? 0;
        const latLng = new window.google.maps.LatLng(lat, lng);

        geocoderRef.current.geocode({ location: latLng }, (results, status) => {
            if (status === window.google.maps.GeocoderStatus.OK && results?.[0]) {
                const place = results[0];
                setLocationFromPlace(place, lat, lng);
            } else {
                console.error('Geocoder failed due to: ' + status);
                setStatusMessage({ type: 'error', message: "Could not find a specific address for this location. Use the search bar for better results." });
            }
        });
    };

    // The submission handler now runs on a button click, no form event to prevent
    const handleSelectLocation = () => {

        if (!selectedLocation) {
            setStatusMessage({ type: 'error', message: "Please search or click on the map to select a location." });
            return;
        }

        const formattedAddress = statusMessage?.message.startsWith("Location set: ")
            ? statusMessage.message.substring("Location set: ".length)
            : addressInputRef.current?.value || "Address not fully resolved."; // Use input value as fallback

        onLocationPicked({
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
            formatted_address: formattedAddress
        });

        // Optionally show a temporary success message before the parent closes the map
        setStatusMessage({ type: 'success', message: successText });
    };

    return (
        // 🛑 Removed the <form> tag here!
        <div className="space-y-4">
            {/* Status Message */}
            {statusMessage && (
                <div className={`p-4 rounded-xl font-medium flex items-start gap-3 ${statusMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {statusMessage.type === 'error' && <AlertTriangle size={20} className="mt-0.5" />}
                    <p>{statusMessage.message}</p>
                </div>
            )}

            <div className="space-y-4"> {/* Used <div> instead of <form> */}

                {/* Location Search Bar (Autocomplete is now wrapped in a simple div) */}
                {isLoaded ? (
                    <div className="relative">
                        <Autocomplete
                            onLoad={(autocomplete) => { autocompleteRef.current = autocomplete; }}
                            onPlaceChanged={onPlaceChanged}
                            fields={["geometry.location", "formatted_address"]}
                        >
                            <div className="relative">
                                <input
                                    name="searchAddress"
                                    placeholder="Search for an Address or Landmark"
                                    ref={addressInputRef}
                                    required
                                    className="w-full p-4 pl-12 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all font-medium text-slate-800"
                                />
                                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        </Autocomplete>
                    </div>
                ) : (
                    <input
                        placeholder="Map Service Loading..."
                        disabled
                        className="w-full p-4 bg-slate-50 border border-transparent rounded-xl text-slate-500"
                    />
                )}

                {/* Google Map */}
                <div className="w-full h-80 rounded-xl overflow-hidden border-2 border-slate-200">
                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={{ width: "100%", height: "100%" }}
                            center={selectedLocation || DEFAULT_CENTER}
                            zoom={selectedLocation ? 15 : 10}
                            onClick={handleMapClick}
                            options={{ streetViewControl: false, mapTypeControl: false }}
                        >
                            {selectedLocation && (
                                <Marker position={selectedLocation} />
                            )}
                        </GoogleMap>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500 font-medium">
                            Loading Map... (Check API Key)
                        </div>
                    )}
                </div>

                {/* Log Button and Reset Button */}
                <div className="flex gap-4 pt-4">
                    {/* 🛑 Changed type="submit" to type="button" and added onClick handler */}
                    <button
                        type="button"
                        onClick={handleSelectLocation} // Calls the function that triggers onLocationPicked
                        className="flex-1 py-4 bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 hover:-translate-y-0.5 transition-all"
                        disabled={!selectedLocation}
                    >
                        {submitText}
                    </button>
                    <button
                        type="button"
                        className="px-8 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                        onClick={resetForm}
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

const DEFAULT_ZOOM = 15;

export type LocationCoordinates = {
    lat: number;
    lng: number;
};

interface StaticLocationMapProps {
    // Required fixed coordinates to display
    location: LocationCoordinates;
    // Optional zoom level
    zoom?: number;
    // Optional title to display above the map
    title?: string; 
}


export const StaticLocationMap = ({ location, zoom = DEFAULT_ZOOM, title = "Saved Location" }: StaticLocationMapProps) => {
    
    // The useJsApiLoader is necessary to load the Google Maps script
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: MAP_LIBRARIES as never[],
    });

    // Configuration object for map options (disables all user interaction)
    const mapOptions = {
        zoomControl: true, // Allow zooming in/out, but not location change
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        // Disable dragging/panning and double-click zoom
        draggable: false,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        clickableIcons: false, // Prevents clicks on points of interest
    };

    if (!isLoaded) {
        return (
            <div className="w-full h-80 rounded-xl overflow-hidden border-2 border-slate-200 flex items-center justify-center bg-slate-100 text-slate-500 font-medium">
                Loading Map... (Check API Key)
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Google Map */}
            <div className="w-full h-80 rounded-xl overflow-hidden border-2 border-slate-200">
                <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={location}
                    zoom={zoom}
                    // 🚨 IMPORTANT: onClick is removed, and options are set to disable interaction
                    options={mapOptions}
                >
                    {/* Fixed Marker based on the prop location */}
                    <Marker position={location} />
                </GoogleMap>
            </div>
        </div>
    );
};