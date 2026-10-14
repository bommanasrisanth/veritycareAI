/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { ChatTab } from './components/ChatTab.tsx';
import { VerifyAnswerTab } from './components/VerifyAnswerTab.tsx';
import { DoctorDiscoveryTab } from './components/DoctorDiscoveryTab.tsx';
import { DailyCheckInTab } from './components/DailyCheckInTab.tsx';
import { HealthHistoryTab } from './components/HealthHistoryTab.tsx';
import { MedicalSourcesTab } from './components/MedicalSourcesTab.tsx';
import { OfflineKnowledgeTab } from './components/OfflineKnowledgeTab.tsx';
import { SettingsTab } from './components/SettingsTab.tsx';
import { SupportedLanguage } from './utils/translations.ts';
import { useOnlineStatus } from './hooks/useOnlineStatus.ts';
import { WifiOff } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('chat');
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [doctorSpecialtyFilter, setDoctorSpecialtyFilter] = useState<string>('');
  const isOnline = useOnlineStatus();

  const [systemStatus, setSystemStatus] = useState({
    ollama_active: false,
    cloud_adapter_active: true,
    model_a_name: 'llama3:latest',
    model_b_name: 'mistral:latest',
  });

  // Fetch system health on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.system) {
          setSystemStatus({
            ollama_active: Boolean(data.system.ollama_runtime?.active),
            cloud_adapter_active: Boolean(data.system.cloud_adapter?.active),
            model_a_name: 'llama3:latest',
            model_b_name: 'mistral:latest',
          });
        }
      })
      .catch(console.error);

    // Register PWA service worker if supported
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.log('SW registration note:', err);
        });
      });
    }
  }, []);

  const handleFindDoctors = (specialty: string) => {
    setDoctorSpecialtyFilter(specialty);
    setCurrentTab('doctors');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Offline Alert Sticky Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs px-4 py-2 font-medium flex items-center justify-center gap-2 shadow-sm z-50">
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span>
            You are currently offline. Local medical guidelines and device IndexedDB history remain fully accessible.
          </span>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
        systemStatus={systemStatus}
      />

      {/* Tab Content Body */}
      <main className="flex-1 py-4 sm:py-6">
        {currentTab === 'chat' && (
          <ChatTab
            lang={lang}
            onFindDoctorsForSpecialty={handleFindDoctors}
          />
        )}
        {currentTab === 'verify' && <VerifyAnswerTab lang={lang} />}
        {currentTab === 'doctors' && (
          <DoctorDiscoveryTab
            lang={lang}
            initialSpecialty={doctorSpecialtyFilter}
          />
        )}
        {currentTab === 'checkin' && <DailyCheckInTab lang={lang} />}
        {currentTab === 'history' && <HealthHistoryTab />}
        {currentTab === 'sources' && <MedicalSourcesTab />}
        {currentTab === 'offline' && <OfflineKnowledgeTab />}
        {currentTab === 'settings' && (
          <SettingsTab lang={lang} setLang={setLang} />
        )}
      </main>

      {/* Footer */}
      <Footer lang={lang} setCurrentTab={setCurrentTab} />
    </div>
  );
}
