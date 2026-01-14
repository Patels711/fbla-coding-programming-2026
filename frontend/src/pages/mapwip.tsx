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
    el.innerHTML = '<div style="width:16px;height:16px;background:#00d4ff;border:3px solid white;border-radius:50%;box-shadow:0 0 15px #00d4ff;"></div>';
    
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
          el.className = `poi-marker poi-${type.toLowerCase()}`;
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
    el.className = 'dest-marker';
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
    <div style={{ position: 'fixed', inset: 0, background: '#121212' }}>
      <div ref={mapElement} style={{ width: '100%', height: '100%' }} />

      {/* Loading Indicator */}
      {!mapLoaded && !mapError && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#00d4ff',
          fontSize: '18px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #333',
            borderTop: '3px solid #00d4ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span>Loading Map...</span>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Error Display */}
      {mapError && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(30, 30, 30, 0.98)',
          border: '1px solid #ff4444',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '400px',
          textAlign: 'center',
          zIndex: 3000
        }}>
          <div style={{ fontSize: '40px', marginBottom: '15px' }}>⚠️</div>
          <h3 style={{ color: '#ff4444', margin: '0 0 10px 0' }}>Map Error</h3>
          <p style={{ color: '#ccc', margin: '0 0 20px 0', lineHeight: '1.5' }}>{mapError}</p>
          <div style={{ fontSize: '12px', color: '#888', textAlign: 'left', background: '#1a1a1a', padding: '15px', borderRadius: '8px' }}>
            <strong>To fix this:</strong><br/>
            1. Get a TomTom API key from <a href="https://developer.tomtom.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#00d4ff' }}>developer.tomtom.com</a><br/>
            2. Create a .env file in the frontend directory<br/>
            3. Add: VITE_TOMTOM_API_KEY=your_api_key<br/>
            4. Restart the dev server
          </div>
        </div>
      )}

      {/* Navigation Popup */}
      {isNavigating && stats && stats.instructions && stats.instructions.length > 0 && (
        <div className="nav-popup">
          <div className="nav-header">
            <div className="nav-destination">
              <span className="nav-icon">📍</span>
              <div>
                <h4>{stats.name}</h4>
                <p>{stats.miles} mi • {stats.mins} min</p>
              </div>
            </div>
            <button className="cancel-btn" onClick={cancelNavigation}>✕</button>
          </div>

          <div className="nav-current-step">
            <div className="current-maneuver">
              <span className="maneuver-large">{getManeuverIcon(stats.instructions[navStep]?.maneuverType || 'straight')}</span>
              <div className="current-instruction">
                <p className="instruction-main">{stats.instructions[navStep]?.streetName || stats.instructions[navStep]?.message || 'Continue'}</p>
                <p className="instruction-distance">{formatDistance(stats.instructions[navStep]?.distance || 0)}</p>
              </div>
            </div>
          </div>

          <div className="nav-controls">
            <button onClick={prevNavStep} disabled={navStep === 0}>◀</button>
            <span className="step-progress">{navStep + 1} / {stats.instructions.length}</span>
            <button onClick={nextNavStep} disabled={navStep >= stats.instructions.length - 1}>▶</button>
          </div>

          <div className="nav-toggle" onClick={() => setShowFullDirections(!showFullDirections)}>
            {showFullDirections ? '▲ Hide all steps' : '▼ Show all steps'}
          </div>

          {showFullDirections && (
            <div className="nav-steps-list">
              {stats.instructions.map((inst, idx) => (
                <div 
                  key={idx} 
                  className={`nav-step-item ${idx === navStep ? 'active' : ''} ${idx < navStep ? 'completed' : ''}`}
                  onClick={() => jumpToStep(idx)}
                >
                  <span className="step-icon">{getManeuverIcon(inst.maneuverType)}</span>
                  <div className="step-info">
                    <span className="step-text">{inst.streetName || inst.message}</span>
                    <span className="step-dist">{formatDistance(inst.distance)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Overlay */}
      <div className="ui-overlay">
        <div className="search-container">
          <div className="search-wrap">
            <input
              placeholder="Search location..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            {inputValue && (
              <button className="clear-text" onClick={() => setInputValue('')}>✕</button>
            )}
            <button className="search-btn" onClick={handleSearch}>🔍</button>
          </div>

          {suggestions.length > 0 && (
            <div className="suggestions-list">
              {suggestions.map((s, i) => (
                <div key={i} className="suggestion-item" onClick={() => handleSelectSuggestion(s)}>
                  <strong>{s.poi?.name || s.address?.freeformAddress || 'Unknown'}</strong>
                  <span>{s.address?.municipality || ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="poi-buttons">
          <button
            onClick={() => searchPoi(POI_CATEGORIES.GAS_STATIONS, 'GAS_STATIONS')}
            className={activePoiType === 'GAS_STATIONS' ? 'active' : ''}
          >
            ⛽ Gas
          </button>
          <button
            onClick={() => searchPoi(POI_CATEGORIES.BANKS, 'BANKS')}
            className={activePoiType === 'BANKS' ? 'active' : ''}
          >
            🏦 Banks
          </button>
          <button
            onClick={() => searchPoi(POI_CATEGORIES.PARKS, 'PARKS')}
            className={activePoiType === 'PARKS' ? 'active' : ''}
          >
            🌳 Parks
          </button>
          <button
            onClick={() => searchPoi(POI_CATEGORIES.RESTAURANTS, 'RESTAURANTS')}
            className={activePoiType === 'RESTAURANTS' ? 'active' : ''}
          >
            🍽️ Food
          </button>
        </div>
      </div>

      {/* Route Card */}
      {stats && !isNavigating && (
        <div className="route-card">
          <div className="route-info">
            <h3>{stats.name}</h3>
            <p>{stats.miles} mi • {stats.mins} min</p>
          </div>
          <div className="route-actions">
            <button className="nav-btn" onClick={startNavigation}>Start Navigation</button>
            <button className="dismiss-btn" onClick={() => { setStats(null); clearMap(); }}>Close</button>
          </div>
        </div>
      )}

      {/* Location Info Popup */}
      {selectedLocation && (
        <div className="location-popup">
          <div className="location-header">
            <h3>Location Details</h3>
            <button className="close-btn" onClick={() => setSelectedLocation(null)}>✕</button>
          </div>
          <div className="location-content">
            {selectedLocation.imageUrl && (
              <div className="location-image-container">
                <img 
                  src={selectedLocation.imageUrl} 
                  alt="Location" 
                  className="location-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '<div class="location-image-error">Image unavailable<br/>Tap Route to navigate</div>';
                  }}
                />
              </div>
            )}
            <p className="location-address">📍 {selectedLocation.address}</p>
            <div className="location-actions">
              <button className="route-btn" onClick={() => {
                calculateRoute(selectedLocation.lat, selectedLocation.lng, selectedLocation.address);
                setSelectedLocation(null);
              }}>🧭 Navigate</button>
            </div>
          </div>
        </div>
      )}

      {/* Side Bar */}
      <div className="side-bar">
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
          className={trafficOn ? 'on' : ''}
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
          title="My Location"
        >
          📍
        </button>
        <button 
          onClick={() => {
            setMapPerspective(prev => prev === '2d' ? '3d' : '2d');
          }}
          className={mapPerspective === '3d' ? 'on' : ''}
          title={mapPerspective === '2d' ? 'Switch to 3D View' : 'Switch to 2D View'}
        >
          <span className="btn-label">{mapPerspective === '2d' ? '2D' : '3D'}</span>
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
          className={mapStyle !== 'regular' ? 'on' : ''}
          title={`Current: ${mapStyle}`}
        >
          <span className="btn-label">{mapStyle.charAt(0).toUpperCase() + mapStyle.slice(1)}</span>
        </button>
      </div>



      <style>{`
        .ui-overlay { position: absolute; top: 15px; left: 50%; transform: translateX(-50%); width: 90%; max-width: 400px; z-index: 1000; }
        .search-container { background: rgba(20, 20, 20, 0.95); border: 1px solid #333; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
        .search-wrap { display: flex; align-items: center; padding: 8px 12px; gap: 8px; }
        .search-wrap input { flex: 1; border: none; background: transparent; color: white; font-size: 15px; outline: none; }
        .clear-text { background: none; border: none; color: #888; cursor: pointer; font-size: 16px; padding: 4px 8px; }
        .search-btn { background: #00d4ff; border: none; color: #000; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: bold; }

        .suggestions-list { background: rgba(20, 20, 20, 0.95); border-top: 1px solid #333; max-height: 180px; overflow-y: auto; }
        .suggestion-item { padding: 12px; border-bottom: 1px solid #2a2a2a; cursor: pointer; }
        .suggestion-item:hover { background: #2a2a2a; }
        .suggestion-item strong { color: #fff; display: block; font-size: 14px; }
        .suggestion-item span { color: #888; font-size: 12px; }

        .poi-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
        .poi-buttons button { background: rgba(20, 20, 20, 0.95); color: #ddd; border: 1px solid #333; padding: 12px 8px; border-radius: 10px; cursor: pointer; font-size: 13px; transition: all 0.2s; }
        .poi-buttons button:hover { background: #2a2a2a; }
        .poi-buttons button.active { background: #00d4ff; color: #000; border-color: #00d4ff; }

        .side-bar { position: absolute; bottom: 100px; right: 15px; display: flex; flex-direction: column; gap: 10px; z-index: 1000; }
        .side-bar button { width: 60px; height: 50px; background: rgba(20, 20, 20, 0.95); color: white; border: 1px solid #333; border-radius: 12px; cursor: pointer; font-size: 22px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.4); transition: all 0.2s; flex-direction: column; gap: 2px; padding: 4px; }
        .side-bar button.on { border-color: #00d4ff; color: #00d4ff; background: rgba(0, 212, 255, 0.1); }
        .side-bar button:hover { transform: scale(1.05); border-color: #00d4ff; }
        .btn-label { font-size: 11px; font-weight: bold; letter-spacing: 0.5px; }

        .route-card { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(20, 20, 20, 0.95); border: 1px solid #333; padding: 18px; border-radius: 16px; width: 300px; z-index: 1000; box-shadow: 0 -5px 30px rgba(0,0,0,0.5); }
        .route-card h3 { margin: 0 0 5px; color: #00d4ff; font-size: 16px; }
        .route-card p { margin: 0 0 12px; color: #aaa; font-size: 14px; }
        .route-actions { display: flex; gap: 10px; }
        .nav-btn { flex: 2; background: #00d4ff; color: #000; border: none; padding: 10px; border-radius: 8px; font-weight: bold; cursor: pointer; }
        .dismiss-btn { flex: 1; background: #333; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; }

        .nav-popup { 
          position: absolute; 
          bottom: 20px; 
          left: 50%; 
          transform: translateX(-50%); 
          background: rgba(20, 20, 20, 0.98); 
          border: 1px solid #333; 
          border-radius: 20px; 
          width: 320px; 
          z-index: 2000; 
          box-shadow: 0 -10px 42px rgba(0,0,0,0.6);
          max-height: 50vh;
          overflow: hidden;
        }
        
        .nav-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; border-bottom: 1px solid #333; }
        .nav-destination { display: flex; align-items: center; color:#FFFFFf; gap: 10px; font-size:16px}
        .nav-icon { font-size: 25px; }
        .nav-destination h3 { margin: 0; color: #00d4ff; font-size: 14px; }
        .nav-destination p { margin: 2px 0 0; color: #888; font-size: 11px; }
        .cancel-btn {border: none; color: #00d4ff ; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 14px; }

        .nav-current-step { padding: 15px; background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 150, 200, 0.05)); }
        .current-maneuver { display: flex; align-items: center; gap: 12px; }
        .maneuver-large { font-size: 32px; }
        .current-instruction { flex: 1; }
        .instruction-main { margin: 0; color: white; font-size: 14px; font-weight: bold; }
        .instruction-distance { margin: 4px 0 0; color: #00d4ff; font-size: 12px; }

        .nav-controls { display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; border-top: 1px solid #333; }
        .nav-controls button { background: #333; border: none; color: white; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; }
        .nav-controls button:disabled { opacity: 0.5; cursor: not-allowed; }
        .step-progress { color: #888; font-size: 12px; }

        .nav-toggle { text-align: center; padding: 10px; color: #00d4ff; cursor: pointer; font-size: 12px; border-top: 1px solid #333; }
        .nav-toggle:hover { background: rgba(255,255,255,0.05); }

        .nav-steps-list { max-height: 150px; overflow-y: auto; border-top: 1px solid #333; }
        .nav-step-item { display: flex; align-items: center; gap: 10px; padding: 10px 15px; cursor: pointer; border-bottom: 1px solid #2a2a2a; }
        .nav-step-item:hover { background: rgba(255,255,255,0.05); }
        .nav-step-item.active { background: rgba(0, 212, 255, 0.15); border-left: 3px solid #00d4ff; }
        .nav-step-item.completed { opacity: 0.5; }
        .step-icon { font-size: 16px; width: 20px; text-align: center; }
        .step-info { flex: 1; display: flex; justify-content: space-between; align-items: center; }
        .step-text { color: #fff; font-size: 12px; }
        .step-dist { color: #888; font-size: 11px; }

        .user-dot { width: 20px; height: 20px;}
        .poi-marker { width: 32px; height: 32px; background: rgba(0, 212, 255, 0.9); border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.5); transition: transform 0.2s; }
        .poi-marker:hover { transform: scale(1.2); }
        .poi-gas_stations { background: #ff9500; }
        .poi-banks { background: #34c759; }
        .poi-parks { background: #34c759; }
        .poi-restaurants { background: #ff3b30; }
        .dest-marker { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 24px; }

        .location-popup {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(20, 20, 20, 0.98);
          border: 1px solid #333;
          border-radius: 16px;
          width: 320px;
          z-index: 3000;
          box-shadow: 0 10px 40px rgba(0,0,0,0.6);
          max-height: 80vh;
          overflow: hidden;
        }

        .location-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #333;
        }

        .location-header h3 {
          margin: 0;
          color: #00d4ff;
          font-size: 18px;
        }

        .close-btn {
          background: #333;
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
        }

        .location-content {
          padding: 16px;
        }

        .location-image-container {
          width: 100%;
          height: 180px;
          background: #1a1a1a;
          border-radius: 8px;
          margin-bottom: 12px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #333;
        }

        .location-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .location-image-loading {
          color: #666;
          font-size: 14px;
        }

        .location-image-error {
          color: #ff6b6b;
          font-size: 12px;
          text-align: center;
          padding: 20px;
        }

        .location-address {
          color: #fff;
          font-size: 14px;
          margin-bottom: 16px;
          line-height: 1.4;
          padding: 10px;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
        }

        .location-actions {
          display: flex;
          justify-content: center;
          gap: 10px;
        }

        .route-btn {
          background: linear-gradient(135deg, #00d4ff, #0099cc);
          color: #000;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          font-size: 14px;
          flex: 1;
          transition: transform 0.2s;
        }

        .route-btn:hover {
          transform: scale(1.02);
        }

        .style-indicator {
          position: absolute;
          bottom: 165px;
          right: 15px;
          display: flex;
          gap: 8px;
          z-index: 1000;
        }

        .style-indicator span {
          background: rgba(20, 20, 20, 0.95);
          color: #00d4ff;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: bold;
          border: 1px solid #333;
        }

        .style-name {
          color: #ff9500 !important;
        }

        .tt-attribution { display: none !important; }
      `}</style>
    </div>
  );
};

export default App;