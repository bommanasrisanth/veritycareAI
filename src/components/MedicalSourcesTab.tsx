import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ExternalLink,
  ShieldCheck,
  Search,
  CheckCircle2,
  Calendar,
  Building2,
  FileCheck
} from 'lucide-react';
import { AuthoritativeGuideline } from '../types/index.ts';

export const MedicalSourcesTab: React.FC = () => {
  const [guidelines, setGuidelines] = useState<AuthoritativeGuideline[]>([]);
  const [registries, setRegistries] = useState<Array<{ name: string; url: string; purpose: string }>>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/medical-sources')
      .then((r) => r.json())
      .then((data) => {
        setGuidelines(data.guidelines || []);
        setRegistries(data.authoritative_registries || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = guidelines.filter(
    (g) =>
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.topic.toLowerCase().includes(search.toLowerCase()) ||
      g.organization.toLowerCase().includes(search.toLowerCase()) ||
      g.keyFacts.some((f) => f.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-teal-700 mb-1">
          <BookOpen className="w-5 h-5 text-teal-600" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Authoritative Medical Evidence Registry
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Medical Sources &amp; Clinical Guidelines
        </h2>
        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
          In VerityCare AI, clinical evidence takes absolute priority over AI model fluency or confidence. Two AI models agreeing does not establish medical truth. Below are the indexed peer-reviewed resources and official regulatory registries used by our verification pipeline.
        </p>
      </div>

      {/* Official Registries Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-teal-600" />
          Accredited Clinical &amp; Licensure Registries
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {registries.map((reg, idx) => (
            <a
              key={idx}
              href={reg.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-teal-50/60 hover:border-teal-300 transition text-xs flex flex-col justify-between group"
            >
              <div>
                <span className="font-bold text-slate-900 group-hover:text-teal-900 block">
                  {reg.name}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block leading-relaxed">
                  {reg.purpose}
                </span>
              </div>
              <span className="text-[10px] text-teal-700 font-semibold mt-2 flex items-center gap-1">
                <span>Official Portal</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search guidelines by clinical condition, drug, or guideline body..."
          className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
        />
      </div>

      {/* Guidelines Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-500">
            Loading authoritative medical guidelines...
          </div>
        ) : (
          filtered.map((g, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 hover:border-teal-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-bold">
                      {g.category}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      Updated: {g.lastUpdated}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{g.title}</h3>
                  <p className="text-xs text-teal-700 font-medium">{g.organization} ({g.year})</p>
                </div>

                <a
                  href={g.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition"
                >
                  <span>View Guideline</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                {g.guidelineSummary}
              </p>

              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Verified Clinical Principles:
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600">
                  {g.keyFacts.map((fact, fIdx) => (
                    <li
                      key={fIdx}
                      className="flex items-start gap-1.5 bg-slate-50/60 p-2 rounded-lg border border-slate-100"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {g.redFlags && g.redFlags.length > 0 && (
                <div className="pt-2 text-xs text-rose-900 bg-rose-50/70 p-2.5 rounded-xl border border-rose-200">
                  <span className="font-bold block mb-1">Key Emergency Red Flags:</span>
                  <span className="leading-relaxed">{g.redFlags.join(' • ')}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
