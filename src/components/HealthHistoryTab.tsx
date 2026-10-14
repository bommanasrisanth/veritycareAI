import React, { useState, useEffect } from 'react';
import {
  History,
  Download,
  Trash2,
  Cloud,
  CloudOff,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Shield,
  ExternalLink
} from 'lucide-react';
import { HealthChatMessage } from '../types/index.ts';
import { getAllChatMessages, purgeAllLocalData, exportAllLocalData } from '../utils/db.ts';

export const HealthHistoryTab: React.FC = () => {
  const [messages, setMessages] = useState<HealthChatMessage[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [cloudSyncOptIn, setCloudSyncOptIn] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');

  const loadData = async () => {
    const list = await getAllChatMessages();
    setMessages(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExport = async () => {
    const jsonStr = await exportAllLocalData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `veritycare_health_export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePurge = async () => {
    await purgeAllLocalData();
    await loadData();
    setShowPurgeConfirm(false);
  };

  const handleToggleCloudSync = async (enabled: boolean) => {
    setCloudSyncOptIn(enabled);
    if (enabled) {
      setSyncStatus('Initiating secure encrypted sync under explicit consent...');
      try {
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            optInConsent: true,
            records: messages
          })
        });
        const data = await res.json() as { message?: string };
        setSyncStatus(data.message || 'Synchronized securely.');
      } catch {
        setSyncStatus('Cloud sync service offline. Data remains safe in local storage.');
      }
    } else {
      setSyncStatus('Cloud synchronization disabled. Only local storage active.');
    }
  };

  const filtered = messages.filter((m) =>
    m.text.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 mb-1">
            <History className="w-5 h-5 text-teal-600" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Local Records &amp; Privacy Management
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Health History &amp; Data Control
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Review past health inquiries and verified findings. You have complete sovereign control to export or permanently erase all data.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExport}
            className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-teal-600" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => setShowPurgeConfirm(true)}
            className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Purge All</span>
          </button>
        </div>
      </div>

      {/* Cloud Sync Opt-In Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">Optional Cloud Synchronization</h3>
              <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                {cloudSyncOptIn ? 'Opted In' : 'Disabled by Default'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
              By default, VerityCare AI never sends your health inquiries or check-in logs to the cloud. You can optionally opt-in to sync encrypted records across your verified devices.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={cloudSyncOptIn}
              onChange={(e) => handleToggleCloudSync(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
          </label>
        </div>

        {syncStatus && (
          <p className="text-xs text-teal-800 bg-teal-50 border border-teal-200 p-2.5 rounded-xl font-medium">
            {syncStatus}
          </p>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filter saved queries by symptom, medication, or topic..."
          className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
        />
      </div>

      {/* History List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 text-xs">
            No health records matched your search. Queries and verifications submitted in the Health Chat will appear here.
          </div>
        ) : (
          filtered.map((msg) => (
            <div
              key={msg.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:border-slate-300 transition space-y-2"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(msg.timestamp).toLocaleString()}
                </span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  msg.sender === 'user' ? 'bg-slate-100 text-slate-700' : 'bg-teal-100 text-teal-800'
                }`}>
                  {msg.sender === 'user' ? 'User Question' : 'Clinical Synthesis'}
                </span>
              </div>

              <p className="text-sm font-medium text-slate-800">{msg.text}</p>

              {msg.verification && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-600">
                    Winner: <strong className="text-teal-700">{msg.verification.recommended_winner}</strong>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {msg.verification.agreements.length} consensus points • {msg.verification.disagreements.length} divergence points
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal for Data Purge */}
      {showPurgeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Purge All Health Records?</h3>
                <p className="text-xs text-slate-500">Irreversible Action</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will permanently delete all chat conversations, verified reports, and daily symptom check-ins from your device's IndexedDB.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPurgeConfirm(false)}
                className="text-xs px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePurge}
                className="text-xs px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer"
              >
                Yes, Purge Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
