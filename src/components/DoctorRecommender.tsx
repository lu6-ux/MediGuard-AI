'use client';

import React, { useState } from 'react';
import { MapPin, Calendar, Search, Stethoscope, Star, Phone, Navigation, AlertCircle, Crosshair, Map, Clock, AlertTriangle } from 'lucide-react';
import { Language } from '@/types/medical';
import { TRANSLATIONS } from '@/lib/i18n/translations';

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
  smartScore?: number;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
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

interface DoctorRecommenderProps {
  flagContext: string;
  currentLang?: Language;
  showRecommender?: boolean;
  issueDescription?: string;
}

export const DoctorRecommender: React.FC<DoctorRecommenderProps> = ({ 
  flagContext, 
  currentLang = 'en', 
  showRecommender = false,
  issueDescription = "A potential medical issue was identified."
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];
  
  if (!showRecommender) return null;

  const [expanded, setExpanded] = useState(false);
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('This week');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<DoctorResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getSpecialtyFromFlag = (flag: string) => {
    const lowerFlag = flag.toLowerCase();
    
    if (lowerFlag.match(/cardio|heart|blood_pressure|hypertension|arrhythmia|cholesterol|statin|warfarin|ecg/i)) {
      return 'Cardiologist';
    }
    if (lowerFlag.match(/blood pressure|hypertension/i)) {
      return 'Cardiologist / General Physician';
    }
    if (lowerFlag.match(/kidney|creatinine|renal|egfr|dialysis|nephro/i)) {
      return 'Nephrologist';
    }
    if (lowerFlag.match(/diabetes|glucose|hba1c|thyroid|insulin|endocrine|metformin/i)) {
      return 'Endocrinologist / Diabetologist';
    }
    if (lowerFlag.match(/asthma|copd|lung|pulmonary|respiratory|inhaler|breath/i)) {
      return 'Pulmonologist';
    }
    if (lowerFlag.match(/neuro|brain|seizure|epilepsy|migraine|parkinson|stroke/i)) {
      return 'Neurologist';
    }
    if (lowerFlag.match(/gastro|liver|stomach|ulcer|reflux|gerd|hepatitis/i)) {
      return 'Gastroenterologist / Hepatologist';
    }
    if (lowerFlag.match(/skin|derma|rash/i)) {
      return 'Dermatologist';
    }
    if (lowerFlag.match(/eye|vision|ophthalmo/i)) {
      return 'Ophthalmologist';
    }
    if (lowerFlag.match(/drug|dosage|duplicate|interaction|contraindication|toxicity|overdose|side-effect/i)) {
      return 'Prescribing Doctor / Pharmacist';
    }
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
      const response = await fetch('/api/doctors/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialty, location, availability }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Doctor Search Temporarily Unavailable');
      }

      let processedResults = data.results as DoctorResult[];
      
      // Compute a smart score
      processedResults = processedResults.map(doc => {
        const ratingScore = (doc.rating || 3.0) * 10;
        doc.smartScore = ratingScore;
        return doc;
      }).sort((a, b) => (b.smartScore || 0) - (a.smartScore || 0));

      setResults(processedResults);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'We couldn\'t retrieve local doctor information right now. Please try again later.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="mt-4 p-5 rounded-2xl border border-blue-500/30 bg-slate-900/90 shadow-lg">
      {!expanded ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-amber-500">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-lg font-bold text-white">{t.doctorPotentialIssue || '⚠️ Potential Issue Detected'}</h3>
          </div>
          
          <p className="text-sm text-slate-300">
            {issueDescription}
          </p>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">{t.doctorRecommendedConsultation || 'Recommended consultation'}</p>
            <p className="text-sm font-medium text-blue-400">{specialty}</p>
          </div>

          <button
            onClick={() => setExpanded(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {t.doctorFindLocalBtn || 'Find a Local Doctor'}
          </button>
        </div>
      ) : (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">{t.doctorFindLocalBtn || 'Find a Local Doctor'}</h3>
            </div>
            <button onClick={() => setExpanded(false)} className="text-sm text-slate-400 hover:text-white">
              {t.cancel || 'Cancel'}
            </button>
          </div>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t.doctorWhereLocated || 'Where are you located?'}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={t.doctorCityPlaceholder || 'Enter your city or area'}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t.doctorWhenAvailable || 'When are you available for a consultation?'}
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 appearance-none"
              >
                <option value="Today">{t.doctorAvailToday || 'Today'}</option>
                <option value="This week">{t.doctorAvailWeek || 'This week'}</option>
                <option value="Weekends">{t.doctorAvailWeekend || 'Weekends'}</option>
                <option value="Evenings">{t.doctorAvailEvenings || 'Evenings'}</option>
                <option value="Flexible">{t.doctorAvailFlexible || 'Flexible'}</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSearching || !location.trim()}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg flex items-center justify-center transition-colors"
            >
              {isSearching ? (
                <span className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t.doctorSearching || 'Searching...'}</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span>{t.doctorSearchBtn || 'Search Doctors'}</span>
                </span>
              )}
            </button>
          </form>

          {/* Error State */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center animate-pulse">
              <h4 className="text-rose-400 font-bold mb-1">{t.doctorSearchUnavailable || 'Doctor Search Temporarily Unavailable'}</h4>
              <p className="text-sm text-rose-300/80">{error}</p>
            </div>
          )}

          {/* Results State */}
          {!isSearching && results !== null && !error && (
            <div className="mt-6 pt-6 border-t border-slate-800">
              <h4 className="font-bold text-white mb-1">{t.doctorLocalProfessionals || 'Local Healthcare Professionals'}</h4>
              <p className="text-sm text-slate-400 mb-4">
                {results.length} {t.doctorResultsFoundNear || 'results found near'} {location}. 
                <span className="text-xs ml-1 text-slate-500">({t.doctorRankingExplanation || 'Recommended based on specialty match and proximity.'})</span>
              </p>

              {results.length === 0 ? (
                <div className="text-center py-8 px-4 border border-slate-800 rounded-xl bg-slate-950">
                  <h4 className="text-lg font-bold text-white mb-2">{t.doctorNoSuitableFound || 'No Suitable Results Found'}</h4>
                  <p className="text-slate-400 text-sm mb-4">{t.doctorNoResultsDesc || 'We couldn\'t find a suitable doctor or clinic near the selected area.'}</p>
                  <div className="flex justify-center space-x-3">
                    <button onClick={() => setLocation('')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors">
                      {t.doctorSearchAnotherArea || 'Search another area'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {results.map((doc, index) => (
                    <div key={doc.id} className="p-4 rounded-xl border border-slate-700 bg-slate-950 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-white text-base truncate" title={doc.name}>{doc.name}</h4>
                        <p className="text-sm text-blue-400 font-medium mt-0.5 truncate">{t.doctorSpecialtyLabel || 'Specialty:'} {doc.specialty}</p>
                        
                        <div className="mt-3 space-y-2">
                          <div className="flex items-start space-x-2 text-sm text-slate-300">
                            <Navigation className="h-4 w-4 shrink-0 mt-0.5 text-slate-400" />
                            <span className="line-clamp-2" title={doc.address}>{doc.address}</span>
                          </div>
                          
                          {doc.rating ? (
                            <div className="flex items-center space-x-2 text-sm text-slate-300">
                              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                              <span className="font-semibold">{doc.rating}</span>
                            </div>
                          ) : null}

                          {doc.phone && doc.phone !== 'Phone not available' ? (
                            <div className="flex items-center space-x-2 text-sm text-slate-300">
                              <Phone className="h-4 w-4 shrink-0 text-emerald-400" />
                              <a href={`tel:${doc.phone.replace(/[^0-9+]/g, '')}`} className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                                {doc.phone}
                              </a>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-slate-800/50">
                        {doc.lat && doc.lng && (
                          <>
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${doc.lat},${doc.lng}`}
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex-1 text-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded transition-colors"
                            >
                              {t.doctorViewOnMap || 'View on Map'}
                            </a>
                            <a 
                              href={`https://www.google.com/maps/dir/?api=1&destination=${doc.lat},${doc.lng}`}
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex-1 text-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded transition-colors"
                            >
                              {t.doctorGetDirections || 'Directions'}
                            </a>
                          </>
                        )}
                        {doc.phone && doc.phone !== 'Phone not available' && (
                          <a 
                            href={`tel:${doc.phone.replace(/[^0-9+]/g, '')}`}
                            className="flex-1 text-center px-3 py-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 text-xs font-semibold rounded transition-colors"
                          >
                            {t.doctorCall || 'Call'}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Medical Disclaimer */}
      <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-start space-x-2 leading-relaxed bg-slate-950/50 p-3 rounded-lg">
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
        <p>
          <strong className="text-slate-300">{t.doctorImportant || 'Important:'}</strong> {t.doctorMedicalDisclaimer || 'MediGuard AI does not diagnose medical conditions. The recommendation is based on the type of issue flagged in your medical records and is intended to help you find an appropriate healthcare professional for further evaluation. If you are experiencing severe or emergency symptoms, seek urgent medical care instead of relying on this recommendation.'}
        </p>
      </div>
    </div>
  );
};
