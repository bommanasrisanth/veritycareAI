import React from 'react';
import { ShieldCheck, Heart, AlertTriangle } from 'lucide-react';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations.ts';

interface FooterProps {
  lang: SupportedLanguage;
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, setCurrentTab }) => {
  const t = TRANSLATIONS[lang];

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Medical Safety Disclaimer Callout */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 text-slate-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Critical Medical Disclaimer
            </h4>
            <p className="leading-relaxed text-[11px] text-slate-300">
              VerityCare AI is an evidence-first information and research verification platform. It does not provide medical diagnoses, prescribe prescription medications, or replace direct consultation with a qualified medical professional. In an acute medical emergency, immediately dial <strong>112</strong> / <strong>108</strong> (India), <strong>911</strong> (US), or visit your nearest emergency room.
            </p>
          </div>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white">VerityCare AI</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Prioritizing peer-reviewed medical evidence over AI confidence. Verifying claims across independent models and regulatory registries.
            </p>
            <p className="text-[10px] text-teal-400 font-mono">
              Local-First • Zero Cloud Leakage Default
            </p>
          </div>

          {/* Core Modules */}
          <div className="space-y-2">
            <h5 className="font-bold text-white uppercase text-[11px] tracking-wider">Platform Modules</h5>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button onClick={() => setCurrentTab('chat')} className="hover:text-teal-400 transition cursor-pointer">
                  Health Chat &amp; Verification
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('verify')} className="hover:text-teal-400 transition cursor-pointer">
                  Verify Any Medical Answer
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('doctors')} className="hover:text-teal-400 transition cursor-pointer">
                  Find Verified Doctors (NMC)
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('checkin')} className="hover:text-teal-400 transition cursor-pointer">
                  Daily Recovery Tracker
                </button>
              </li>
            </ul>
          </div>

          {/* Evidence Sources */}
          <div className="space-y-2">
            <h5 className="font-bold text-white uppercase text-[11px] tracking-wider">Evidence Sources</h5>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a href="https://www.who.int/" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition">
                  World Health Organization (WHO)
                </a>
              </li>
              <li>
                <a href="https://medlineplus.gov/" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition">
                  U.S. National Library of Medicine
                </a>
              </li>
              <li>
                <a href="https://www.nmc.org.in/" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition">
                  National Medical Commission (NMC)
                </a>
              </li>
              <li>
                <a href="https://main.icmr.nic.in/" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition">
                  ICMR Clinical Practice Guidelines
                </a>
              </li>
            </ul>
          </div>

          {/* Emergency & Support */}
          <div className="space-y-2">
            <h5 className="font-bold text-white uppercase text-[11px] tracking-wider">Emergency Helplines</h5>
            <ul className="space-y-1.5 text-[11px]">
              <li className="flex justify-between">
                <span>National Emergency:</span>
                <span className="font-mono text-white font-bold">112</span>
              </li>
              <li className="flex justify-between">
                <span>Ambulance Service:</span>
                <span className="font-mono text-white font-bold">108 / 102</span>
              </li>
              <li className="flex justify-between">
                <span>Tele-MANAS Mental Health:</span>
                <span className="font-mono text-white font-bold">14416</span>
              </li>
              <li className="flex justify-between">
                <span>US Crisis &amp; Suicide Lifeline:</span>
                <span className="font-mono text-white font-bold">988</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-slate-800 text-[11px] flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500">
          <p>© {new Date().getFullYear()} VerityCare AI. Clinical evidence verification architecture.</p>
          <p className="flex items-center gap-1 text-slate-400">
            Engineered with privacy, medical transparency &amp; patient safety.
          </p>
        </div>
      </div>
    </footer>
  );
};
