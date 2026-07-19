import React from "react";
import { SyntheticPersona } from "../types";
import { syntheticPersonas } from "../personas";
import { User, Shield, Briefcase, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface PersonaSelectorProps {
  selectedPersona: SyntheticPersona | null;
  onSelectPersona: (persona: SyntheticPersona) => void;
}

export default function PersonaSelector({
  selectedPersona,
  onSelectPersona,
}: PersonaSelectorProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5" id="persona-selector-container">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-indigo-600" id="persona-title-icon" />
        <h3 className="font-sans font-semibold text-gray-900 text-base" id="persona-title">
          Sentetik Kullanıcı Personaları
        </h3>
      </div>
      <p className="text-xs text-gray-500 mb-4 leading-relaxed" id="persona-subtitle">
        Mahalle verilerinin ve yapay zekanın bu profillerle ne kadar uyumlu olduğunu görmek için bir yaşam tarzı seçin:
      </p>

      <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin" id="personas-grid">
        {syntheticPersonas.map((persona) => {
          const isSelected = selectedPersona?.persona_id === persona.persona_id;
          return (
            <button
              key={persona.persona_id}
              onClick={() => onSelectPersona(persona)}
              id={`persona-btn-${persona.persona_id}`}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-[100px] cursor-pointer ${
                isSelected
                  ? "bg-indigo-50/70 border-indigo-200 shadow-sm"
                  : "bg-gray-50 hover:bg-gray-100/80 border-gray-100"
              }`}
            >
              {isSelected && (
                <div className="absolute right-1 top-1 w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              )}
              <div className="flex items-start gap-1.5">
                <div className={`p-1 rounded-md ${isSelected ? "bg-indigo-100 text-indigo-600" : "bg-gray-200/80 text-gray-600"}`}>
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-medium text-xs text-gray-900 truncate max-w-[100px]">
                    {persona.segment}
                  </h4>
                  <p className="text-[10px] text-gray-500 truncate max-w-[100px]">
                    {persona.occupation}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-1">
                {persona.priorities.slice(0, 2).map((priority, idx) => (
                  <span
                    key={idx}
                    className="text-[8px] bg-white text-gray-600 px-1.5 py-0.5 rounded-full border border-gray-100 font-mono"
                  >
                    #{priority.split("_")[0]}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {selectedPersona && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/60"
          id="active-persona-card"
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-semibold text-indigo-700 font-mono uppercase bg-indigo-100 px-2 py-0.5 rounded">
              {selectedPersona.persona_id}
            </span>
            <span className="text-[11px] text-gray-500">Yaş: {selectedPersona.age}</span>
          </div>
          <h4 className="font-semibold text-xs text-gray-900 mb-1">
            {selectedPersona.segment} — {selectedPersona.occupation}
          </h4>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            {selectedPersona.description}
          </p>
        </motion.div>
      )}
    </div>
  );
}
