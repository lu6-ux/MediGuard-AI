'use client';

import React, { useState } from 'react';
import { MapPin, Calendar, Search, Stethoscope, Star, Phone, Navigation, AlertCircle, Crosshair, Map, Clock } from 'lucide-react';

interface DoctorResult {
  id: string;
  name: string;
  specialty: string;
  address: string;
  rating: number | null;
  ratingCount: number;
  phone: string;
  lat: number | null;
  lng: number | null;
  distance?: number;
}

// Haversine formula to calculate distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const d = R * c; 
  return d.toFixed(1);
}

import { Language } from '@/types/medical';
import { TRANSLATIONS } from '@/lib/i18n/translations';

interface DoctorRecommenderProps {
  flagContext: string; // E.g., 'allergy_contradiction', 'drug_interaction', 'lab_abnormality'
  currentLang?: Language;
  highRiskAlerts?: number;
}

export const DoctorRecommender: React.FC<DoctorRecommenderProps> = ({ flagContext, currentLang = 'en', highRiskAlerts = 0 }) => {
  const t = TRANSLATIONS[currentLang];
  
  if (highRiskAlerts === 0) return null;

  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('');
  const [time, setTime] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<DoctorResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Map the flag to a real medical specialty based on issue context (Advanced Offline Mapper)
  const getSpecialtyFromFlag = (flag: string) => {
    const lowerFlag = flag.toLowerCase();
    
    // Cardiovascular
    if (lowerFlag.match(/cardio|heart|blood_pressure|hypertension|arrhythmia|cholesterol|statin|warfarin|ecg/i)) {
      return 'Cardiologist';
    }
    // Nephrology
    if (lowerFlag.match(/kidney|creatinine|renal|egfr|dialysis|nephro/i)) {
      return 'Nephrologist';
    }
    // Endocrinology / Diabetes
    if (lowerFlag.match(/diabetes|glucose|hba1c|thyroid|insulin|endocrine|metformin/i)) {
      return 'Endocrinologist';
    }
    // Pulmonology
    if (lowerFlag.match(/asthma|copd|lung|pulmonary|respiratory|inhaler|breath/i)) {
      return 'Pulmonologist';
    }
    // Neurology
    if (lowerFlag.match(/neuro|brain|seizure|epilepsy|migraine|parkinson|stroke/i)) {
      return 'Neurologist';
    }
    // Gastroenterology
    if (lowerFlag.match(/gastro|liver|stomach|ulcer|reflux|gerd|hepatitis/i)) {
      return 'Gastroenterologist';
    }
    // Oncology
    if (lowerFlag.match(/cancer|tumor|chemo|oncolog|malignan/i)) {
      return 'Oncologist';
    }
    // Psychiatry
    if (lowerFlag.match(/depress|anxiety|psychiatry|mental|sleep|insomnia/i)) {
      return 'Psychiatrist';
    }
    // Allergic / Immunologic
    if (lowerFlag.match(/allergy|anaphylaxis|immune|autoimmune|rash/i)) {
      return 'Immunologist or Allergist';
    }
    // Drug Interactions / Safety (Default to Pharmacist for pure drug issues)
    if (lowerFlag.match(/drug|dosage|duplicate|interaction|contraindication|toxicity|overdose/i)) {
      return 'Clinical Pharmacist or General Physician';
    }
    // Pregnancy / OBGYN
    if (lowerFlag.match(/pregnan|maternal|fetal|teratogen|obgyn/i)) {
      return 'Obstetrician/Gynecologist';
    }
    
    // Fallback
    return 'General Physician';
  };

  const specialty = getSpecialtyFromFlag(flagContext);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;

    setIsSearching(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialty, location, availability, time }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch doctors');
      }

      let processedResults = data.results as DoctorResult[];

      // If we have user coordinates, calculate distance and sort
      if (userCoords) {
        processedResults = processedResults.map(doc => {
          if (doc.lat && doc.lng) {
            doc.distance = parseFloat(calculateDistance(userCoords.lat, userCoords.lng, doc.lat, doc.lng));
          }
          
          // Smart Ranking Formula: Higher is better
          // Rating gives up to 50 points (rating * 10). Distance penalizes (2 points per km).
          const ratingScore = (doc.rating || 3.0) * 10; 
          const distancePenalty = (doc.distance || 50) * 2;
          // @ts-ignore
          doc.smartScore = ratingScore - distancePenalty;
          
          return doc;
        // @ts-ignore
        }).sort((a, b) => (b.smartScore || 0) - (a.smartScore || 0));
      } else {
        // If no coords, just sort by rating
        processedResults = processedResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }

      setResults(processedResults);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocation("Current Location"); // We can pass this or actual city, but API accepts "Current Location" poorly unless reverse geocoded. 
        // Actually, just passing lat/lng is best, but we need textQuery. We'll set location to "Nearby"
        setLocation("Nearby");
        setIsLocating(false);
      },
      () => {
        setError("Unable to retrieve your location. Please type your city manually.");
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="mt-4 p-5 rounded-2xl border border-blue-500/30 bg-slate-900/90 shadow-lg">
      <div className="flex items-center space-x-2 mb-3">
        <Stethoscope className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white">{t.doctorFindSpecialist}</h3>
      </div>
      
      <p className="text-sm text-slate-300 mb-5 leading-relaxed">
        {t.doctorHighRiskIssue1} <strong>{specialty}</strong> {t.doctorHighRiskIssue2}
      </p>

      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          {isLocating ? (
             <div className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
          ) : (
             <Crosshair className="h-3 w-3" />
          )}
          <span>{isLocating ? t.doctorLocating : t.doctorUseMyLocation}</span>
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={t.doctorCityPlaceholder}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        
        <div className="flex flex-1 gap-2 sm:max-w-[300px]">
          <div className="relative flex-1">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full pl-9 pr-2 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 appearance-none [color-scheme:dark]"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div className="relative flex-1">
            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full pl-9 pr-2 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 appearance-none [color-scheme:dark]"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSearching || !location.trim()}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg flex items-center justify-center transition-colors"
        >
          {isSearching ? (
            <span className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{t.doctorSearching}</span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>{t.doctorFindDoctorsBtn}</span>
            </span>
          )}
        </button>
      </form>

      {/* Error State */}
      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start space-x-2 text-rose-300 text-sm animate-pulse mb-4">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton State */}
      {isSearching && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 animate-pulse">
              <div className="h-4 bg-slate-800 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-800 rounded w-1/2 mb-4" />
              <div className="space-y-2">
                <div className="h-3 bg-slate-800 rounded w-full" />
                <div className="h-3 bg-slate-800 rounded w-2/3" />
              </div>
              <div className="flex space-x-3 mt-4">
                <div className="h-3 bg-slate-800 rounded w-20" />
                <div className="h-3 bg-slate-800 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results State */}
      {!isSearching && results !== null && (
        <div className="space-y-3">
          {results.length === 0 ? (
            <div className="text-center py-6 px-4 border border-slate-800 rounded-xl bg-slate-950">
              <p className="text-slate-400 text-sm">{t.doctorNoClinicsFound}</p>
              <p className="text-slate-500 text-xs mt-1">{t.doctorTryWidening}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {results.map((doc, index) => (
                <div key={doc.id} className="p-4 rounded-xl border border-slate-700 bg-slate-950 hover:border-blue-500/50 transition-colors relative overflow-hidden">
                  {index === 0 && userCoords && (
                    <div className="absolute top-0 right-0 bg-emerald-600/90 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm">
                      {t.doctorClosestMatch}
                    </div>
                  )}
                  <h4 className="font-bold text-white text-sm truncate pr-20" title={doc.name}>{doc.name}</h4>
                  <p className="text-xs text-blue-400 font-medium mt-0.5 truncate">{doc.specialty}</p>
                  
                  <div className="mt-2.5 space-y-1.5">
                    {doc.rating ? (
                      <div className="flex items-center space-x-1 text-xs text-slate-300">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <span className="font-semibold">{doc.rating}</span>
                        <span className="text-slate-500">({doc.ratingCount} reviews)</span>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">No ratings yet</div>
                    )}
                    
                    <div className="flex items-start space-x-1.5 text-xs text-slate-400">
                      <Navigation className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="line-clamp-2" title={doc.address}>{doc.address}</span>
                        {doc.distance && (
                          <span className="text-blue-400 font-medium mt-0.5">{doc.distance} km away</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 pt-1">
                      <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        {doc.phone !== 'Phone not available' ? (
                          <a href={`tel:${doc.phone.replace(/[^0-9+]/g, '')}`} className="text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-2 transition-colors">
                            {t.doctorCallClinic}
                          </a>
                        ) : (
                          <span>N/A</span>
                        )}
                      </div>

                      {doc.lat && doc.lng && (
                        <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                          <Map className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                          <a href={`https://www.google.com/maps/dir/?api=1&destination=${doc.lat},${doc.lng}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2 transition-colors">
                            {t.doctorGetDirections}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Medical Disclaimer */}
      <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex items-start space-x-1.5 leading-tight">
        <AlertCircle className="h-3 w-3 shrink-0 text-slate-400" />
        <p>
          {t.doctorDisclaimer}
        </p>
      </div>
    </div>
  );
};
