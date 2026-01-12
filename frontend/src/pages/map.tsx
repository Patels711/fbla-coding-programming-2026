
import {motion} from 'framer-motion';
import {useEffect, useRef } from 'react';
import * as tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css'

const API_KEY = import.meta.env.VITE_TOMTOM_API_KEY
const initialCenter = [-0.112869, 51.504138]
const initialZoom = 10

const TomTomMap = ({ apiKey, center, zoom }: {apiKey: string, center: [number,number], zoom: number}) => {
  const mapContainer = useRef<HTMLDivElement| null>(null);
  const mapInstance = useRef<tt.Map| null>(null);

  useEffect(() => {

    if (!mapInstance.current||!API_KEY) return;


    mapInstance.current = tt.map({
      key: apiKey,
      container: mapContainer.current,
      center: initialCenter,
      zoom: zoom,
      style: 'basic_main',
    });

    
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [apiKey, center, zoom]);

  return <div ref={mapContainer} className="w-full min-h-screen" />;
};


const Mapwip =()=>{
  return(
    <div className="min-h-screen bg-neutral-900 relative bg-neutral-00 w-full overscroll-none">
      <div className="fixed inset-0 bg-neutral-900 pointer-events-none w-full z-0 flex items-center justify-center overscroll-none">
				<motion.div initial={{ opacity: 0.4, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 2.0 }} className="fixed lg:w-[1200px] h-[500px] w-[600px] rounded-full">
				<div className="absolute bottom-[-500px] w-full h-full bg-gradient-to-t from-cyan-700/70 via-cyan-500/70 to-purple-400/70 blur-[160px] rounded-full" />
				</motion.div>
				<motion.div initial={{ opacity: 0.3, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 2.0 }} className="fixed lg:w-[900px] h-[500px] w-[500px] rounded-full">
					<div className="absolute lg:top-[-600px] top-[-550px] w-full h-full bg-gradient-to-b from-cyan-700/40 via-cyan-500/40 to-purple-400/40 blur-[120px] rounded-full" />
				</motion.div>
			</div>
      <div className="p-4 min-h-screen relative bg-neutral-00 w-full overscroll-none">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">My Basic TomTom Map</h1>
      {API_KEY !== 'YOUR_API_KEY' ? (
        <TomTomMap apiKey={API_KEY} center={initialCenter} zoom={initialZoom} />
      ) : (
        <p>Please provide a valid TomTom API key.</p>
      )}
      </div>
    </div>
  )
}

export default Mapwip;