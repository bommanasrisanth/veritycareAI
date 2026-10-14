import React from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, ArrowRight } from 'lucide-react';

interface EmergencyBannerProps {
  message: string;
  emergencyContacts?: Array<{ label: string; number: string }>;
  onAcknowledge?: () => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  message,
  emergencyContacts = [
    { label: 'India Emergency & Ambulance', number: '112 / 108' },
    { label: 'US / Canada 911', number: '911' },
    { label: 'UK & EU 999 / 112', number: '112' }
  ],
  onAcknowledge
}) => {
  return (
    <div className="bg-red-700 text-white rounded-2xl shadow-xl overflow-hidden border border-red-800 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="p-5 sm:p-6 bg-gradient-to-r from-red-700 via-red-800 to-rose-900">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 backdrop-blur-xs rounded-xl shrink-0">
            <AlertTriangle className="w-8 h-8 text-amber-300 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="bg-red-900/80 text-red-200 text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border border-red-600">
                High-Priority Clinical Triage
              </span>
              <span className="text-xs text-red-200 font-medium">Do not delay medical attention</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold mt-1 text-white">
              Urgent Medical Attention Recommended
            </h3>
            <p className="mt-2 text-sm text-red-100 font-medium leading-relaxed">
              {message}
            </p>

            {/* Emergency Contacts Direct Dial */}
            <div className="mt-4 pt-4 border-t border-red-600/60 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {emergencyContacts.map((contact, idx) => (
                <a
                  key={idx}
                  href={`tel:${contact.number.replace(/[^0-9]/g, '')}`}
                  className="flex items-center justify-between gap-2 bg-white/10 hover:bg-white/20 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white transition border border-white/20"
                >
                  <span className="flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-amber-300" />
                    <span>{contact.label}</span>
                  </span>
                  <span className="font-mono text-amber-300 font-bold">{contact.number}</span>
                </a>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-red-200">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-300" />
                Routine AI ranking and verification are suspended to prioritize patient safety.
              </span>
              {onAcknowledge && (
                <button
                  onClick={onAcknowledge}
                  className="bg-white text-red-900 hover:bg-red-50 font-semibold px-4 py-1.5 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <span>Continue with Educational Reference</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
