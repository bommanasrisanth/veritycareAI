import React, { useState, useEffect } from 'react';
import {
  DownloadCloud,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  Search,
  BookOpen,
  WifiOff,
  AlertCircle
} from 'lucide-react';
import { AuthoritativeGuideline } from '../types/index.ts';
import { saveOfflineGuidelines, getOfflineGuidelines } from '../utils/db.ts';

export const OfflineKnowledgeTab: React.FC = () => {
  const [offlineGuides, setOfflineGuides] = useState<AuthoritativeGuideline[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [search, setSearch] = useState('');

  const loadLocalGuidelines = async () => {
    const list = await getOfflineGuidelines();
    setOfflineGuides(list);
  };

  useEffect(() => {
    loadLocalGuidelines();
  }, []);

  const handleDownloadPack = async () => {
    setLoading(true);
    setDownloadSuccess(false);
    try {
      const res = await fetch('/api/offline-pack');
      const data = await res.json() as { guidelines: AuthoritativeGuideline[] };
      if (data.guidelines && data.guidelines.length > 0) {
        await saveOfflineGuidelines(data.guidelines);
        await loadLocalGuidelines();
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
      alert('Unable to download offline pack. Ensure server connection is active.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = offlineGuides.filter(
    (g) =>
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.topic.toLowerCase().includes(search.toLowerCase()) ||
      g.keyFacts.some((f) => f.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-teal-700 mb-1">
          <HardDrive className="w-5 h-5 text-teal-600" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Local Offline Medical Repository
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Offline Medical Knowledge
        </h2>
        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
          Cache peer-reviewed clinical guidelines directly to your browser's local IndexedDB so you can search verified indications, antipyretic limits, and emergency warning signs without an active internet connection.
        </p>
      </div>

      {/* Offline Status Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${offlineGuides.length > 0 ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            <h3 className="text-sm font-bold text-slate-900">
              Offline Repository Status: {offlineGuides.length > 0 ? 'Cached & Active' : 'Not Yet Downloaded'}
            </h3>
          </div>
          <p className="text-xs text-slate-600">
            {offlineGuides.length > 0
              ? `${offlineGuides.length} full clinical guidelines stored in browser IndexedDB.`
              : 'Download the offline clinical guidelines bundle for emergency or disconnected access.'}
          </p>
        </div>

        <button
          onClick={handleDownloadPack}
          disabled={loading}
          className="bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <DownloadCloud className="w-4 h-4" />
          )}
          <span>{offlineGuides.length > 0 ? 'Refresh Offline Pack' : 'Download Offline Pack'}</span>
        </button>
      </div>

      {downloadSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Offline medical guideline pack stored successfully into local IndexedDB!</span>
        </div>
      )}

      {/* Search Filter */}
      {offlineGuides.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search offline clinical guidelines..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>
      )}

      {/* Local Guidelines List */}
      <div className="space-y-3">
        {offlineGuides.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 text-xs">
            <WifiOff className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            Click "Download Offline Pack" above to download and store official clinical guidance for offline access.
          </div>
        ) : (
          filtered.map((g, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                  {g.category}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  IndexedDB Local Cache
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900">{g.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                {g.guidelineSummary}
              </p>

              <div>
                <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Key Recommendations:
                </span>
                <ul className="space-y-1 text-xs text-slate-600 pl-4 list-disc">
                  {g.keyFacts.map((fact, fIdx) => (
                    <li key={fIdx} className="leading-relaxed">{fact}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
