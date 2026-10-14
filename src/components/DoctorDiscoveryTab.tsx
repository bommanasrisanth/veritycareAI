import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Award,
  Calendar,
  Star,
  ExternalLink,
  Phone,
  ShieldCheck,
  Compass,
  CheckCircle2,
  AlertCircle,
  Building,
  Navigation
} from 'lucide-react';
import { Doctor } from '../types/index.ts';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations.ts';

interface DoctorDiscoveryTabProps {
  lang: SupportedLanguage;
  initialSpecialty?: string;
}

export const DoctorDiscoveryTab: React.FC<DoctorDiscoveryTabProps> = ({
  lang,
  initialSpecialty = ''
}) => {
  const t = TRANSLATIONS[lang];
  const [searchQuery, setSearchQuery] = useState(initialSpecialty);
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  const [selectedCity, setSelectedCity] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [useDeviceLocation, setUseDeviceLocation] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);

  const specialties = [
    'All Specialties',
    'General Medicine',
    'Cardiology',
    'Pediatrics',
    'Pulmonology',
    'Endocrinology & Diabetology',
    'Neurology',
    'Orthopedics',
    'Dermatology'
  ];

  const popularCities = ['All Cities', 'Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Hyderabad', 'Kolkata', 'Jaipur', 'Ahmedabad'];

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (selectedSpecialty && selectedSpecialty !== 'All Specialties') {
        params.append('specialty', selectedSpecialty);
      }
      if (selectedCity && selectedCity !== 'All Cities') {
        params.append('city', selectedCity);
      }
      if (pinCode) params.append('pinCode', pinCode);

      const res = await fetch(`/api/doctors/search?${params.toString()}`);
      const data = await res.json() as { results: Doctor[] };
      setDoctors(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, selectedCity]);

  const requestDeviceLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setUseDeviceLocation(true);
        fetchDoctors();
      },
      () => {
        alert('Location access denied. You can enter your city or PIN code manually.');
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div>
        <div className="flex items-center gap-2 text-teal-700 mb-1">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Verified Clinical Directory &amp; Balanced Ranking
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          {t.doctorSearchTitle}
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Clinicians are ranked using transparent weights: Specialty relevance (35%), Official registration verification (25%), Distance (15%), Availability (10%), and Verified reviews (15%). Credentials verified against National Medical Commission &amp; State Councils.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Query input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Symptom, specialty, or hospital..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 font-normal"
            />
          </div>

          {/* City select */}
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-teal-500 font-normal cursor-pointer"
            >
              {popularCities.map((c, i) => (
                <option key={i} value={c === 'All Cities' ? '' : c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Action button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchDoctors()}
              className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Search className="w-4 h-4" />
              <span>{t.searchButton}</span>
            </button>

            <button
              onClick={requestDeviceLocation}
              className={`p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                useDeviceLocation
                  ? 'bg-teal-100 text-teal-900 border-teal-300'
                  : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
              }`}
              title="Use my device location"
            >
              <Navigation className="w-4 h-4 text-teal-600" />
              <span className="hidden sm:inline">Near Me</span>
            </button>
          </div>
        </div>

        {/* Specialty Quick Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {specialties.map((spec, idx) => {
            const active = (spec === 'All Specialties' && !selectedSpecialty) || selectedSpecialty === spec;
            return (
              <button
                key={idx}
                onClick={() => setSelectedSpecialty(spec === 'All Specialties' ? '' : spec)}
                className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition cursor-pointer font-medium border ${
                  active
                    ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {spec}
              </button>
            );
          })}
        </div>
      </div>

      {/* Doctor Results Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Found {doctors.length} Verified Clinicians</span>
          <span className="font-mono text-teal-700 font-semibold">Sorted by Multi-Factor Composite Rank</span>
        </div>

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
            Searching official medical councils and directories...
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <Building className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-800">No Clinicians Found for this Filter</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Try choosing "All Specialties" or "All Cities" to view verified practitioners across regions.
            </p>
          </div>
        ) : (
          doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs hover:border-teal-300 transition"
            >
              <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                {/* Doctor Identity */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {doc.name}
                    </h3>
                    {doc.registrationStatus === 'Verified Official' && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {doc.registrationStatus}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-medium text-teal-800">
                    {doc.specialty} • <span className="text-slate-600 font-normal">{doc.qualifications}</span>
                  </p>

                  <div className="space-y-1 text-xs text-slate-600">
                    <p className="flex items-center gap-1.5 font-medium">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{doc.clinicHospital}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{doc.address}</span>
                      {doc.distanceKm && (
                        <span className="font-mono text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.5 rounded text-[10px]">
                          ~{doc.distanceKm} km
                        </span>
                      )}
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-500 text-[11px] font-mono">
                      <Award className="w-3.5 h-3.5 text-teal-600" />
                      <span>Reg: {doc.registrationNumber} ({doc.registrationCouncil})</span>
                    </p>
                  </div>

                  {/* Ranking Explanation */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700">
                    <span className="font-semibold text-slate-900">Ranking Basis: </span>
                    {doc.rankingReason}
                  </div>
                </div>

                {/* Score Breakdown & Action CTA */}
                <div className="w-full lg:w-72 bg-slate-50/80 border border-slate-200/90 rounded-xl p-3.5 space-y-3 shrink-0">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-semibold text-slate-700">Composite Score</span>
                    <span className="text-base font-extrabold text-teal-800">
                      {doc.scoreBreakdown.composite_rank} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                    </span>
                  </div>

                  {/* Multi-factor meter */}
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-600">
                      <span>Specialty Relevance (35%)</span>
                      <span className="font-semibold">{doc.scoreBreakdown.specialty_relevance}%</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Council Registration (25%)</span>
                      <span className="font-semibold">{doc.scoreBreakdown.registration_verification}%</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Proximity / Distance (15%)</span>
                      <span className="font-semibold">{doc.scoreBreakdown.distance}%</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Verified Reviews (15%)</span>
                      <span className="font-semibold">{doc.scoreBreakdown.reviews}%</span>
                    </div>
                  </div>

                  {/* Availability badge */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Availability:</span>
                    <span className={`font-semibold ${doc.availabilityStatus.includes('Verified') ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {doc.availabilityStatus}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-1 flex flex-col gap-2">
                    {doc.bookingUrl && (
                      <a
                        href={doc.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold py-2 rounded-lg text-center transition flex items-center justify-center gap-1.5"
                      >
                        <span>Official Booking / Profile</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {doc.phone && (
                      <a
                        href={`tel:${doc.phone.replace(/[^0-9+]/g, '')}`}
                        className="w-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold py-1.5 rounded-lg text-center transition flex items-center justify-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5 text-teal-600" />
                        <span>Call Clinic: {doc.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
