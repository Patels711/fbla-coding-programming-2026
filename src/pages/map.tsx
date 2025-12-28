import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';

// Libraries required for 2025 Advanced Features
const LIBRARIES: ("places" | "geometry" | "marker")[] = ["places", "geometry", "marker"];

const App = () => {
  const navigate = useNavigate();
  const mapRef = useRef<google.maps.Map | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Refs for Advanced Markers (to update them without re-rendering the whole map)
  const userMarkerRef = useRef<any>(null);
  const searchMarkerRef = useRef<any>(null);

  // --- STATE ---
  const [userPos, setUserPos] = useState({ lat: 40.7128, lng: -74.0060 });
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY || "YOUR_API_KEY_HERE",
    libraries: LIBRARIES,
    // IMPORTANT: Advanced Markers require a Map ID from your Google Cloud Console
    mapIds: ['DEMO_MAP_ID'] 
  });

  // --- INITIALIZE SEARCH & PINPOINTING ---
  useEffect(() => {
    if (isLoaded && mapRef.current && searchInputRef.current) {
      // Initialize the 2025 Autocomplete logic
      const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
        fields: ["geometry", "name", "formatted_address", "rating", "photos"]
      });

      autocomplete.addListener("place_changed", async () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        const loc = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        // 1. Move Map
        mapRef.current?.panTo(loc);
        mapRef.current?.setZoom(15);
        setSelectedPlace(place);

        // 2. Drop Advanced Search Marker
        if (searchMarkerRef.current) searchMarkerRef.current.map = null; // Remove old
        
        const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
        
        // Custom styling for the search pin
        const pinContent = new PinElement({
            background: "#3B82F6",
            borderColor: "#FFFFFF",
            glyphColor: "#FFFFFF",
            scale: 1.2
        });

        searchMarkerRef.current = new AdvancedMarkerElement({
          map: mapRef.current,
          position: loc,
          title: place.name,
          content: pinContent.element,
        });
      });
    }
  }, [isLoaded]);

  // --- ROUTING LOGIC ---
  const calculateRoute = (dest: google.maps.LatLng) => {
    const service = new google.maps.DirectionsService();
    service.route({
      origin: userPos,
      destination: dest,
      travelMode: google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (status === 'OK') setDirections(result);
    });
  };

  // --- CURRENT LOCATION HANDLER ---
  const trackUser = async () => {
    navigator.geolocation.getCurrentPosition(async (p) => {
      const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
      setUserPos(pos);
      mapRef.current?.panTo(pos);

      // Create/Update User Marker (Pulsing blue dot style)
      if (userMarkerRef.current) userMarkerRef.current.map = null;
      
      const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
      
      const userDot = document.createElement('div');
      userDot.className = "w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse";
      
      userMarkerRef.current = new AdvancedMarkerElement({
        map: mapRef.current,
        position: pos,
        content: userDot,
      });
    });
  };

  if (loadError) return <div className="h-screen bg-black flex items-center justify-center text-red-500 font-bold p-4 text-center">API Key Rejected. Check Console for "InvalidKeyMapError".</div>;
  if (!isLoaded) return <div className="h-screen bg-slate-950 flex items-center justify-center text-white font-mono">BOOTING MAP ENGINE...</div>;

  return (
    <div className="relative h-screen w-full bg-slate-950 font-sans overflow-hidden">
      
      {/* --- FLOATING SEARCH HEADER --- */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-3xl">
        <div className="flex items-center gap-3 p-2 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]">
          <button onClick={() => navigate('/')} className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-white">🏠</button>
          
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Search for a place..." 
            className="flex-grow bg-transparent border-none text-white placeholder-white/20 focus:ring-0 text-lg py-2"
          />

          <button 
            onClick={trackUser}
            className="w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-500 rounded-xl transition-all text-white shadow-lg"
          >
            📍
          </button>
        </div>
      </div>

      {/* --- GOOGLE MAP --- */}
      <GoogleMap
        onLoad={(map) => { mapRef.current = map; }}
        center={userPos}
        zoom={13}
        mapContainerStyle={{ width: '100%', height: '100%' }}
        options={{ 
          disableDefaultUI: true,
          mapId: 'DEMO_MAP_ID', // Replace with your Map ID for full dark theme control
          styles: nightThemeStyles 
        }}
      >
        {directions && <DirectionsRenderer directions={directions} options={{ polylineOptions: { strokeColor: '#60A5FA', strokeWeight: 6 } }} />}
      </GoogleMap>

      {/* --- INTERACTIVE PLACE CARD --- */}
      {selectedPlace && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-md bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
                <h2 className="text-3xl font-black tracking-tight leading-tight">{selectedPlace.name}</h2>
                <p className="text-slate-500 text-sm mt-1">{selectedPlace.formatted_address}</p>
            </div>
            <button onClick={() => setSelectedPlace(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10">✕</button>
          </div>

          <div className="flex items-center gap-4 py-4 border-y border-white/5 my-4">
             <div className="text-yellow-400 font-bold text-lg">⭐ {selectedPlace.rating || "N/A"}</div>
             <div className="h-4 w-[1px] bg-white/10"></div>
             <div className="text-slate-400 text-sm uppercase tracking-widest font-bold">Open Now</div>
          </div>
          
          <button 
            onClick={() => calculateRoute(selectedPlace.geometry.location)}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-2xl font-black text-lg transition-all transform active:scale-95 shadow-[0_10px_20px_rgba(37,99,235,0.3)]"
          >
            GET DIRECTIONS
          </button>
        </div>
      )}
    </div>
  );
};

// Custom Dark Map Theme (Night Mode)
const nightThemeStyles = [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#020617" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] }
];

export default App;