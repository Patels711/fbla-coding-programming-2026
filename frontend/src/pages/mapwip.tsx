import React, { useEffect, useRef, useState } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import { services } from '@tomtom-international/web-sdk-services';
import '@tomtom-international/web-sdk-maps/dist/maps.css';


const API_KEY = import.meta.env.VITE_TOMTOM_API_KEY

const POI_CATEGORIES = {
  GAS_STATIONS: '7311',
  BANKS: '7321',
  PARKS: '9362',
  RESTAURANTS: '7315'
};

const getLng = (pos: any): number | undefined => {
  if (!pos) return undefined;
  if (typeof pos.lng === 'number') return pos.lng;
  if (typeof pos.lon === 'number') return pos.lon;
  return undefined;
};

const getLat = (pos: any): number | undefined => {
  if (!pos) return undefined;
  if (typeof pos.lat === 'number') return pos.lat;
  return undefined;
};

const hasValidPosition = (pos: any): boolean => {
  const lng = getLng(pos);
  const lat = getLat(pos);
  return lng !== undefined && lat !== undefined && 
         !isNaN(lng) && !isNaN(lat);
};

interface RouteInstruction {
  maneuverType: string;
  streetName: string;
  message: string;
  distance: number;
  time: number;
  point: { lng: number; lat: number };
}

interface RouteInfo {
  name: string;
  lat: number;
  lng: number;
  miles: string;
  mins: number;
  instructions: RouteInstruction[];
  currentInstruction: number;
}

const App = () => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const poiMarkersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const [userLoc, setUserLoc] = useState({ lat: 40.32988, lng: -74.37149 });
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [stats, setStats] = useState<RouteInfo | null>(null);
  const [trafficOn, setTrafficOn] = useState(false);
  const [poiMarkers, setPoiMarkers] = useState<any[]>([]);
  const [activePoiType, setActivePoiType] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navStep, setNavStep] = useState(0);
  const [showFullDirections, setShowFullDirections] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, address: string, imageUrl: string} | null>(null);
  const [mapStyle, setMapStyle] = useState<'regular' | 'satellite' | 'dark' | 'hybrid'>('regular');
  const [mapPerspective, setMapPerspective] = useState<'2d' | '3d'>('2d');
  const [mapError, setMapError] = useState<string | null>(null);


  const getMapStyle = () => {
    switch (mapStyle) {
      case 'satellite':
        return { map: '2/basic_street-satellite', poi: '2/poi_satellite' };
      case 'dark':
        return { map: '2/basic_street-dark', poi: '2/poi_dark' };
      case 'hybrid':
        return { map: '2/hybrid_street-light', poi: '2/poi_light' };
      default:
        return { map: '2/basic_street-light', poi: '2/poi_light' };
    }
  };

  useEffect(() => {
    if (!mapElement.current) return;
    if (!API_KEY) {
      setMapError('API key is missing. Please set VITE_TOMTOM_API_KEY in your .env file.');
      return;
    }

    const style = getMapStyle();

    try {
      const map = tt.map({
        key: API_KEY,
        container: mapElement.current,
        center: [userLoc.lng, userLoc.lat],
        zoom: 13,
        pitch: mapPerspective === '3d' ? 60 : 0,
        style: {
          map: style.map as any,
          poi: style.poi as any,
          trafficIncidents: 'incidents_day' as any,
          trafficFlow: 'flow_relative0' as any
        }
      });

      map.on('load', () => {
        console.log('Map loaded successfully');
        setMapLoaded(true);
        setMapError(null);
        drawUserMarker(userLoc);

        // Add click handler for map locations
        map.on('click', async (e: any) => {
          const lngLat = e.lngLat;
          const lat = lngLat.lat;
          const lng = lngLat.lng;

          try {
            // Reverse geocode to get address
            const reverseGeocode = await services.reverseGeocode({
              key: API_KEY,
              position: [lng, lat]
            });

            const address = reverseGeocode.addresses?.[0]?.address?.freeformAddress || 'Unknown Location';

            // Get static map image using TomTom's Map Display API for static images
            const imageUrl = `https://api.tomtom.com/map/1/staticimage?key=${API_KEY}&layer=basic&style=main&center=${lng},${lat}&zoom=16&width=400&height=200&format=png`;

            setSelectedLocation({ lat, lng, address, imageUrl });
          } catch (error) {
            console.error('Error fetching location details:', error);
            // Fallback to simple static map
            const imageUrl = `https://api.tomtom.com/map/1/staticimage?key=${API_KEY}&layer=basic&center=${lng},${lat}&zoom=15&width=400&height=200&format=png`;
            setSelectedLocation({ lat, lng, address: 'Unknown Location', imageUrl });
          }
        });
      });

      map.on('error', (e: any) => {
        console.error('Map error:', e);
        setMapError('Failed to load map. Please check your API key.');
      });

      mapRef.current = map;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLoc(coords);
          map.setCenter([coords.lng, coords.lat]);
        }, (err) => {
          console.log('Geolocation error:', err);
        });
      }
    } catch (error) {
      console.error('Failed to initialize map:', error);
      setMapError('Failed to initialize map. Please check your API key.');
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const drawUserMarker = (loc: {lat: number, lng: number}) => {
    if (!mapRef.current || !mapLoaded) return;
    if (userMarkerRef.current) userMarkerRef.current.remove();
    
    const el = document.createElement('div');
    el.className = 'user-dot';
    el.innerHTML = '<div class="w-4 h-4 bg-[#00d4ff] border-[3px] border-white rounded-full shadow-[0_0_15px_#00d4ff]"></div>';
    
    userMarkerRef.current = new tt.Marker({ element: el })
      .setLngLat([loc.lng, loc.lat])
      .addTo(mapRef.current);
  };

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    // For TomTom, we need to recreate the map to change pitch/style properly
    // But we can try to animate the camera
    const pitch = mapPerspective === '3d' ? 60 : 0;
    
    try {
      // Use flyTo with pitch to animate the perspective change
      const center = mapRef.current.getCenter();
      mapRef.current.flyTo({
        center: [center.lng, center.lat],
        pitch: pitch,
        zoom: mapRef.current.getZoom(),
        duration: 1000
      });
    } catch (e) {
      console.log('Could not set pitch:', e);
    }
  }, [mapPerspective, mapLoaded]);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    // Update map style
    const style = getMapStyle();
    
    try {
      mapRef.current.setStyle({
        map: style.map,
        poi: style.poi,
        trafficIncidents: 'incidents_day',
        trafficFlow: 'flow_relative0'
      });
      
      // Re-add user marker after style change
      mapRef.current.once('styledata', () => {
        drawUserMarker(userLoc);
      });
    } catch (e) {
      console.log('Could not set style:', e);
    }
  }, [mapStyle, mapLoaded, userLoc]);

  useEffect(() => {
    if (inputValue.length < 3) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await services.fuzzySearch({
          key: API_KEY,
          query: inputValue,
          center: [userLoc.lng, userLoc.lat],
          typeahead: true,
          limit: 5
        });
        setSuggestions(res.results || []);
      } catch (e) { 
        console.error('Autocomplete error:', e); 
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [inputValue, userLoc]);

  const clearMap = (preservePoi = false) => {
    // Remove all destination markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    
    // Always clear route layers and source
    if (mapRef.current && mapRef.current.getLayer('route-arrows')) {
      try { mapRef.current.removeLayer('route-arrows'); } catch (e) {}
    }
    if (mapRef.current && mapRef.current.getLayer('route')) {
      try { mapRef.current.removeLayer('route'); } catch (e) {}
    }
    if (mapRef.current && mapRef.current.getSource('route')) {
      try { mapRef.current.removeSource('route'); } catch (e) {}
    }
    
    // Only clear POI markers if not preserving them
    if (!preservePoi) {
      poiMarkers.forEach(m => m.remove());
      setPoiMarkers([]);
      setActivePoiType(null);
    }
  };

  const cancelNavigation = () => {
    setIsNavigating(false);
    setNavStep(0);
    setShowFullDirections(false);
  };

  const startNavigation = () => {
    if (!stats) return;
    setIsNavigating(true);
    setNavStep(0);
    setShowFullDirections(false);
    
    // Clear POI markers when starting navigation
    poiMarkersRef.current.forEach(m => {
      try { m.remove(); } catch (e) {}
    });
    poiMarkersRef.current = [];
    setPoiMarkers([]);
    setActivePoiType(null);
    
    if (stats.instructions && stats.instructions[0] && mapRef.current) {
      const firstStep = stats.instructions[0];
      if (firstStep.point && !isNaN(firstStep.point.lng) && !isNaN(firstStep.point.lat)) {
        mapRef.current.flyTo({
          center: [firstStep.point.lng, firstStep.point.lat],
          zoom: 17,
          pitch: 60,
          bearing: 0
        });
      } else {
        // Fallback to destination
        mapRef.current.flyTo({
          center: [stats.lng, stats.lat],
          zoom: 17,
          pitch: 60,
          bearing: 0
        });
      }
    }
  };

  const nextNavStep = () => {
    if (!stats || !stats.instructions) return;
    if (navStep < stats.instructions.length - 1) {
      const newStep = navStep + 1;
      setNavStep(newStep);
      const step = stats.instructions[newStep];
      if (step?.point && !isNaN(step.point.lng) && !isNaN(step.point.lat) && mapRef.current) {
        mapRef.current.flyTo({
          center: [step.point.lng, step.point.lat],
          zoom: 17,
          pitch: 60,
          bearing: 0
        });
      }
    }
  };

  const prevNavStep = () => {
    if (navStep > 0) {
      const newStep = navStep - 1;
      setNavStep(newStep);
      const step = stats?.instructions?.[newStep];
      if (step?.point && !isNaN(step.point.lng) && !isNaN(step.point.lat) && mapRef.current) {
        mapRef.current.flyTo({
          center: [step.point.lng, step.point.lat],
          zoom: 17,
          pitch: 60,
          bearing: 0
        });
      }
    }
  };

  const jumpToStep = (index: number) => {
    if (!stats?.instructions?.[index]) return;
    setNavStep(index);
    const step = stats.instructions[index];
    if (step.point && !isNaN(step.point.lng) && !isNaN(step.point.lat) && mapRef.current) {
      mapRef.current.flyTo({
        center: [step.point.lng, step.point.lat],
        zoom: 17,
        pitch: 60,
        bearing: 0
      });
    }
  };

  const searchPoi = async (categoryId: string, type: string) => {
    if (!mapRef.current) return;

    clearMap();
    cancelNavigation();

    if (activePoiType === type) {
      setActivePoiType(null);
      return;
    }

    setActivePoiType(type);

    try {
      const res = await services.poiSearch({
        key: API_KEY,
        center: [userLoc.lng, userLoc.lat],
        radius: 10000,
        categorySet: categoryId,
        limit: 30
      });

      console.log(`POI Search for ${type}:`, res.results?.length || 0, 'results');

      const newMarkers: any[] = [];
      const bounds = new tt.LngLatBounds();

      (res.results || []).forEach((poi: any) => {
        if (hasValidPosition(poi.position)) {
          const lng = getLng(poi.position)!;
          const lat = getLat(poi.position)!;
          
          const el = document.createElement('div');
          let bgClass = 'bg-[#00d4ff]';
          if (type === 'GAS_STATIONS') bgClass = 'bg-orange-500';
          else if (type === 'BANKS' || type === 'PARKS') bgClass = 'bg-green-500';
          else if (type === 'RESTAURANTS') bgClass = 'bg-red-500';

          el.className = `flex items-center justify-center w-8 h-8 ${bgClass} border-[3px] border-white rounded-full text-base cursor-pointer shadow-md transition-transform hover:scale-125`;
          el.innerHTML = getPoiIcon(type);

          const marker = new tt.Marker({ element: el })
            .setLngLat([lng, lat])
            .addTo(mapRef.current);

          marker.getElement().addEventListener('click', () => {
            calculateRoute(lat, lng, poi.poi?.name || type);
          });

          newMarkers.push(marker);
          bounds.extend([lng, lat]);
        }
      });

      // Update both state and ref
      poiMarkersRef.current = newMarkers;
      setPoiMarkers(newMarkers);

      if (newMarkers.length > 0 && mapRef.current) {
        mapRef.current.setZoom(10);
        mapRef.current.fitBounds(bounds, { padding: 50 });
      }
    } catch (e) {
      console.error('POI search failed:', e);
    }
  };

  const getPoiIcon = (type: string): string => {
    switch (type) {
      case 'GAS_STATIONS': return '⛽';
      case 'BANKS': return '🏦';
      case 'PARKS': return '🌳';
      case 'RESTAURANTS': return '🍽️';
      default: return '📍';
    }
  };

  const getManeuverIcon = (maneuverType: string): string => {
    const icons: { [key: string]: string } = {
      'depart': '🚗',
      'arrive': '🏁',
      'turn-left': '⬅️',
      'turn-right': '➡️',
      'slight-left': '↙️',
      'slight-right': '↗️',
      'sharp-left': '⬅️',
      'sharp-right': '➡️',
      'straight': '⬆️',
      'uturn': '🔄',
      'roundabout-left': '↩️',
      'roundabout-right': '↪️',
      'merge': '↗️',
      'on-ramp': '🛤️',
      'off-ramp': '🛤️',
      'end-of-road': '🛣️',
      'ferry': '⛴️',
      'ferry-train': '🚢'
    };
    return icons[maneuverType.toLowerCase()] || '➡️';
  };

  const handleSelectSuggestion = (poi: any) => {
    if (!hasValidPosition(poi.position)) return;

    const lng = getLng(poi.position)!;
    const lat = getLat(poi.position)!;
    const poiName = poi.poi?.name || poi.address?.freeformAddress || 'Destination';
    
    setInputValue(poiName);
    setSuggestions([]);

    clearMap();
    cancelNavigation();

    const destLngLat: [number, number] = [lng, lat];
    
    const el = document.createElement('div');
    el.className = 'flex items-center justify-center text-4xl';
    el.innerHTML = '📍';
    
    const marker = new tt.Marker({ element: el })
      .setLngLat(destLngLat)
      .addTo(mapRef.current);
    
    markersRef.current.push(marker);

    if (mapRef.current) {
      mapRef.current.flyTo({ center: destLngLat, zoom: 15
       });
    }

    calculateRoute(lat, lng, poiName);
  };

  const handleSearch = async () => {
    if (!inputValue.trim()) return;

    try {
      const res = await services.fuzzySearch({
        key: API_KEY,
        query: inputValue,
        center: [userLoc.lng, userLoc.lat],
        limit: 1
      });

      if (res.results && res.results.length > 0) {
        handleSelectSuggestion(res.results[0]);
      } else {
        alert('No locations found for: ' + inputValue);
      }
    } catch (e) {
      console.error('Search failed:', e);
      alert('Search failed. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const calculateRoute = async (dLat: number, dLng: number, name: string) => {
    if (!mapRef.current) return;

    console.log('calculateRoute called. Current POI markers count:', poiMarkersRef.current.length);
    
    // Clear all markers including POI markers when navigating to a destination
    // First remove all POI markers from map using the ref
    const markersToRemove = [...poiMarkersRef.current];
    console.log('Removing', markersToRemove.length, 'POI markers');
    markersToRemove.forEach((m, idx) => {
      try {
        console.log(`Removing POI marker ${idx}`);
        m.remove();
      } catch (e) {
        console.error('Error removing POI marker:', e);
      }
    });
    
    // Remove all destination markers from map
    const destMarkers = [...markersRef.current];
    console.log('Removing', destMarkers.length, 'destination markers');
    destMarkers.forEach((m, idx) => {
      try {
        console.log(`Removing destination marker ${idx}`);
        m.remove();
      } catch (e) {
        console.error('Error removing destination marker:', e);
      }
    });
    
    // Clear state and refs
    console.log('Clearing state');
    poiMarkersRef.current = [];
    setPoiMarkers([]);
    setActivePoiType(null);
    markersRef.current = [];

    // Remove route layers and source
    if (mapRef.current && mapRef.current.getLayer('route-arrows')) {
      try { mapRef.current.removeLayer('route-arrows'); } catch (e) {}
    }
    if (mapRef.current && mapRef.current.getLayer('route')) {
      try { mapRef.current.removeLayer('route'); } catch (e) {}
    }
    if (mapRef.current && mapRef.current.getSource('route')) {
      try { mapRef.current.removeSource('route'); } catch (e) {}
    }

    try {
      const route = await services.calculateRoute({
        key: API_KEY,
        locations: `${userLoc.lng},${userLoc.lat}:${dLng},${dLat}`,
        instructionsType: 'text',
        traffic: true
      });

      const geojson = route.toGeoJson();

      // Safely remove existing source and layers with try/catch
      if (mapRef.current.getLayer('route-arrows')) {
        try { mapRef.current.removeLayer('route-arrows'); } catch (e) {}
      }
      if (mapRef.current.getLayer('route')) {
        try { mapRef.current.removeLayer('route'); } catch (e) {}
      }
      if (mapRef.current.getSource('route')) {
        try { mapRef.current.removeSource('route'); } catch (e) {}
      }

      // Add route source and layer
      mapRef.current.addSource('route', {
        type: 'geojson',
        data: geojson
      });

      mapRef.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        paint: { 'line-color': '#B794F4', 'line-width': 8, 'line-opacity': 0.9 }
      });

      // Build instructions array from guidance
      const rawInstructions = route.routes?.[0]?.guidance?.instructions || [];
      const instructions: RouteInstruction[] = [];

      // Process instructions from TomTom response
      if (rawInstructions.length > 0) {
        rawInstructions.forEach((inst: any) => {
          instructions.push({
            maneuverType: inst.maneuverType || 'straight',
            streetName: inst.streetName || '',
            message: inst.message || '',
            distance: inst.distance || 0,
            time: inst.travelTimeInSeconds || 0,
            point: inst.point || { lng: dLng, lat: dLat }
          });
        });
      }

      // If no instructions from guidance, create basic start/end instructions
      if (instructions.length === 0) {
        instructions.push({
          maneuverType: 'depart',
          streetName: 'Start at your location',
          message: 'Head towards ' + name,
          distance: 0,
          time: 0,
          point: { lng: userLoc.lng, lat: userLoc.lat }
        });
        instructions.push({
          maneuverType: 'arrive',
          streetName: name,
          message: 'You have arrived at ' + name,
          distance: 0,
          time: 0,
          point: { lng: dLng, lat: dLat }
        });
      }

      const summary = route.routes?.[0]?.summary || {};
      const totalDistance = summary.lengthInMeters || 0;
      const totalTime = summary.travelTimeInSeconds || 0;

      setStats({
        name,
        lat: dLat,
        lng: dLng,
        miles: totalDistance > 0 ? (totalDistance * 0.000621371).toFixed(1) : '0',
        mins: totalTime > 0 ? Math.round(totalTime / 60) : 0,
        instructions,
        currentInstruction: 0
      });
    } catch (e) {
      console.error('Route calculation failed:', e);
      // Set fallback stats
      setStats({
        name,
        lat: dLat,
        lng: dLng,
        miles: '0',
        mins: 0,
        instructions: [
          {
            maneuverType: 'arrive',
            streetName: name,
            message: 'Navigate to ' + name,
            distance: 0,
            time: 0,
            point: { lng: dLng, lat: dLat }
          }
        ],
        currentInstruction: 0
      });
    }
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1609.34).toFixed(1)}mi`;
  };

  return (
    <div className="fixed inset-0 bg-neutral-900 flex">
        <div ref={mapElement} className="w-full h-full rounded-[2%] relative [&_.tt-attribution]:hidden">
          <div className="absolute w-2xl -z-50 top-0 left-0 bottom-0 bg-amber-100">

          </div>
          {/*Animation for loading map*/}
          {!mapLoaded && !mapError && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#00d4ff] text-lg flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-[3px] border-neutral-800 border-t-[#00d4ff] rounded-full animate-spin"></div>
              <span>Loading Map...</span>
            </div>
          )}

          {/*Display for error*/}
          {mapError && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-900/98 border border-red-500 rounded-xl p-8 max-w-[400px] text-center z-[3000]">
              <div className="text-[40px] mb-4">⚠️</div>
              <h3 className="text-red-500 m-0 mb-2.5">Map Error</h3>
              <p className="text-gray-300 m-0 mb-5 leading-relaxed">{mapError}</p>
              <div className="text-xs text-gray-400 text-left bg-neutral-900 p-4 rounded-lg">
                <strong>To fix this:</strong><br/>
                1. Get a TomTom API key from <a href="https://developer.tomtom.com/" target="_blank" rel="noopener noreferrer" className="text-[#00d4ff]">developer.tomtom.com</a><br/>
                2. Create a .env file in the frontend directory<br/>
                2. Create a .env file in the frontend directory<br/>
                3. Add: VITE_TOMTOM_API_KEY=your_api_key<br/>
                4. Restart the dev server
              </div>
            </div>
          )}

          {/* Navigation Popup */}
          {isNavigating && stats && stats.instructions && stats.instructions.length > 0 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-neutral-900/98 border border-neutral-800 rounded-2xl w-80 z-[2000] shadow-2xl max-h-[50vh] overflow-hidden">
              <div className="flex justify-between items-center p-3 px-4 border-b border-neutral-800">
                <div className="flex items-center text-white gap-2.5 text-base">
                  <span className="text-2xl">📍</span>
                  <div>
                    <h4 className="m-0 text-[#00d4ff] text-sm">{stats.name}</h4>
                    <p className="m-0 mt-0.5 text-gray-400 text-[11px]">{stats.miles} mi • {stats.mins} min</p>
                  </div>
                </div>
                <button className="border-none text-[#00d4ff] w-7 h-7 rounded-full cursor-pointer text-sm hover:bg-white/5" onClick={cancelNavigation}>✕</button>
              </div>

              <div className="p-4 bg-gradient-to-br from-[#00d4ff1a] to-[#0096c80d]">
                <div className="flex items-center gap-3">
                  <span className="text-[32px]">{getManeuverIcon(stats.instructions[navStep]?.maneuverType || 'straight')}</span>
                  <div className="flex-1">
                    <p className="m-0 text-white text-sm font-bold">{stats.instructions[navStep]?.streetName || stats.instructions[navStep]?.message || 'Continue'}</p>
                    <p className="m-0 mt-1 text-[#00d4ff] text-xs">{formatDistance(stats.instructions[navStep]?.distance || 0)}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center p-2.5 px-4 border-t border-neutral-800">
                <button className="bg-neutral-800 border-none text-white py-2 px-4 rounded-lg cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700" onClick={prevNavStep} disabled={navStep === 0}>◀</button>
                <span className="text-gray-400 text-xs">{navStep + 1} / {stats.instructions.length}</span>
                <button className="bg-neutral-800 border-none text-white py-2 px-4 rounded-lg cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700" onClick={nextNavStep} disabled={navStep >= stats.instructions.length - 1}>▶</button>
              </div>

              <div className="text-center p-2.5 text-[#00d4ff] cursor-pointer text-xs border-t border-neutral-800 hover:bg-white/5" onClick={() => setShowFullDirections(!showFullDirections)}>
                {showFullDirections ? '▲ Hide all steps' : '▼ Show all steps'}
              </div>

              {showFullDirections && (
                <div className="max-h-[150px] overflow-y-auto border-t border-neutral-800">
                  {stats.instructions.map((inst, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center gap-2.5 p-2.5 px-4 cursor-pointer border-b border-neutral-800 hover:bg-white/5 ${idx === navStep ? 'bg-[#00d4ff26] border-l-[3px] border-l-[#00d4ff]' : ''} ${idx < navStep ? 'opacity-50' : ''}`}
                      onClick={() => jumpToStep(idx)}
                    >
                      <span className="text-base w-5 text-center">{getManeuverIcon(inst.maneuverType)}</span>
                      <div className="flex-1 flex justify-between items-center">
                        <span className="text-white text-xs">{inst.streetName || inst.message}</span>
                        <span className="text-gray-400 text-[11px]">{formatDistance(inst.distance)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search Overlay */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-[1000]">
            <div className="bg-neutral-900/95 border border-neutral-800 rounded-xl overflow-hidden shadow-lg">
              <div className="flex items-center p-2 px-3 gap-2">
                <input
                  className="flex-1 border-none bg-transparent text-white text-[15px] outline-none placeholder-neutral-500"
                  placeholder="Search location..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                {inputValue && (
                  <button className="bg-transparent border-none text-slate-400 cursor-pointer text-lg p-1 px-2 hover:text-white" onClick={() => setInputValue('')}>x</button>
                )}
                <button className="bg-[#00d4ff] border-none text-black p-2 px-3 rounded-lg cursor-pointer text-sm font-bold hover:bg-[#00b7db]" onClick={handleSearch}>🔍</button>
              </div>

              {suggestions.length > 0 && (
                <div className="bg-neutral-900/95 border-t border-neutral-800 max-h-[180px] overflow-y-auto scrollbar-hide">
                  {suggestions.map((s, i) => (
                   <div key={i} className="p-3 border-b border-neutral-800 hover:bg-neutral-800" onClick={() => handleSelectSuggestion(s)}>
                   <strong className="text-white block text-sm">{s.poi?.name || s.address?.freeformAddress || 'Unknown'}</strong>
                   <span className="text-gray-400 text-xs">{s.address?.municipality || ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2.5">
              {[
                { id: POI_CATEGORIES.GAS_STATIONS, type: 'GAS_STATIONS', label: '⛽ Gas' },
                { id: POI_CATEGORIES.BANKS, type: 'BANKS', label: '🏦 Banks' },
                { id: POI_CATEGORIES.PARKS, type: 'PARKS', label: '🌳 Parks' },
                { id: POI_CATEGORIES.RESTAURANTS, type: 'RESTAURANTS', label: '🍽️ Food' }
              ].map(poi => (
                <button
                  key={poi.type}
                  onClick={() => searchPoi(poi.id, poi.type)}
                  className={`bg-neutral-900/95 text-gray-300 border border-neutral-800 p-3 px-2 rounded-xl cursor-pointer text-[13px] transition-all hover:bg-neutral-800 ${activePoiType === poi.type ? 'bg-[#00d4ff] text-black border-[#00d4ff] hover:bg-[#00d4ff]' : ''}`}
                >
                  {poi.label}
                </button>
              ))}
            </div>
          </div>

          {/* Route Card */}
          {stats && !isNavigating && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-neutral-900/95 border border-neutral-800 p-4 rounded-2xl w-[300px] z-[1000] shadow-xl">
              <div className="mb-3">
                <h3 className="m-0 mb-1 text-[#00d4ff] text-base">{stats.name}</h3>
                <p className="m-0 mb-3 text-gray-400 text-sm">{stats.miles} mi • {stats.mins} min</p>
              </div>
              <div className="flex gap-2.5">
                <button className="flex-[2] bg-[#00d4ff] text-black border-none p-2.5 rounded-lg font-bold cursor-pointer hover:bg-[#00b7db]" onClick={startNavigation}>Start Navigation</button>
                <button className="flex-1 bg-neutral-800 text-white border-none p-2.5 rounded-lg cursor-pointer hover:bg-neutral-700" onClick={() => { setStats(null); clearMap(); }}>Close</button>
              </div>
            </div>
          )}

          {/* Location Info Popup */}
          {selectedLocation && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-900/98 border border-neutral-800 rounded-2xl w-80 z-[3000] shadow-2xl max-h-[80vh] overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-neutral-800">
                <h3 className="m-0 text-[#00d4ff] text-lg">Location Details</h3>
                <button className="bg-neutral-800 border-none text-white w-8 h-8 rounded-full cursor-pointer text-base hover:bg-neutral-700" onClick={() => setSelectedLocation(null)}>✕</button>
              </div>
              <div className="p-4">
                {selectedLocation.imageUrl && (
                  <div className="w-full h-[180px] bg-neutral-900 rounded-lg mb-3 overflow-hidden flex items-center justify-center border border-neutral-800">
                    <img 
                      src={selectedLocation.imageUrl} 
                      alt="Location" 
                      className="w-full h-full object-cover block"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<div class="text-red-400 text-xs text-center p-5">Image unavailable<br/>Tap Route to navigate</div>';
                      }}
                    />
                  </div>
                )}
                <p className="text-white text-sm mb-4 leading-relaxed p-2.5 bg-white/5 rounded-lg">📍 {selectedLocation.address}</p>
                <div className="flex justify-center gap-2.5">
                  <button className="bg-gradient-to-br from-[#00d4ff] to-[#0099cc] text-black border-none p-3 px-6 rounded-lg font-bold cursor-pointer text-sm flex-1 transition-transform hover:scale-[1.02]" onClick={() => {
                    calculateRoute(selectedLocation.lat, selectedLocation.lng, selectedLocation.address);
                    setSelectedLocation(null);
                  }}>🧭 Navigate</button>
                </div>
              </div>
            </div>
          )}

          {/* Side Bar */}
          <div className="absolute bottom-24 right-4 flex flex-col gap-2.5 z-[1000]">
            <button 
              onClick={() => {
                if (!mapRef.current) return;
                if (trafficOn) {
                  mapRef.current.hideTrafficFlow();
                  mapRef.current.hideTrafficIncidents();
                } else {
                  mapRef.current.showTrafficFlow();
                  mapRef.current.showTrafficIncidents();
                }
                setTrafficOn(!trafficOn);
              }} 
              className={`w-[60px] h-[50px] bg-neutral-900/95 text-white border border-neutral-800 rounded-xl cursor-pointer text-[22px] flex flex-col items-center justify-center shadow-lg transition-all hover:scale-105 hover:border-[#00d4ff] ${trafficOn ? 'border-[#00d4ff] text-[#00d4ff] bg-[#00d4ff1a]' : ''}`}
              title={trafficOn ? 'Hide Traffic' : 'Show Traffic'}
            >
              🚦
            </button>
            <button 
              onClick={() => {
                if (mapRef.current) {
                  mapRef.current.flyTo({ center: [userLoc.lng, userLoc.lat], zoom: 15 });
                }
              }}
              className="w-[60px] h-[50px] bg-neutral-900/95 text-white border border-neutral-800 rounded-xl cursor-pointer text-[22px] flex flex-col items-center justify-center shadow-lg transition-all hover:scale-105 hover:border-[#00d4ff]"
              title="My Location"
            >
              📍
            </button>
            <button 
              onClick={() => {
                setMapPerspective(prev => prev === '2d' ? '3d' : '2d');
              }}
              className={`w-[60px] h-[50px] bg-neutral-900/95 text-white border border-neutral-800 rounded-xl cursor-pointer text-[22px] flex flex-col items-center justify-center shadow-lg transition-all hover:scale-105 hover:border-[#00d4ff] ${mapPerspective === '3d' ? 'border-[#00d4ff] text-[#00d4ff] bg-[#00d4ff1a]' : ''}`}
              title={mapPerspective === '2d' ? 'Switch to 3D View' : 'Switch to 2D View'}
            >
              <span className="text-[11px] font-bold tracking-wide">{mapPerspective === '2d' ? '2D' : '3D'}</span>
            </button>
            <button
              onClick={() => {
                setMapStyle(prev => {
                  const styles = ['regular', 'satellite', 'dark', 'hybrid'];
                  const currentIndex = styles.indexOf(prev);
                  const nextIndex = (currentIndex + 1) % styles.length;
                  return styles[nextIndex] as 'regular' | 'satellite' | 'dark' | 'hybrid';
                });
              }}
              className={`w-[60px] h-[50px] bg-neutral-900/95 text-white border border-neutral-800 rounded-xl cursor-pointer text-[22px] flex flex-col items-center justify-center shadow-lg transition-all hover:scale-105 hover:border-[#00d4ff] ${mapStyle !== 'regular' ? 'border-[#00d4ff] text-[#00d4ff] bg-[#00d4ff1a]' : ''}`}
              title={`Current: ${mapStyle}`}
            >
              <span className="text-[11px] font-bold tracking-wide">{mapStyle.charAt(0).toUpperCase() + mapStyle.slice(1)}</span>
            </button>
          </div>
        </div>
      </div>
  );
};

export default App;