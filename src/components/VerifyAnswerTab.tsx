import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  FileCheck2,
  ExternalLink,
  Scale
} from 'lucide-react';
import { VerificationAnalysis } from '../types/index.ts';
import { SupportedLanguage } from '../utils/translations.ts';

interface VerifyAnswerTabProps {
  lang: SupportedLanguage;
}

export const VerifyAnswerTab: React.FC<VerifyAnswerTabProps> = () => {
  const [claimText, setClaimText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationAnalysis | null>(null);

  const sampleClaimsToVerify = [
    'Aspirin should be given to young children with viral fever to break temperature quickly.',
    'Over 90% of acute bronchitis is viral and does not require antibiotic prescription.',
    'Metformin can be continued without adjustments during acute severe kidney failure.',
    'Sudden thunderclap headache reaching maximum severity in seconds requires emergency brain imaging.'
  ];

  const handleVerify = async (textToVerify?: string) => {
    const text = textToVerify || claimText.trim();
    if (!text) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/direct-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimText: text })
      });
      const data = (await res.json()) as VerificationAnalysis;
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Title Header */}
      <div>
        <div className="flex items-center gap-2 text-teal-700 mb-1">
          <Scale className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Independent Clinical Fact-Checking</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Verify Any Health Claim or AI Response
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Paste health advice from social media, another AI chatbot, or a medical article. We extract atomic medical assertions and verify them against peer-reviewed clinical guidelines.
        </p>
      </div>

      {/* Input Text Area */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Enter Claim or AI Response to Verify
        </label>
        <textarea
          rows={4}
          value={claimText}
          onChange={(e) => setClaimText(e.target.value)}
          placeholder="e.g., 'Take aspirin immediately if a child has high viral fever', or paste an answer from another AI..."
          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 font-normal leading-relaxed"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            {claimText.length} characters entered
          </span>
          <button
            onClick={() => handleVerify()}
            disabled={loading || !claimText.trim()}
            className="bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileCheck2 className="w-4 h-4" />}
            <span>Run Medical Verification</span>
          </button>
        </div>
      </div>

      {/* Suggested Test Claims */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4">
        <span className="text-xs font-semibold text-slate-600 block mb-2">
          Or test common assertions against medical benchmarks:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sampleClaimsToVerify.map((claim, idx) => (
            <button
              key={idx}
              onClick={() => {
                setClaimText(claim);
                handleVerify(claim);
              }}
              className="text-left text-xs bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 p-2.5 rounded-xl text-slate-700 font-medium transition cursor-pointer shadow-2xs"
            >
              "{claim}"
            </button>
          ))}
        </div>
      </div>

      {/* Verification Output */}
      {loading && (
        <div className="bg-white border border-teal-200 rounded-2xl p-8 text-center shadow-xs">
          <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-900">Comparing Against Clinical Literature</h4>
          <p className="text-xs text-slate-500 mt-1">
            Segmenting medical assertions and checking contraindications in WHO &amp; MedlinePlus databases...
          </p>
        </div>
      )}

      {result && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in">
          <div className="bg-slate-900 text-white p-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-teal-400 font-bold block">
                Verification Verdict
              </span>
              <h3 className="text-base font-bold mt-0.5">
                {result.comparison_summary}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-mono">Consensus Status</span>
              <span className="text-xs font-bold text-teal-300">{result.recommended_winner}</span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Extracted atomic claims */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                Extracted Medical Claims &amp; Evidentiary Status
              </h4>
              <div className="space-y-3">
                {[...result.model_a.claims, ...result.model_b.claims].map((claim, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800">Claim #{idx + 1}</span>
                      {claim.evidence_status === 'Supported' ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Supported by Clinical Guidelines
                        </span>
                      ) : claim.evidence_status === 'Conflicting evidence' ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-rose-900 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-300">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          Contradicts Established Evidence
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-200 px-2.5 py-0.5 rounded-full">
                          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                          Insufficient / Inconclusive Evidence
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-900">"{claim.text}"</p>

                    {claim.contradicting_evidence.length > 0 && (
                      <div className="mt-2.5 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900">
                        <strong className="block mb-0.5">Clinical Red Flag:</strong>
                        {claim.contradicting_evidence.join(', ')}
                      </div>
                    )}

                    {claim.supporting_evidence.length > 0 && (
                      <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
                        <strong className="block mb-0.5">Authoritative Guideline Match:</strong>
                        {claim.supporting_evidence.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Authoritative Citations */}
            {result.synthesized_answer?.citations && (
              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Official Literature Sources
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.synthesized_answer.citations.map((c, i) => (
                    <a
                      key={i}
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50 transition text-xs flex items-center justify-between"
                    >
                      <span className="font-semibold text-slate-800">{c.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
