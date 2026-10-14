import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Minus,
  Save,
  Trash2,
  Clock,
  Sparkles
} from 'lucide-react';
import { DailyCheckIn } from '../types/index.ts';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations.ts';
import { saveDailyCheckIn, getAllCheckIns, deleteCheckIn } from '../utils/db.ts';

interface DailyCheckInTabProps {
  lang: SupportedLanguage;
}

export const DailyCheckInTab: React.FC<DailyCheckInTabProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [feeling, setFeeling] = useState<'better' | 'same' | 'worsening'>('same');
  const [painScale, setPainScale] = useState<number>(3);
  const [symptomTrend, setSymptomTrend] = useState<'improving' | 'stable' | 'worsening'>('stable');
  const [hasNewSymptoms, setHasNewSymptoms] = useState(false);
  const [notes, setNotes] = useState('');
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [worseningWarning, setWorseningWarning] = useState(false);

  const loadCheckIns = async () => {
    const list = await getAllCheckIns();
    setCheckIns(list);
  };

  useEffect(() => {
    loadCheckIns();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const isWorsening = feeling === 'worsening' || symptomTrend === 'worsening' || painScale >= 8;
    const newEntry: DailyCheckIn = {
      id: `checkin_${Date.now()}`,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      overallFeeling: feeling,
      painScale,
      symptomsTrend: symptomTrend,
      newSymptoms: hasNewSymptoms,
      notes: notes.trim(),
      hasRedFlags: isWorsening,
      redFlagDetails: isWorsening ? 'User reported worsening symptoms or high pain scale.' : undefined
    };

    await saveDailyCheckIn(newEntry);
    await loadCheckIns();

    setSavedSuccess(true);
    setWorseningWarning(isWorsening);
    setNotes('');
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleDelete = async (id: string) => {
    await deleteCheckIn(id);
    await loadCheckIns();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-teal-700 mb-1">
          <Activity className="w-5 h-5 text-teal-600" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Daily Symptom &amp; Recovery Tracker
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          {t.dailyCheckInTitle}
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Monitor your recovery trajectory over time. Check-ins are stored privately in your browser’s IndexedDB. If symptoms escalate or new warning signs appear, appropriate clinical precautions are highlighted.
        </p>
      </div>

      {/* Escalation Safety Notice */}
      {worseningWarning && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 text-amber-950 flex items-start gap-3 shadow-xs animate-in fade-in">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold">Worsening Trend Flagged</h4>
            <p className="text-xs mt-1 leading-relaxed">
              You reported worsening symptoms or high discomfort. Medical recovery is rarely linear, but progressive deterioration or new red-flag symptoms (severe breathlessness, chest discomfort, fainting, high uncontrolled fever) warrant contacting your doctor or primary healthcare clinic promptly.
            </p>
          </div>
        </div>
      )}

      {/* Check-in Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Question 1: Overall feeling */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              1. {t.howFeeling}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'better', label: t.feelingBetter, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 border-emerald-300' },
                { id: 'same', label: t.feelingSame, icon: Minus, color: 'text-slate-600 bg-slate-50 border-slate-300' },
                { id: 'worsening', label: t.feelingWorse, icon: TrendingDown, color: 'text-rose-600 bg-rose-50 border-rose-300' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = feeling === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFeeling(item.id as any)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? `${item.color} ring-2 ring-teal-600/30`
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 2: Pain Scale */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                2. {t.painScaleLabel}
              </label>
              <span className="font-mono text-xs font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                Level {painScale} / 10
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={painScale}
              onChange={(e) => setPainScale(parseInt(e.target.value, 10))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>0 (No Pain)</span>
              <span>5 (Moderate)</span>
              <span>10 (Severe / Worst)</span>
            </div>
          </div>

          {/* Question 3: Symptom Trend */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              3. {t.symptomsTrendLabel}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'improving', label: t.trendImproving },
                { id: 'stable', label: t.trendStable },
                { id: 'worsening', label: t.trendWorsening }
              ].map((trend) => (
                <button
                  key={trend.id}
                  type="button"
                  onClick={() => setSymptomTrend(trend.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                    symptomTrend === trend.id
                      ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {trend.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question 4: New or different symptoms */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="newSymptomsCheck"
              checked={hasNewSymptoms}
              onChange={(e) => setHasNewSymptoms(e.target.checked)}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
            />
            <label htmlFor="newSymptomsCheck" className="text-xs text-slate-800 font-medium cursor-pointer">
              Is anything new or different since your last check-in?
            </label>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              5. {t.notesLabel}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., 'Fever down to 99°F after paracetamol; appetite slowly returning; still dry cough'"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Check-in logged to local IndexedDB!
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">
                100% saved locally on this device
              </span>
            )}

            <button
              type="submit"
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{t.saveCheckInButton}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Recovery History Timeline */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            Check-In History Timeline ({checkIns.length} Records)
          </h3>
          <span className="text-[11px] text-slate-400">Chronological Progression</span>
        </div>

        {checkIns.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            No check-in entries yet. Record today's status above to begin tracking your symptom timeline.
          </p>
        ) : (
          <div className="space-y-3">
            {checkIns.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{item.dateStr}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                      item.overallFeeling === 'better'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.overallFeeling === 'worsening'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.overallFeeling}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Pain: {item.painScale}/10
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-slate-700 italic">"{item.notes}"</p>
                  )}
                  {item.hasRedFlags && (
                    <span className="text-[11px] text-rose-700 font-semibold block">
                      ⚠ Escalation flagged
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition"
                  title="Delete check-in"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
