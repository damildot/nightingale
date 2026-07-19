import React from "react";
import { Neighborhood, NeighborhoodSummary, SyntheticPersona } from "../types";
import {
  MapPin,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Flame,
  ThumbsUp,
  ThumbsDown,
  Navigation,
  Coffee,
  Trees,
  Volume2,
  CheckCircle,
  HelpCircle,
  Heart,
  Briefcase,
  Store,
  Users,
  VolumeX,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NeighborhoodDetailsProps {
  neighborhood: Neighborhood;
  summary: NeighborhoodSummary | null;
  loadingSummary: boolean;
  selectedPersona: SyntheticPersona | null;
}

export default function NeighborhoodDetails({
  neighborhood,
  summary,
  loadingSummary,
  selectedPersona,
}: NeighborhoodDetailsProps) {
  // Calculate dynamic compatibility match percentage if persona selected
  const calculateCompatibility = (neigh: Neighborhood, persona: SyntheticPersona) => {
    let scoreTotal = 0;
    let counts = 0;

    persona.priorities.forEach((p) => {
      if (p.includes("transportation") || p.includes("public_transport")) {
        scoreTotal += neigh.metrics.transportation;
        counts++;
      } else if (p.includes("cafe") || p.includes("social") || p.includes("cultural") || p.includes("nightlife")) {
        scoreTotal += neigh.metrics.social;
        counts++;
      } else if (p.includes("green") || p.includes("dog_parks") || p.includes("running")) {
        scoreTotal += neigh.metrics.green_ratio;
        counts++;
      } else if (p.includes("acoustic") || p.includes("quiet") || p.includes("flat_streets")) {
        scoreTotal += neigh.metrics.quietness;
        counts++;
      } else {
        // Fallback generic altyapı/güvenlik
        scoreTotal += neigh.life_score;
        counts++;
      }
    });

    return counts > 0 ? Math.round(scoreTotal / counts) : neigh.life_score;
  };

  const compatibility = selectedPersona ? calculateCompatibility(neighborhood, selectedPersona) : null;

  // Visual helper for metric scores
  const getMetricIcon = (key: string) => {
    switch (key) {
      case "transportation":
        return <Navigation className="w-4 h-4 text-sky-500" />;
      case "social":
        return <Coffee className="w-4 h-4 text-amber-500" />;
      case "green_ratio":
        return <Trees className="w-4 h-4 text-emerald-500" />;
      case "quietness":
        return <Volume2 className="w-4 h-4 text-rose-500" />;
      default:
        return <HelpCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getMetricLabel = (key: string) => {
    switch (key) {
      case "transportation":
        return "Ulaşım Entegrasyonu (Metro/Ferry)";
      case "social":
        return "Sosyal Alanlar & Kafe Yoğunluğu";
      case "green_ratio":
        return "Yeşil Alan & Sahil Parkı Oranı";
      case "quietness":
        return "Akustik Sakinlik (Ses Seviyesi)";
      default:
        return key;
    }
  };

  return (
    <div className="flex flex-col gap-6" id="neighborhood-details-wrapper">
      {/* 1. Primary Card: Header & Scores */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" id="neigh-primary-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-1 uppercase font-mono">
              <MapPin className="w-3.5 h-3.5" />
              {neighborhood.city} / {neighborhood.district}
            </div>
            <h2 className="font-sans font-extrabold text-gray-900 text-lg md:text-xl tracking-tight leading-tight">
              {neighborhood.name}
            </h2>
          </div>

          <div className="flex gap-3 text-right">
            <div>
              <span className="text-[9px] uppercase font-bold text-gray-400 font-mono block mb-1">
                İlçe Skoru
              </span>
              <span className="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-sm font-bold font-mono border border-indigo-100 shadow-sm">
                {(neighborhood.district_score || 85) / 10} / 10
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-gray-400 font-mono block mb-1">
                Mahalle Skoru
              </span>
              <span className="inline-flex items-center justify-center bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-sm font-bold font-mono border border-emerald-100 shadow-sm">
                {(neighborhood.life_score / 10).toFixed(1)} / 10
              </span>
            </div>
          </div>
        </div>

        {/* Local Micro-attributes Box with Horizontal Scroll Carousel ("sağa sola kaydırılabilir, dikine sütunlar, alt alta yazılar") */}
        <div className="mt-5 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span className="font-bold uppercase tracking-wider text-[10px] text-indigo-600/90 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" />
              Mahalle Yaşam Dinamikleri
            </span>
          </div>

          <div 
            className="flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-gray-200/80 hover:scrollbar-thumb-gray-300 scrollbar-track-transparent snap-x"
            id="micro-attributes-horizontal-carousel"
          >
            {[
              {
                id: "market",
                title: "Market Erişimi",
                value: neighborhood.grocery_access_profile || "Bilinmiyor",
                icon: <Store className="w-3.5 h-3.5 text-violet-600" />,
                bgColor: "bg-violet-50/30 border-violet-100/40",
                iconBg: "bg-white border border-violet-100 shadow-sm text-violet-600",
              },
              {
                id: "noise",
                title: "Gürültü Seviyesi",
                value: neighborhood.noise_level_profile || "Bilinmiyor",
                icon: <VolumeX className="w-3.5 h-3.5 text-rose-600" />,
                bgColor: "bg-rose-50/30 border-rose-100/40",
                iconBg: "bg-white border border-rose-100 shadow-sm text-rose-600",
              },
              {
                id: "age",
                title: "Sakin Yaş Profili",
                value: neighborhood.avg_age_profile || "Bilinmiyor",
                icon: <Users className="w-3.5 h-3.5 text-blue-600" />,
                bgColor: "bg-blue-50/30 border-blue-100/40",
                iconBg: "bg-white border border-blue-100 shadow-sm text-blue-600",
              },
              {
                id: "transport",
                title: "Ulaşım Altyapısı",
                value: `${neighborhood.metrics.transportation >= 90 ? "Mükemmel" : neighborhood.metrics.transportation >= 75 ? "Çok İyi" : "Yeterli"} (%${neighborhood.metrics.transportation}, Metro/Vapur/Otobüs)`,
                icon: <Navigation className="w-3.5 h-3.5 text-sky-600" />,
                bgColor: "bg-sky-50/30 border-sky-100/40",
                iconBg: "bg-white border border-sky-100 shadow-sm text-sky-600",
              },
              {
                id: "social",
                title: "Kafe & Sosyal Hayat",
                value: `${neighborhood.metrics.social >= 90 ? "Çok Canlı" : neighborhood.metrics.social >= 75 ? "Hareketli" : "Sakin"} (%${neighborhood.metrics.social}, Sosyal mekanlar)`,
                icon: <Coffee className="w-3.5 h-3.5 text-amber-600" />,
                bgColor: "bg-amber-50/30 border-amber-100/40",
                iconBg: "bg-white border border-amber-100 shadow-sm text-amber-600",
              },
              {
                id: "green",
                title: "Yeşil Alan & Sahil",
                value: `${neighborhood.metrics.green_ratio >= 90 ? "Mükemmel Doğa" : neighborhood.metrics.green_ratio >= 75 ? "Geniş Parklar" : "Orta Düzey"} (%${neighborhood.metrics.green_ratio})`,
                icon: <Trees className="w-3.5 h-3.5 text-emerald-600" />,
                bgColor: "bg-emerald-50/30 border-emerald-100/40",
                iconBg: "bg-white border border-emerald-100 shadow-sm text-emerald-600",
              },
              {
                id: "safety",
                title: "Güvenlik & Huzur",
                value: `${neighborhood.metrics.quietness >= 80 ? "Sakin ve Huzurlu" : neighborhood.metrics.quietness >= 60 ? "Güvenli ve Nezih" : "Canlı Ortam"} (%${neighborhood.metrics.quietness})`,
                icon: <Heart className="w-3.5 h-3.5 text-pink-600" />,
                bgColor: "bg-pink-50/30 border-pink-100/40",
                iconBg: "bg-white border border-pink-100 shadow-sm text-pink-600",
              }
            ].map((card) => (
              <div
                key={card.id}
                className={`flex-none w-[104px] h-[185px] p-2.5 rounded-xl border snap-start transition-all duration-200 hover:shadow-sm flex flex-col justify-between ${card.bgColor}`}
              >
                <div className={`p-1 rounded-lg ${card.iconBg} w-fit shrink-0`}>
                  {card.icon}
                </div>
                <div className="mt-2.5 flex-1 flex flex-col justify-start gap-1 overflow-hidden">
                  <span className="text-[8px] text-gray-400 font-extrabold tracking-wider uppercase block leading-tight">{card.title}</span>
                  <p className="text-[10px] text-gray-700 font-bold leading-normal text-left break-words">
                    {card.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Subscores Progress bars */}
        <div className="mt-6 space-y-4" id="neigh-subscores">
          <h3 className="text-xs uppercase font-bold text-gray-400 font-mono tracking-wider">
            Yapay Zeka Yaşam Karnesi
          </h3>
          <div className="grid grid-cols-1 gap-3.5">
            {Object.entries(neighborhood.metrics).map(([key, val]) => (
              <div key={key} className="space-y-1.5" id={`metric-row-${key}`}>
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-2 text-gray-700 font-medium">
                    {getMetricIcon(key)}
                    {getMetricLabel(key)}
                  </span>
                  <span className="font-semibold text-gray-900 font-mono">{val}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${val}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      key === "transportation"
                        ? "bg-sky-500"
                        : key === "social"
                        ? "bg-amber-500"
                        : key === "green_ratio"
                        ? "bg-emerald-500"
                        : "bg-rose-400"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Persona Match Highlight Panel */}
      <AnimatePresence mode="wait">
        {selectedPersona && compatibility !== null && (
          <motion.div
            key={selectedPersona.persona_id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-indigo-900 text-white rounded-2xl p-5 shadow-md relative overflow-hidden"
            id="persona-compatibility-box"
          >
            <div className="absolute right-[-10px] bottom-[-20px] opacity-10">
              <ShieldCheck className="w-32 h-32" />
            </div>
            <div className="flex items-center justify-between gap-3 relative z-10">
              <div>
                <p className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider font-mono">
                  Seçilen Profil Uyumluluğu
                </p>
                <h4 className="font-semibold text-base">
                  {selectedPersona.segment} ile Eşleşme
                </h4>
              </div>
              <div className="bg-indigo-800 border border-indigo-700 px-3 py-1 rounded-full text-sm font-extrabold font-mono text-indigo-100 shadow-inner">
                %{compatibility} Uyumlu
              </div>
            </div>
            <p className="text-xs text-indigo-100/90 mt-3 leading-relaxed">
              Bu mahalle, {selectedPersona.segment} öncelikleri olan{" "}
              <span className="font-semibold text-white">
                {selectedPersona.priorities.slice(0, 2).map((p) => p.split("_")[0]).join(" ve ")}
              </span>{" "}
              kriterlerini {compatibility > 80 ? "üst düzeyde" : "ortalama düzeyde"} karşılamaktadır.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Structured AI Summary Output Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" id="ai-summary-card">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <h3 className="font-sans font-bold text-gray-900 text-base" id="summary-card-title">
              LLM Semantik Analiz Özeti
            </h3>
          </div>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono px-2 py-0.5 rounded-full uppercase">
            Gemini 3.5 Flash
          </span>
        </div>

        {loadingSummary ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3" id="summary-loader">
            <div className="w-8 h-8 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin" />
            <p className="text-xs text-gray-500 animate-pulse">Semantik analiz sentezleniyor...</p>
          </div>
        ) : summary ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
            id="summary-content"
          >
            <p className="text-sm text-gray-600 leading-relaxed italic bg-gray-50/50 p-4 rounded-xl border border-gray-100/40">
              "{summary.summary}"
            </p>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider block">
                Öne Çıkan Semantik Etiketler
              </span>
              <div className="flex flex-wrap gap-1.5" id="summary-tags">
                {summary.positive_tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-medium border border-emerald-100 shadow-sm"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
                {summary.negative_tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg text-xs font-medium border border-rose-100 shadow-sm"
                  >
                    <ThumbsDown className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="py-8 text-center text-xs text-gray-400">
            Mahalle seçildiğinde yapay zeka analizi burada görüntülenecektir.
          </div>
        )}
      </div>

      {/* 5. User Reviews Feed */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" id="raw-reviews-card">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          <h3 className="font-sans font-bold text-gray-900 text-base">
            Mahalle Sakinlerinin Görüşleri
          </h3>
          <span className="text-xs text-gray-500 font-mono">({neighborhood.reviews.length})</span>
        </div>

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin" id="reviews-list">
          {neighborhood.reviews.map((review, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-xl space-y-2 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-xs text-gray-900">{review.author}</h4>
                  <p className="text-[10px] text-gray-500 font-medium">{review.role}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400 font-mono">{review.date}</span>
                  <div className="flex gap-0.5 text-amber-500">
                    {Array.from({ length: review.rating }).map((_, rIdx) => (
                      <span key={rIdx} className="text-xs">★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {review.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
