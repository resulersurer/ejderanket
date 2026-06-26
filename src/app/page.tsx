'use client';

import React, { useState } from 'react';
import { submitFeedbackAction } from '@/app/actions';
import { Star, ShieldCheck, Compass, Send, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

interface FeedbackFormState {
  passengerName: string;
  tourName: string;
  reservationNo: string;
  tourSatisfaction: number;
  guidePerformance: number;
  hotelSatisfaction: number;
  restaurantSatisfaction: number;
  additionalComments: string;
}

const initialFormState: FeedbackFormState = {
  passengerName: '',
  tourName: '',
  reservationNo: '',
  tourSatisfaction: 0,
  guidePerformance: 0,
  hotelSatisfaction: 0,
  restaurantSatisfaction: 0,
  additionalComments: '',
};

export default function SurveyPage() {
  const [form, setForm] = useState<FeedbackFormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [simulatedMode, setSimulatedMode] = useState(false);

  // Hover states for rating categories
  const [hovers, setHovers] = useState({
    tourSatisfaction: 0,
    guidePerformance: 0,
    hotelSatisfaction: 0,
    restaurantSatisfaction: 0,
  });

  const ratingCategories = [
    {
      key: 'tourSatisfaction' as const,
      label: 'Genel Tur Memnuniyeti',
      description: 'Tur programı, ulaşım ve genel organizasyon kalitesi.',
    },
    {
      key: 'guidePerformance' as const,
      label: 'Rehberlik Performansı',
      description: 'Rehberimizin bilgi düzeyi, ilgisi ve problem çözme yeteneği.',
    },
    {
      key: 'hotelSatisfaction' as const,
      label: 'Otel Memnuniyeti',
      description: 'Konakladığınız otellerin konforu, temizliği ve hizmet kalitesi.',
    },
    {
      key: 'restaurantSatisfaction' as const,
      label: 'Restoran & Yemek Memnuniyeti',
      description: 'Tur esnasında tercih edilen restoranlar ve yemeklerin lezzeti.',
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleRatingChange = (category: keyof typeof hovers, val: number) => {
    setForm((prev) => ({ ...prev, [category]: val }));
    if (errors[category]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[category];
        return next;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.passengerName.trim()) {
      newErrors.passengerName = 'Yolcu adı soyadı gereklidir.';
    } else if (form.passengerName.trim().length < 2) {
      newErrors.passengerName = 'Yolcu adı en az 2 karakter olmalıdır.';
    }

    if (!form.tourName.trim()) {
      newErrors.tourName = 'Tur adı gereklidir.';
    }

    if (!form.reservationNo.trim()) {
      newErrors.reservationNo = 'Rezervasyon numarası gereklidir.';
    } else if (!/^[a-zA-Z0-9\-\s]+$/.test(form.reservationNo.trim())) {
      newErrors.reservationNo = 'Rezervasyon numarası yalnızca harf, rakam ve tire içerebilir.';
    }

    ratingCategories.forEach((cat) => {
      if (form[cat.key] === 0) {
        newErrors[cat.key] = 'Lütfen bu alan için bir memnuniyet puanı seçin.';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      const firstErrorKey = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    const res = await submitFeedbackAction(form);

    setIsSubmitting(false);

    if (res.success) {
      setSubmitSuccess(true);
      setSuccessMessage(res.message || 'Geri bildiriminiz başarıyla kaydedildi.');
      setSimulatedMode(!!res.simulated);
      setForm(initialFormState);
    } else {
      if (res.fieldErrors) {
        setErrors(res.fieldErrors);
      } else {
        setServerError(res.error || 'Beklenmedik bir hata oluştu.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-radial from-[#3b0712] via-[#0f0206] to-[#020001] text-slate-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 selection:bg-amber-500 selection:text-slate-900">
      
      {/* Background Decorative Circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-red-700/5 rounded-full blur-3xl -z-10 animate-pulse duration-[8s]" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl -z-10 animate-pulse duration-[12s]" />

      <header className="max-w-xl mx-auto text-center mb-6">
        {/* Brand Logo */}
        <div className="mb-4 inline-block">
          <img
            src="/ejder-logo.png"
            alt="Ejder Turizm Logo"
            className="mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border border-red-500/25 shadow-[0_0_20px_rgba(239,68,68,0.15)] object-cover"
          />
        </div>
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-900/30 backdrop-blur-md mb-4 text-amber-400 text-xs font-semibold tracking-wider uppercase">
          <Compass className="w-3.5 h-3.5 animate-spin duration-[20s]" /> Ejder Turizm Memnuniyet Portalı
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-red-100 to-amber-300">
          Seyahat Deneyiminizi Değerlendirin
        </h1>
        <p className="mt-3 text-sm text-slate-400 max-w-sm mx-auto">
          Ejder Turizm seyahatinizin kalitesini analiz edebilmemiz için geri bildiriminiz bizim için çok değerlidir.
        </p>
      </header>

      <main className="flex-grow flex items-center justify-center max-w-xl mx-auto w-full">
        <div className="w-full bg-red-950/10 border border-red-950/30 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all duration-300 hover:border-red-900/20">
          
          {/* Top Gold-Crimson Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-700 via-amber-500 to-red-700" />

          {submitSuccess ? (
            /* Success Screen */
            <div className="py-8 text-center animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-6 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Teşekkür Ederiz!</h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-sm mx-auto mb-6">
                {successMessage}
              </p>
              
              {simulatedMode && (
                <div className="mb-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs leading-relaxed max-w-xs mx-auto text-left flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Demo Modu:</strong> DATABASE_URL ayarlanmadığı için bu gönderim simüle edilmiş ve veritabanına kaydedilmemiştir. Ancak Resend mail gönderimi tetiklenmiştir.
                  </span>
                </div>
              )}

              <button
                onClick={() => setSubmitSuccess(false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-950/80 border border-red-900/30 hover:bg-red-900/50 text-white font-medium text-sm transition-all duration-200"
              >
                Yeni Bir Yanıt Gönder
              </button>
            </div>
          ) : (
            /* Survey Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {serverError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Step 1: Passenger Info */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-amber-500 flex items-center gap-2 border-b border-red-950/40 pb-2">
                  <ShieldCheck className="w-4 h-4" /> 1. Yolcu ve Seyahat Bilgileri
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div id="passengerName">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Adınız Soyadınız
                    </label>
                    <input
                      type="text"
                      name="passengerName"
                      value={form.passengerName}
                      onChange={handleInputChange}
                      placeholder="Örn. Ahmet Yılmaz"
                      className={`w-full bg-black/40 border ${
                        errors.passengerName ? 'border-red-500/60 focus:ring-red-500/50' : 'border-red-950/60 focus:border-amber-500/50 focus:ring-amber-500/20'
                      } rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:ring-4 transition-all duration-200`}
                    />
                    {errors.passengerName && (
                      <p className="mt-1 text-xs text-red-400">{errors.passengerName}</p>
                    )}
                  </div>

                  <div id="reservationNo">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Rezervasyon Numarası
                    </label>
                    <input
                      type="text"
                      name="reservationNo"
                      value={form.reservationNo}
                      onChange={handleInputChange}
                      placeholder="Örn. EJ-1234-A"
                      className={`w-full bg-black/40 border ${
                        errors.reservationNo ? 'border-red-500/60 focus:ring-red-500/50' : 'border-red-950/60 focus:border-amber-500/50 focus:ring-amber-500/20'
                      } rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:ring-4 transition-all duration-200`}
                    />
                    {errors.reservationNo && (
                      <p className="mt-1 text-xs text-red-400">{errors.reservationNo}</p>
                    )}
                  </div>
                </div>

                <div id="tourName">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Katıldığınız Tur Programı
                  </label>
                  <input
                    type="text"
                    name="tourName"
                    value={form.tourName}
                    onChange={handleInputChange}
                    placeholder="Örn. Klasik İtalya ve Toskana Turu"
                    className={`w-full bg-black/40 border ${
                      errors.tourName ? 'border-red-500/60 focus:ring-red-500/50' : 'border-red-950/60 focus:border-amber-500/50 focus:ring-amber-500/20'
                    } rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:ring-4 transition-all duration-200`}
                  />
                  {errors.tourName && (
                    <p className="mt-1 text-xs text-red-400">{errors.tourName}</p>
                  )}
                </div>
              </div>

              {/* Step 2: Evaluation */}
              <div className="space-y-5 pt-2">
                <h3 className="text-md font-semibold text-amber-500 flex items-center gap-2 border-b border-red-950/40 pb-2">
                  <Star className="w-4 h-4" /> 2. Memnuniyet Değerlendirmesi
                </h3>

                <div className="space-y-4">
                  {ratingCategories.map((category) => {
                    const activeRating = form[category.key];
                    const activeHover = hovers[category.key];
                    const errorMsg = errors[category.key];

                    return (
                      <div
                        key={category.key}
                        id={category.key}
                        className="p-3.5 rounded-xl bg-black/20 border border-red-950/20 space-y-2 transition-all duration-200 hover:border-red-900/30 hover:bg-black/30"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <div>
                            <span className="text-sm font-semibold text-white">
                              {category.label}
                            </span>
                            <p className="text-xs text-slate-500 mt-0.5">{category.description}</p>
                          </div>

                          {/* Star Rating Render */}
                          <div className="flex items-center gap-1.5 mt-1 sm:mt-0 select-none">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const filled = star <= (activeHover || activeRating);
                              const selected = star <= activeRating;

                              return (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => handleRatingChange(category.key, star)}
                                  onMouseEnter={() =>
                                    setHovers((prev) => ({ ...prev, [category.key]: star }))
                                  }
                                  onMouseLeave={() =>
                                    setHovers((prev) => ({ ...prev, [category.key]: 0 }))
                                  }
                                  className="p-1 focus:outline-none transition-all duration-150 transform hover:scale-125 focus:scale-110 active:scale-95"
                                >
                                  <Star
                                    className={`w-6 h-6 stroke-1.5 transition-all duration-150 ${
                                      filled
                                        ? 'fill-amber-400 stroke-amber-400 filter drop-shadow-[0_0_4px_rgba(245,158,11,0.25)]'
                                        : 'stroke-red-900 hover:stroke-amber-500/50'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        {errorMsg && <p className="text-xs text-red-400 mt-1">{errorMsg}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Comments */}
              <div className="space-y-3 pt-2">
                <h3 className="text-md font-semibold text-amber-500 flex items-center gap-2 border-b border-red-950/40 pb-2">
                  <MessageSquare className="w-4 h-4" /> 3. Ekstra Yorum ve Görüşleriniz
                </h3>

                <div id="additionalComments">
                  <textarea
                    name="additionalComments"
                    value={form.additionalComments}
                    onChange={handleInputChange}
                    placeholder="Oteller, rehberlik, yemekler veya eklemek istediğiniz diğer detaylar hakkında görüşlerinizi bizimle paylaşın..."
                    rows={4}
                    className="w-full bg-black/40 border border-red-950/60 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-700 focus:outline-none focus:ring-4 transition-all duration-200 resize-y min-h-[90px]"
                  />
                  {errors.additionalComments && (
                    <p className="mt-1 text-xs text-red-400">{errors.additionalComments}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-800 via-amber-600 to-amber-500 hover:from-red-700 hover:via-amber-500 hover:to-amber-450 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-red-950/30 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.99] transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    Formu Gönder <Send className="w-4 h-4 ml-0.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="text-center max-w-xl mx-auto w-full mt-10">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} Ejder Turizm. Tüm hakları saklıdır.
        </p>
        <div className="mt-2.5">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-amber-500/80 hover:text-amber-400 transition-all font-medium border border-red-950/40 bg-red-950/20 px-2.5 py-1 rounded-full hover:border-red-900/30"
          >
            Admin Paneli Görünümü ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
