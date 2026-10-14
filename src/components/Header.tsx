import React, { useState } from 'react';
import {
  ShieldCheck,
  Wifi,
  WifiOff,
  Download,
  Languages,
  Cpu,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations.ts';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  systemStatus: {
    ollama_active: boolean;
    cloud_adapter_active: boolean;
    model_a_name: string;
    model_b_name: string;
  };
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  systemStatus,
}) => {
  const t = TRANSLATIONS[lang];
  const isOnline = useOnlineStatus();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'chat', label: t.navChat },
    { id: 'verify', label: t.navVerify },
    { id: 'doctors', label: t.navDoctors },
    { id: 'checkin', label: t.navCheckIn },
    { id: 'history', label: t.navHistory },
    { id: 'sources', label: t.navSources },
    { id: 'offline', label: t.navOffline },
    { id: 'settings', label: t.navSettings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner: Status & Quick Info */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-teal-400">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            Evidence-First Architecture
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:flex items-center gap-1 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-teal-400" />
            {systemStatus.ollama_active ? (
              <span className="text-emerald-400 font-mono">Local Ollama: Connected</span>
            ) : systemStatus.cloud_adapter_active ? (
              <span className="text-teal-300 font-mono">Cloud Verified Adapter: Active</span>
            ) : (
              <span className="text-amber-400 font-mono">Local Medical Knowledge: Offline Ready</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Connectivity Status */}
          <div className="flex items-center gap-1">
            {isOnline ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Online Registry</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline Mode</span>
              </span>
            )}
          </div>

          <span className="text-slate-600">|</span>

          {/* Language Switcher */}
          <div className="flex items-center gap-1">
            <Languages className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as SupportedLanguage)}
              className="bg-slate-800 text-slate-200 text-xs rounded px-2 py-0.5 border border-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="en">English</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
          </div>

          {/* PWA Install Button */}
          {!isInstalled && isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-1 bg-teal-600 hover:bg-teal-500 text-white px-2 py-0.5 rounded text-xs font-medium transition cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>{t.installApp}</span>
            </button>
          )}

          {!isInstalled && isIOS && (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-xs transition cursor-pointer"
            >
              <Download className="w-3 h-3 text-teal-400" />
              <span>Install iOS</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Header Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => setCurrentTab('chat')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-slate-900 flex items-center justify-center text-white shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-teal-700 transition">
                  VerityCare
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Evidence-First Healthcare &amp; Doctor Discovery
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    active
                      ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-200 grid grid-cols-2 gap-1.5">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-lg text-left text-xs font-medium transition ${
                    active
                      ? 'bg-teal-100 text-teal-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* iOS Installation Instructions Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Install VerityCare AI</h3>
                <p className="text-xs text-slate-500">For Apple iPhone / iPad</p>
              </div>
            </div>
            <div className="space-y-3 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <p className="flex items-start gap-2">
                <span className="font-bold text-teal-700">1.</span>
                <span>Tap the <strong className="text-slate-800">Share</strong> icon at the bottom of Safari.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-teal-700">2.</span>
                <span>Scroll down and tap <strong className="text-slate-800">Add to Home Screen</strong>.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-teal-700">3.</span>
                <span>Launch directly from your home screen with offline emergency access.</span>
              </p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full rounded-xl bg-teal-700 py-2.5 text-xs font-semibold text-white hover:bg-teal-800 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
