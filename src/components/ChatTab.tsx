import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  Volume2,
  VolumeX,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import {
  HealthChatMessage,
  ClarifyingAssessment,
  VerificationAnalysis,
  EvidenceStatus
} from '../types/index.ts';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations.ts';
import { saveChatMessage, getAllChatMessages } from '../utils/db.ts';
import { EmergencyBanner } from './EmergencyBanner.tsx';

interface ChatTabProps {
  lang: SupportedLanguage;
  onFindDoctorsForSpecialty?: (specialty: string) => void;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  lang,
  onFindDoctorsForSpecialty,
}) => {
  const t = TRANSLATIONS[lang];
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [messages, setMessages] = useState<HealthChatMessage[]>([]);
  const [activeClarification, setActiveClarification] = useState<ClarifyingAssessment | null>(null);
  const [clarificationAnswers, setClarificationAnswers] = useState<Record<string, string>>({});
  const [pendingUserQuery, setPendingUserQuery] = useState<string>('');
  const [emergencyAlert, setEmergencyAlert] = useState<{ message: string; contacts: Array<{ label: string; number: string }> } | null>(null);

  // Document upload state
  const [uploadedDoc, setUploadedDoc] = useState<{ fileName: string; text: string; size: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio voice recognition
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Expanded views in claim cards
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Load chat history on mount
  useEffect(() => {
    getAllChatMessages().then((loaded) => {
      if (loaded.length > 0) {
        setMessages(loaded);
      }
    });

    // Initialize Web Speech Recognition if available
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        recog.lang = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-US';

        recog.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsListening(false);
        };
        recog.onerror = () => setIsListening(false);
        recog.onend = () => setIsListening(false);
        recognitionRef.current = recog;
      }
    }
  }, [lang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const speakText = (text: string, msgId: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);
    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setUploadedDoc({
        fileName: file.name,
        text: content.slice(0, 4000), // safe sample length
        size: file.size
      });
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (overrideQuery?: string, contextOverride?: string) => {
    const query = overrideQuery || inputText.trim();
    if (!query && !uploadedDoc) return;

    const userMessage: HealthChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: Date.now(),
      attachedDocument: uploadedDoc ? {
        fileName: uploadedDoc.fileName,
        fileSize: uploadedDoc.size,
        extractedText: uploadedDoc.text
      } : undefined
    };

    setMessages((prev) => [...prev, userMessage]);
    await saveChatMessage(userMessage);

    setInputText('');
    setUploadedDoc(null);
    setLoading(true);
    setLoadingStep('Assessing clinical triage & red flags...');

    try {
      // Step 1: Check for red flags & clarifying needs
      const clarifyRes = await fetch('/api/clarify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const clarifyData = (await clarifyRes.json()) as ClarifyingAssessment;

      if (clarifyData.is_urgent) {
        setEmergencyAlert({
          message: clarifyData.urgent_warning_message || 'Urgent care signs identified.',
          contacts: clarifyData.emergency_contacts || []
        });
        setLoading(false);
        return;
      }

      // If missing details and not already answering clarification
      if (clarifyData.needs_clarification && !contextOverride) {
        setActiveClarification(clarifyData);
        setPendingUserQuery(query);
        setLoading(false);
        return;
      }

      // Step 2: Dual model execution & evidence verification
      setLoadingStep('Querying Model A & Model B independently...');
      const verifyRes = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          context: contextOverride || (userMessage.attachedDocument ? `Attached Report Content: ${userMessage.attachedDocument.extractedText}` : undefined)
        })
      });

      setLoadingStep('Verifying extracted claims against WHO, MedlinePlus & PubMed...');
      const verifyData = (await verifyRes.json()) as VerificationAnalysis;

      const assistantMessage: HealthChatMessage = {
        id: `msg_asst_${Date.now()}`,
        sender: 'assistant',
        text: verifyData.synthesized_answer?.summary || 'Verification completed.',
        timestamp: Date.now(),
        verification: verifyData
      };

      setMessages((prev) => [...prev, assistantMessage]);
      await saveChatMessage(assistantMessage);
      setActiveClarification(null);
      setClarificationAnswers({});
    } catch (err) {
      console.error(err);
      const errorMsg: HealthChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'system_alert',
        text: 'Unable to reach verification service. Local medical offline guidelines remain available in the Offline tab.',
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, errorMsg]);
      await saveChatMessage(errorMsg);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleClarificationSubmit = () => {
    const details = Object.entries(clarificationAnswers)
      .map(([k, v]) => `${k.replace('q_', '')}: ${v}`)
      .join('; ');
    handleSubmit(pendingUserQuery, details);
  };

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getStatusBadge = (status: EvidenceStatus) => {
    switch (status) {
      case 'Supported':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Supported by Evidence
          </span>
        );
      case 'Conflicting evidence':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-300">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Conflicting Evidence
          </span>
        );
      case 'Insufficient evidence':
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-300">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            Insufficient Evidence
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded">
            Not Verified
          </span>
        );
    }
  };

  const sampleQueries = [
    'Toddler has 101.5°F fever for 2 days with runny nose',
    'Blood pressure measured 150/95 with mild throbbing headache',
    'Can I take paracetamol with antihypertensive medications?',
    'Persistent dry cough for 3 weeks without fever'
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Emergency Red Flag Alert Banner */}
      {emergencyAlert && (
        <EmergencyBanner
          message={emergencyAlert.message}
          emergencyContacts={emergencyAlert.contacts}
          onAcknowledge={() => setEmergencyAlert(null)}
        />
      )}

      {/* Suggested Medical Query Examples */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Common Health Queries for Evidence Testing
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(q);
                handleSubmit(q);
              }}
              className="text-xs text-left bg-white hover:bg-teal-50 hover:border-teal-300 border border-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-xl transition shadow-2xs cursor-pointer"
            >
              "{q}"
            </button>
          ))}
        </div>
      </div>

      {/* Clarifying Questions Card (When Missing Critical Context) */}
      {activeClarification && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-teal-600 text-white rounded-xl">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900">{t.clarifyTitle}</h3>
              <p className="text-xs text-slate-600 mt-0.5">{t.clarifySubtitle}</p>

              <div className="mt-4 space-y-4">
                {activeClarification.clarifying_questions.map((q) => (
                  <div key={q.id} className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-800">{q.question}</label>
                    <div className="flex flex-wrap gap-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = clarificationAnswers[q.id] === opt;
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() =>
                              setClarificationAnswers((prev) => ({ ...prev, [q.id]: opt }))
                            }
                            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
                              isSelected
                                ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={handleClarificationSubmit}
                  className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>{t.continueWithDetails}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleSubmit(pendingUserQuery, 'Standard adult inquiry')}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium px-3 py-2 cursor-pointer"
                >
                  {t.skipClarify}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Conversation Stream */}
      <div className="space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            {/* User Message Bubble */}
            {msg.sender === 'user' && (
              <div className="max-w-2xl bg-slate-900 text-white rounded-2xl rounded-tr-xs px-4 py-3 shadow-md">
                <p className="text-sm leading-relaxed">{msg.text}</p>
                {msg.attachedDocument && (
                  <div className="mt-2 pt-2 border-t border-slate-700 flex items-center gap-2 text-xs text-teal-300 font-mono">
                    <FileText className="w-4 h-4" />
                    <span>Attached Report: {msg.attachedDocument.fileName}</span>
                  </div>
                )}
                <div className="mt-1 text-[10px] text-slate-400 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )}

            {/* Assistant / Verification Result Card */}
            {msg.sender === 'assistant' && msg.verification && (
              <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Result Header */}
                <div className="bg-slate-900 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold tracking-tight">Verified Clinical Synthesis</h4>
                      <p className="text-[11px] text-slate-400">
                        {msg.verification.comparison_summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        speakText(
                          `${msg.verification?.synthesized_answer?.summary || ''}. Key points: ${msg.verification?.synthesized_answer?.key_verified_points.join('. ')}`,
                          msg.id
                        )
                      }
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Audio voice readout"
                    >
                      {speakingMessageId === msg.id ? (
                        <VolumeX className="w-4 h-4 text-teal-400 animate-pulse" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                    <span className="text-xs font-mono font-medium bg-teal-950 text-teal-300 px-2.5 py-1 rounded-md border border-teal-800">
                      Winner: {msg.verification.recommended_winner}
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-6">
                  {/* Verified Direct Summary */}
                  {msg.verification.synthesized_answer && (
                    <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                        {t.verifiedFindings}
                      </h5>
                      <p className="text-sm text-slate-800 font-medium leading-relaxed">
                        {msg.verification.synthesized_answer.summary}
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-700 pl-4 list-disc">
                        {msg.verification.synthesized_answer.key_verified_points.map((pt, pIdx) => (
                          <li key={pIdx} className="leading-relaxed">{pt}</li>
                        ))}
                      </ul>

                      {msg.verification.synthesized_answer.uncertainties_and_conflicts.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-amber-900 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200">
                          <span className="font-semibold block mb-1">Uncertainties &amp; Clinical Limits:</span>
                          <ul className="list-disc pl-4 space-y-1">
                            {msg.verification.synthesized_answer.uncertainties_and_conflicts.map((u, uIdx) => (
                              <li key={uIdx}>{u}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dual AI Models Side-by-Side Scoring */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-teal-600" />
                      {t.modelComparison} (Transparent Scoring Weights: Accuracy 60%, Completeness 15%, Clarity 10%, Uncertainty 15%)
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Model A Card */}
                      <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div>
                            <span className="text-xs font-bold text-slate-900">
                              {msg.verification.model_a.name}
                            </span>
                            <span className="block text-[11px] font-mono text-slate-500">
                              Runtime: {msg.verification.model_a.runtime_status}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-extrabold text-teal-700">
                              {msg.verification.model_a.score.total_score}
                            </span>
                            <span className="text-[10px] text-slate-400 block">/ 100</span>
                          </div>
                        </div>

                        {/* Scores breakdown */}
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-slate-500 text-[10px] block">Evidence Accuracy (60%)</span>
                            <span className="font-bold text-slate-800">{msg.verification.model_a.score.evidence_accuracy}%</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-slate-500 text-[10px] block">Completeness (15%)</span>
                            <span className="font-bold text-slate-800">{msg.verification.model_a.score.completeness}%</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-slate-500 text-[10px] block">Clarity (10%)</span>
                            <span className="font-bold text-slate-800">{msg.verification.model_a.score.clarity}%</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-slate-500 text-[10px] block">Uncertainty (15%)</span>
                            <span className="font-bold text-slate-800">{msg.verification.model_a.score.uncertainty_handling}%</span>
                          </div>
                        </div>

                        {/* Expand full text */}
                        <button
                          onClick={() => toggleSection(`${msg.id}_a_text`)}
                          className="mt-3 text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <span>{expandedSections[`${msg.id}_a_text`] ? 'Hide Raw Response' : 'View Full Model A Response'}</span>
                          {expandedSections[`${msg.id}_a_text`] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        {expandedSections[`${msg.id}_a_text`] && (
                          <div className="mt-2 p-3 bg-slate-50 rounded-lg text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto border border-slate-200">
                            {msg.verification.model_a.raw_response}
                          </div>
                        )}
                      </div>

                      {/* Model B Card */}
                      <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div>
                            <span className="text-xs font-bold text-slate-900">
                              {msg.verification.model_b.name}
                            </span>
                            <span className="block text-[11px] font-mono text-slate-500">
                              Runtime: {msg.verification.model_b.runtime_status}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-extrabold text-teal-700">
                              {msg.verification.model_b.score.total_score}
                            </span>
                            <span className="text-[10px] text-slate-400 block">/ 100</span>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-slate-500 text-[10px] block">Evidence Accuracy (60%)</span>
                            <span className="font-bold text-slate-800">{msg.verification.model_b.score.evidence_accuracy}%</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-slate-500 text-[10px] block">Completeness (15%)</span>
                            <span className="font-bold text-slate-800">{msg.verification.model_b.score.completeness}%</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-slate-500 text-[10px] block">Clarity (10%)</span>
                            <span className="font-bold text-slate-800">{msg.verification.model_b.score.clarity}%</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-slate-500 text-[10px] block">Uncertainty (15%)</span>
                            <span className="font-bold text-slate-800">{msg.verification.model_b.score.uncertainty_handling}%</span>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleSection(`${msg.id}_b_text`)}
                          className="mt-3 text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <span>{expandedSections[`${msg.id}_b_text`] ? 'Hide Raw Response' : 'View Full Model B Response'}</span>
                          {expandedSections[`${msg.id}_b_text`] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        {expandedSections[`${msg.id}_b_text`] && (
                          <div className="mt-2 p-3 bg-slate-50 rounded-lg text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto border border-slate-200">
                            {msg.verification.model_b.raw_response}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Extracted Atomic Claims Breakdown */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-600" />
                      {t.claimsAnalysis}
                    </h5>
                    <div className="space-y-2.5">
                      {[...msg.verification.model_a.claims, ...msg.verification.model_b.claims].map((claim, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white transition"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                            <span className="text-[11px] font-mono text-slate-500 uppercase font-bold">
                              Claim from {claim.model} [{claim.category}]
                            </span>
                            {getStatusBadge(claim.evidence_status)}
                          </div>
                          <p className="text-xs font-medium text-slate-800 leading-relaxed">
                            "{claim.text}"
                          </p>

                          {claim.supporting_evidence.length > 0 && (
                            <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                              <span className="font-bold">Supporting Medical Benchmark:</span> {claim.supporting_evidence[0]}
                            </div>
                          )}

                          {claim.contradicting_evidence.length > 0 && (
                            <div className="mt-2 text-[11px] text-rose-800 bg-rose-50 p-2 rounded-lg border border-rose-200">
                              <span className="font-bold">Contradiction Detected:</span> {claim.contradicting_evidence[0]}
                            </div>
                          )}

                          {claim.sources.length > 0 && (
                            <div className="mt-2 flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60">
                              <span className="text-[10px] text-slate-400 font-medium">Traceable Source:</span>
                              {claim.sources.map((src, sIdx) => (
                                <a
                                  key={sIdx}
                                  href={src.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-teal-700 hover:underline flex items-center gap-1 font-semibold"
                                >
                                  <span>{src.org} ({src.year || '2024'})</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Authoritative Citations */}
                  {msg.verification.synthesized_answer?.citations && (
                    <div className="pt-4 border-t border-slate-200">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-teal-600" />
                        {t.officialCitations}
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.verification.synthesized_answer.citations.map((cite, cIdx) => (
                          <a
                            key={cIdx}
                            href={cite.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-teal-50/60 hover:border-teal-300 transition text-xs flex flex-col justify-between group"
                          >
                            <span className="font-semibold text-slate-800 group-hover:text-teal-900">
                              {cite.title}
                            </span>
                            <span className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                              <span>{cite.org} {cite.year ? `(${cite.year})` : ''}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-teal-700" />
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Doctor recommendation action */}
                  <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-teal-950 font-medium leading-relaxed">
                      {msg.verification.synthesized_answer?.consult_recommendation ||
                        'Consult a licensed physician for individualized diagnosis and prescription.'}
                    </p>
                    {onFindDoctorsForSpecialty && (
                      <button
                        onClick={() => onFindDoctorsForSpecialty('General Medicine')}
                        className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer shadow-xs"
                      >
                        Find Verified Doctors
                      </button>
                    )}
                  </div>

                  {/* Ethical Medical Disclaimer */}
                  <p className="text-[11px] text-slate-400 italic text-center">
                    {msg.verification.disclaimer}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading Progress State */}
        {loading && (
          <div className="bg-white border border-teal-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <RefreshCw className="w-6 h-6 text-teal-600 animate-spin shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Verifying Clinical Evidence</p>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">{loadingStep}</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Submission Bar */}
      <div className="sticky bottom-4 z-30 bg-white/95 backdrop-blur-md border border-slate-300 rounded-2xl shadow-lg p-3">
        {uploadedDoc && (
          <div className="mb-2.5 p-2 bg-teal-50 rounded-lg border border-teal-200 flex items-center justify-between text-xs text-teal-900">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-700" />
              <span className="font-medium truncate max-w-xs">{uploadedDoc.fileName}</span>
              <span className="text-[10px] text-teal-600 font-mono">({Math.round(uploadedDoc.size / 1024)} KB)</span>
            </div>
            <button
              onClick={() => setUploadedDoc(null)}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              ×
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex items-center gap-2"
        >
          {/* Document Attachment Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.pdf,.csv,.json"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="Attach medical lab report or prescription text"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-slate-500 hover:text-teal-700 hover:bg-slate-100'
            }`}
            title="Voice input"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? 'Listening to your voice...' : t.chatPlaceholder}
            disabled={loading}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || (!inputText.trim() && !uploadedDoc)}
            className="bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>{t.askButton}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <p className="mt-2 text-[10px] text-slate-400 text-center">
          {t.privacyNotice}
        </p>
      </div>
    </div>
  );
};
