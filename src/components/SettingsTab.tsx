import React, { useState, useEffect } from 'react';
import {
  Settings,
  Cpu,
  Sliders,
  Shield,
  Save,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Lock,
  Globe,
  Database
} from 'lucide-react';
import { SupportedLanguage } from '../utils/translations.ts';

interface SettingsTabProps {
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ lang, setLang }) => {
  const [ollamaUrl, setOllamaUrl] = useState('http://127.0.0.1:11434');
  const [modelAName, setModelAName] = useState('llama3:latest');
  const [modelBName, setModelBName] = useState('mistral:latest');
  const [weights, setWeights] = useState({
    evidence_accuracy: 60,
    completeness: 15,
    clarity: 10,
    uncertainty_handling: 15
  });

  const [testingOllama, setTestingOllama] = useState(false);
  const [ollamaStatusMessage, setOllamaStatusMessage] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((cfg) => {
        if (cfg.ollamaBaseUrl) setOllamaUrl(cfg.ollamaBaseUrl);
        if (cfg.modelAName) setModelAName(cfg.modelAName);
        if (cfg.modelBName) setModelBName(cfg.modelBName);
        if (cfg.weights) {
          setWeights({
            evidence_accuracy: Math.round((cfg.weights.evidence_accuracy || 0.6) * 100),
            completeness: Math.round((cfg.weights.completeness || 0.15) * 100),
            clarity: Math.round((cfg.weights.clarity || 0.10) * 100),
            uncertainty_handling: Math.round((cfg.weights.uncertainty_handling || 0.15) * 100)
          });
        }
      })
      .catch(console.error);
  }, []);

  const testOllama = async () => {
    setTestingOllama(true);
    setOllamaStatusMessage(null);
    try {
      const res = await fetch('/api/health');
      const data = await res.json() as any;
      const ollama = data.system?.ollama_runtime;
      if (ollama?.active) {
        setOllamaStatusMessage(`Connected! Found models: ${ollama.models_available.join(', ') || 'None pulled yet'}`);
      } else {
        setOllamaStatusMessage(`Offline / Not Reachable: ${ollama?.status_message || 'Cannot connect to 127.0.0.1:11434'}. Cloud verified adapter is active as fallback.`);
      }
    } catch {
      setOllamaStatusMessage('Could not reach backend health service.');
    } finally {
      setTestingOllama(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ollamaBaseUrl: ollamaUrl,
      modelAName: modelAName,
      modelBName: modelBName,
      weights: {
        evidence_accuracy: weights.evidence_accuracy / 100,
        completeness: weights.completeness / 100,
        clarity: weights.clarity / 100,
        uncertainty_handling: weights.uncertainty_handling / 100
      }
    };

    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Error updating configuration.');
    }
  };

  const totalWeights = weights.evidence_accuracy + weights.completeness + weights.clarity + weights.uncertainty_handling;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-teal-700 mb-1">
          <Settings className="w-5 h-5 text-teal-600" />
          <span className="text-xs font-bold uppercase tracking-wider">
            System &amp; Verification Architecture
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Settings &amp; Model Orchestration
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Configure independent open-source models, local Ollama endpoints, scoring weights, and privacy options. All API keys and private configurations remain safely isolated on the backend.
        </p>
      </div>

      <form onSubmit={handleSaveConfig} className="space-y-6">
        {/* Language Selection */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Globe className="w-4 h-4 text-teal-600" />
            Language Preference
          </h3>
          <p className="text-xs text-slate-500">
            Select your preferred display language. Important medical terms and citations remain faithful to source literature.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'en', label: 'English (Default)', sub: 'Primary medical ontology' },
              { id: 'te', label: 'తెలుగు (Telugu)', sub: 'ఆంధ్రప్రదేశ్ & తెలంగాణ' },
              { id: 'hi', label: 'हिंदी (Hindi)', sub: 'राष्ट्रीय स्तर पर मान्य' }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLang(item.id as SupportedLanguage)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  lang === item.id
                    ? 'bg-teal-50 border-teal-500 text-teal-900 ring-1 ring-teal-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="block text-xs font-bold">{item.label}</span>
                <span className="block text-[11px] text-slate-400 mt-0.5">{item.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Local Open-Source AI Runtime (Ollama) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-600" />
              Independent AI Model Runtime (Ollama)
            </h3>
            <button
              type="button"
              onClick={testOllama}
              disabled={testingOllama}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              {testingOllama ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>Test Runtime Connection</span>
            </button>
          </div>

          {ollamaStatusMessage && (
            <div className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${
              ollamaStatusMessage.includes('Connected')
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-900 border border-amber-200'
            }`}>
              {ollamaStatusMessage.includes('Connected') ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <span>{ollamaStatusMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ollama Endpoint URL
              </label>
              <input
                type="text"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                placeholder="http://127.0.0.1:11434"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Model A Name
              </label>
              <input
                type="text"
                value={modelAName}
                onChange={(e) => setModelAName(e.target.value)}
                placeholder="llama3:latest"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Model B Name
              </label>
              <input
                type="text"
                value={modelBName}
                onChange={(e) => setModelBName(e.target.value)}
                placeholder="mistral:latest"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Transparent Verification Weights */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-600" />
              Model Comparison Weights (Evidence Priority)
            </h3>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
              totalWeights === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              Total: {totalWeights}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <span>Evidence Accuracy &amp; Clinical Quality</span>
                <span className="font-mono text-teal-700">{weights.evidence_accuracy}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="80"
                value={weights.evidence_accuracy}
                onChange={(e) => setWeights({ ...weights, evidence_accuracy: parseInt(e.target.value, 10) })}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Heaviest weight: penalizes contradicted claims.</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <span>Completeness &amp; Red-Flag Coverage</span>
                <span className="font-mono text-teal-700">{weights.completeness}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={weights.completeness}
                onChange={(e) => setWeights({ ...weights, completeness: parseInt(e.target.value, 10) })}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Assesses presence of necessary safety caveats.</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <span>Clarity &amp; Structure</span>
                <span className="font-mono text-teal-700">{weights.clarity}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                value={weights.clarity}
                onChange={(e) => setWeights({ ...weights, clarity: parseInt(e.target.value, 10) })}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Readability and non-jargon comprehension.</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <span>Appropriate Uncertainty Handling</span>
                <span className="font-mono text-teal-700">{weights.uncertainty_handling}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={weights.uncertainty_handling}
                onChange={(e) => setWeights({ ...weights, uncertainty_handling: parseInt(e.target.value, 10) })}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Values prudent refusal to speculate without evidence.</span>
            </div>
          </div>
        </div>

        {/* Security & Secret Management Commitment */}
        <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 shadow-xs space-y-3 border border-slate-800">
          <div className="flex items-center gap-2 text-teal-400">
            <Lock className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Zero Secret Exposure &amp; Local-First Architecture
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            In compliance with healthcare security best practices:
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 pl-4 list-disc">
            <li>No API keys or cloud database tokens exist in browser source code or network responses.</li>
            <li>All AI model execution, PubMed API proxies, and credential stores operate exclusively server-side.</li>
            <li>User symptom check-ins and chat histories are saved to local IndexedDB by default.</li>
            <li>Application logs strictly exclude sensitive personal health parameters.</li>
          </ul>
        </div>

        {/* Save CTA */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saveSuccess && (
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Settings updated successfully!
            </span>
          )}
          <button
            type="submit"
            className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
