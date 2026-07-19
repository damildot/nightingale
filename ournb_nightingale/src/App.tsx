import React, { useState, useEffect } from "react";
import { Neighborhood, NeighborhoodSummary, SyntheticPersona } from "./types";
import InteractiveMap from "./components/InteractiveMap";
import PersonaSelector from "./components/PersonaSelector";
import NeighborhoodDetails from "./components/NeighborhoodDetails";
import AiAssistant from "./components/AiAssistant";
import BrandLogo from "./components/BrandLogo";
import { MapPin, Info, Sparkles, Building2, HelpCircle, ShieldAlert, Search, Compass } from "lucide-react";
import { motion } from "motion/react";

// Simple helper to generate unique session IDs
const generateSessionId = () => {
  return (
    "sess_" +
    Math.random().toString(36).substring(2, 11) +
    "_" +
    Date.now().toString(36)
  );
};

export default function App() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<Neighborhood | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<SyntheticPersona | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Custom sidebar resizer state and tabs
  const [sidebarWidth, setSidebarWidth] = useState(500);
  const [isResizing, setIsResizing] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "chat">("profile");

  // Strict API contract: Unique session ID generated ONCE when user clicks a map marker
  const [sessionId, setSessionId] = useState<string>("");

  const [summary, setSummary] = useState<NeighborhoodSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);
  const [loadingList, setLoadingList] = useState<boolean>(true);

  // Drag handle sizing hook
  const startResizing = () => {
    setIsResizing(true);
  };

  const handleRecenterMap = () => {
    window.dispatchEvent(new Event("recenter-map"));
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      // Constrain sidebar between 340px and 650px
      const newWidth = Math.max(340, Math.min(650, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        // Dispatch resize event so Leaflet updates layout instantly
        setTimeout(() => {
          window.dispatchEvent(new Event("resize"));
        }, 50);
      }
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // 1. Initial Load: Fetch list of neighborhoods
  useEffect(() => {
    const fetchNeighborhoods = async () => {
      try {
        const res = await fetch("/api/neighborhoods");
        if (res.ok) {
          const data = await res.json();
          setNeighborhoods(data);
          if (data.length > 0) {
            // Find an Istanbul neighborhood (like Moda) to start with as requested by the user
            const initialNeigh = data.find((n: Neighborhood) => n.city === "İstanbul" || n.name.toLowerCase().includes("moda")) || data[0];
            setSelectedNeighborhood(initialNeigh);
            setSessionId(generateSessionId());
            fetchSummary(initialNeigh.id);
          }
        }
      } catch (e) {
        console.error("Failed to load neighborhoods:", e);
      } finally {
        setLoadingList(false);
      }
    };

    fetchNeighborhoods();
  }, []);

  // 2. Fetch LLM-generated summary
  const fetchSummary = async (neighId: string) => {
    setLoadingSummary(true);
    try {
      const res = await fetch(`/api/neighborhoods/${neighId}/summary`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (e) {
      console.error("Failed to load summary:", e);
    } finally {
      setLoadingSummary(false);
    }
  };

  // 3. Selection handler when user clicks map marker or list item
  const handleSelectNeighborhood = (neigh: Neighborhood) => {
    setSelectedNeighborhood(neigh);
    // Strict contract logic: generate unique session ID ONLY ONCE upon new marker click
    const newSession = generateSessionId();
    setSessionId(newSession);
    fetchSummary(neigh.id);
    setActiveTab("profile"); // Switch to profile tab so they can see selection details instantly
  };

  const handleSelectPersona = (persona: SyntheticPersona) => {
    setSelectedPersona(persona);
  };

  // Auto-select first matched neighborhood if search changes and current selection is not part of matches
  useEffect(() => {
    if (searchQuery.trim() !== "" && neighborhoods.length > 0) {
      const query = searchQuery.toLowerCase();
      const matches = neighborhoods.filter(
        (n) =>
          n.name.toLowerCase().includes(query) ||
          n.city.toLowerCase().includes(query) ||
          n.district.toLowerCase().includes(query)
      );
      if (matches.length > 0) {
        const exists = matches.some((n) => n.id === selectedNeighborhood?.id);
        if (!exists) {
          setSelectedNeighborhood(matches[0]);
          fetchSummary(matches[0].id);
          setSessionId(generateSessionId());
        }
      }
    }
  }, [searchQuery, neighborhoods]);

  // 4. Live Filtering Logic
  const filteredNeighborhoods = neighborhoods.filter((n) => {
    const query = searchQuery.toLowerCase();
    return (
      n.name.toLowerCase().includes(query) ||
      n.city.toLowerCase().includes(query) ||
      n.district.toLowerCase().includes(query)
    );
  });

  if (loadingList) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-50/50 gap-3" id="app-loading-screen">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <h2 className="font-sans font-bold text-gray-800 text-base">Nightingale Yükleniyor...</h2>
        <p className="text-xs text-gray-500 font-mono">Yapılandırma yükleniyor.</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-gray-50 font-sans" id="app-root-container">
      {/* 1. Left resizable Sidebar */}
      <div 
        className="h-full flex flex-col bg-white border-r border-gray-100 shadow-xl relative z-20 shrink-0"
        style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px` }}
        id="app-sidebar"
      >
        {/* A. Sidebar Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0" id="sidebar-header">
          <div className="flex items-center gap-3">
            <BrandLogo size={46} className="shrink-0 hover:scale-105 transition-all duration-300 active:rotate-6 cursor-pointer" />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-display font-black text-gray-950 text-xl tracking-tight leading-none bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 bg-clip-text text-transparent">
                  OURNB
                </h1>
                <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold">v1.3</span>
              </div>
              <span className="text-[8px] font-black text-gray-400 tracking-wider uppercase block font-mono mt-1">
                AI NEIGHBORHOOD INTELLIGENCE
              </span>
            </div>
          </div>

          <button
            onClick={handleRecenterMap}
            title="Haritayı Seçili Mahalleye Odakla"
            className="px-2.5 py-1.5 text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50/50 rounded-xl transition-all cursor-pointer border border-gray-100/80 flex items-center gap-1.5 shadow-sm active:scale-95"
            id="recenter-map-btn"
          >
            <Compass className="w-3.5 h-3.5 animate-pulse text-indigo-500" />
            <span className="text-[10px] font-bold text-gray-600">Odakla</span>
          </button>
        </div>

        {/* B. Sidebar Search Input */}
        <div className="px-4 pt-4 shrink-0" id="sidebar-search">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Şehir, ilçe veya mahalle ismi arayın..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-gray-50/80 border border-gray-200/80 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-gray-800 font-medium"
            />
          </div>
        </div>

        {/* C. Sidebar Navigation Tabs */}
        <div className="px-4 pt-3 shrink-0" id="sidebar-tabs">
          <div className="bg-gray-100/80 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "profile" 
                  ? "bg-white text-indigo-700 shadow-sm border border-gray-100" 
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Mahalle Profili
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "chat" 
                  ? "bg-white text-indigo-700 shadow-sm border border-gray-100" 
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Yapay Zeka Sor
            </button>
          </div>
        </div>

        {/* D. Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-4" id="sidebar-scrollable-content">
          {/* Quick Select Tooltip or matches */}
          <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100 shrink-0" id="quick-discovery">
            <span className="text-[9px] uppercase font-bold text-gray-400 font-mono tracking-wider block mb-1.5">
              {searchQuery ? `Arama Sonuçları (${filteredNeighborhoods.length})` : "Hızlı Keşfet"}
            </span>
            <div className="flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none pb-1">
              {filteredNeighborhoods.map((n) => {
                const isSelected = selectedNeighborhood?.id === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleSelectNeighborhood(n)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all shrink-0 border ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-white hover:bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    {n.name}
                  </button>
                );
              })}
              {filteredNeighborhoods.length === 0 && (
                <span className="text-[10px] text-gray-400 italic">Eşleşen mahalle bulunamadı.</span>
              )}
            </div>
          </div>

          {activeTab === "profile" ? (
            <div className="space-y-4" id="tab-profile-content">
              {selectedNeighborhood ? (
                <>
                  <NeighborhoodDetails
                    neighborhood={selectedNeighborhood}
                    summary={summary}
                    loadingSummary={loadingSummary}
                    selectedPersona={selectedPersona}
                  />
                  <PersonaSelector
                    selectedPersona={selectedPersona}
                    onSelectPersona={handleSelectPersona}
                  />
                </>
              ) : (
                <div className="py-12 text-center text-xs text-gray-400 italic">
                  Lütfen haritadan veya listeden bir mahalle seçiniz.
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col min-h-0" id="tab-chat-content">
              {selectedNeighborhood ? (
                <AiAssistant
                  neighborhood={selectedNeighborhood}
                  sessionId={sessionId}
                  selectedPersona={selectedPersona}
                />
              ) : (
                <div className="py-12 text-center text-xs text-gray-400 italic">
                  Sohbeti başlatmak için lütfen önce bir mahalle seçiniz.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Drag handle divider for resize */}
      <div
        onMouseDown={startResizing}
        className={`w-1.5 h-full hover:bg-indigo-500/40 active:bg-indigo-600 transition-colors cursor-col-resize select-none relative z-30 shrink-0 ${
          isResizing ? "bg-indigo-500" : "bg-gray-100"
        }`}
        title="Sürükleyerek genişletin"
        id="sidebar-divider"
      >
        <div className="absolute inset-y-0 left-[2px] w-[2px] bg-gray-300/30 pointer-events-none" />
      </div>

      {/* 3. Full Screen Map Stage */}
      <div className="flex-1 h-full relative bg-gray-100" id="map-stage-container">
        {selectedNeighborhood && (
          <InteractiveMap
            neighborhoods={filteredNeighborhoods}
            selectedNeighborhood={selectedNeighborhood}
            onSelectNeighborhood={handleSelectNeighborhood}
          />
        )}
      </div>
    </div>
  );
}
