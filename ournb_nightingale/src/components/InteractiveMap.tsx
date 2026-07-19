import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Neighborhood } from "../types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default Leaflet marker assets by using a custom, high-fidelity DivIcon
const createScoreMarkerIcon = (score: number, isSelected: boolean) => {
  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <div class="relative flex items-center justify-center" style="transform: translate(0px, 0px);">
        ${
          isSelected
            ? `<div class="absolute w-10 h-10 rounded-full bg-indigo-500 opacity-40 animate-ping"></div>`
            : ""
        }
        <div class="relative w-8 h-8 rounded-full ${
          isSelected ? "bg-indigo-600 text-white" : "bg-emerald-600 text-white"
        } font-sans text-[11px] font-bold flex items-center justify-center border-2 border-white shadow-lg transition-transform duration-300 hover:scale-115">
          ${(score / 10).toFixed(1)}
        </div>
        <div class="absolute bottom-[-6px] w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent ${
          isSelected ? "border-t-[6px] border-t-indigo-600" : "border-t-[6px] border-t-emerald-600"
        }"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

interface InteractiveMapProps {
  neighborhoods: Neighborhood[];
  selectedNeighborhood: Neighborhood;
  onSelectNeighborhood: (neighborhood: Neighborhood) => void;
}

// Controller component to pan & zoom the Leaflet map smoothly
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const isInitial = React.useRef(true);
  
  React.useEffect(() => {
    // Skip centering on the very first mount so the initial zoomed-out Istanbul overview is displayed
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }
    map.setView([lat, lng], 14, {
      animate: true,
      duration: 1.2,
    });
  }, [lat, lng, map]);

  React.useEffect(() => {
    const handleRecenter = () => {
      map.setView([lat, lng], 14, {
        animate: true,
        duration: 1.2,
      });
    };
    window.addEventListener("recenter-map", handleRecenter);
    return () => {
      window.removeEventListener("recenter-map", handleRecenter);
    };
  }, [lat, lng, map]);

  return null;
}

export default function InteractiveMap({
  neighborhoods,
  selectedNeighborhood,
  onSelectNeighborhood,
}: InteractiveMapProps) {
  return (
    <div className="w-full h-full overflow-hidden relative" id="leaflet-map-container">
      <MapContainer
        center={[41.0136, 28.9727]}
        zoom={10.5}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {neighborhoods.map((n) => {
          const isSelected = n.id === selectedNeighborhood.id;
          return (
            <Marker
              key={n.id}
              position={[n.lat, n.lng]}
              icon={createScoreMarkerIcon(n.life_score, isSelected)}
              eventHandlers={{
                click: () => onSelectNeighborhood(n),
              }}
            >
              <Popup>
                <div className="p-1 font-sans" id={`map-popup-${n.id}`}>
                  <h4 className="font-bold text-xs text-gray-900 mb-0.5">{n.name}</h4>
                  <p className="text-[10px] text-gray-500 mb-1">{n.city} / {n.district}</p>
                  <div className="flex justify-between items-center text-[10px] font-semibold">
                    <span className="text-gray-600">Yaşam Kalitesi:</span>
                    <span className="text-emerald-600 font-mono">{(n.life_score / 10).toFixed(1)} / 10</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Pan the map whenever the selection changes */}
        <MapRecenter lat={selectedNeighborhood.lat} lng={selectedNeighborhood.lng} />
      </MapContainer>

      {/* Map floating legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-md border border-gray-100 text-[10px] space-y-1.5" id="map-legend">
        <h5 className="font-bold text-gray-900">Mahalle Yaşam Kalitesi</h5>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 border border-white shadow-sm inline-block" />
          <span className="text-gray-600">Normal Mahalleler</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 border border-white shadow-sm inline-block animate-pulse" />
          <span className="text-gray-900 font-semibold">Seçili Mahalle</span>
        </div>
      </div>
    </div>
  );
}
