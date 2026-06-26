'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Star,
  RefreshCw,
  Compass,
  Search,
  MessageSquare,
  Filter,
  Calendar,
  AlertCircle,
  Database,
  ArrowLeft,
  Award,
  BedDouble,
  Utensils,
  PlaneTakeoff
} from 'lucide-react';

interface Feedback {
  id: string;
  passengerName: string;
  email: string;
  tourName: string;
  reservationNo: string;
  tourSatisfaction: number;
  guidePerformance: number;
  hotelSatisfaction: number;
  restaurantSatisfaction: number;
  transportationSatisfaction: number;
  additionalComments: string | null;
  createdAt: string;
}

interface DashboardData {
  success: boolean;
  simulated: boolean;
  totalCount: number;
  averages: {
    tourSatisfaction: number;
    guidePerformance: number;
    hotelSatisfaction: number;
    restaurantSatisfaction: number;
    transportationSatisfaction: number;
    overall: number;
  };
  distributions: {
    tourSatisfaction: number[];
    guidePerformance: number[];
    hotelSatisfaction: number[];
    restaurantSatisfaction: number[];
    transportationSatisfaction: number[];
  };
  feedbacks: Feedback[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [selectedTour, setSelectedTour] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/dashboard');
      if (!res.ok) {
        throw new Error('API verisi yüklenirken sunucu hata döndürdü.');
      }
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Veri çekilirken bilinmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    document.title = "Ejder Turizm | Yönetim Paneli";
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 text-slate-800 flex flex-col items-center justify-center p-6">
        <div className="space-y-4 text-center">
          <div className="relative inline-flex">
            <Compass className="w-12 h-12 text-red-700 animate-spin duration-[4s]" />
            <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-red-200/55 animate-ping" />
          </div>
          <h2 className="text-lg font-semibold tracking-wider text-slate-700">İstatistikler Yükleniyor...</h2>
          <p className="text-xs text-slate-500 max-w-xs">Ejder Turizm memnuniyet verileri toparlanıyor.</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-stone-50 text-slate-800 flex flex-col items-center justify-center p-6">
        <div className="bg-red-55 border border-red-200 max-w-md p-6 rounded-2xl text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-700 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Veriler Yüklenemedi</h2>
          <p className="text-sm text-slate-650 leading-relaxed">{error || 'Beklenmedik bir hata oluştu.'}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchDashboardData();
            }}
            className="inline-flex items-center gap-2 bg-red-800 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" /> Yeniden Dene
          </button>
        </div>
      </div>
    );
  }

  const uniqueTours = ['all', ...Array.from(new Set(data.feedbacks.map((f) => f.tourName)))];

  const filteredFeedbacks = data.feedbacks.filter((fb) => {
    const matchesSearch =
      fb.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fb.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fb.reservationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fb.tourName.toLowerCase().includes(searchTerm.toLowerCase());

    const overallScore =
      (fb.tourSatisfaction +
        fb.guidePerformance +
        fb.hotelSatisfaction +
        fb.restaurantSatisfaction +
        fb.transportationSatisfaction) / 5;
    const matchesRating = minRatingFilter === 0 || overallScore >= minRatingFilter;

    const matchesTour = selectedTour === 'all' || fb.tourName === selectedTour;

    return matchesSearch && matchesRating && matchesTour;
  });

  const renderStars = (rating: number, size = 4) => {
    return (
      <div className="flex items-center gap-0.5 select-none">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-${size} h-${size} ${
              star <= Math.round(rating)
                ? 'fill-amber-400 stroke-amber-400'
                : 'stroke-stone-300 fill-transparent'
            }`}
          />
        ))}
      </div>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-emerald-600';
    if (score >= 3.5) return 'text-green-600';
    if (score >= 2.5) return 'text-amber-600';
    return 'text-red-655';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafaf9] via-[#f5f5f4] to-[#e7e5e4] text-slate-800 selection:bg-red-700 selection:text-white">
      
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl -z-10" />

      {/* Navigation Header */}
      <header className="sticky top-0 bg-white/80 border-b border-stone-200/80 backdrop-blur-md z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="p-2 rounded-lg bg-stone-55 border border-stone-200 text-slate-600 hover:text-slate-900 transition-all shadow-sm"
              title="Anket Formuna Dön"
            >
              <ArrowLeft className="w-4 h-4" />
            </a>
            
            <img
              src="/ejder-logo.png"
              alt="Ejder Logo"
              style={{
                width: '40px',
                height: '40px',
                minWidth: '40px',
                minHeight: '40px',
                aspectRatio: '1/1',
                objectFit: 'cover'
              }}
              className="rounded-lg border border-red-500/10"
            />

            <div>
              <span className="text-[10px] font-semibold text-red-800 tracking-widest uppercase block">
                EJDER TURİZM
              </span>
              <h1 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                Müşteri Memnuniyeti Analiz Paneli
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium bg-white hover:bg-stone-55 border border-stone-200 text-slate-700 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Yenile
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Demo Mode / Simulation Warning Banner */}
        {data.simulated && (
          <div className="p-4 rounded-2xl bg-amber-5 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-md">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0 text-amber-800" />
              <div>
                <p className="text-sm font-bold">Simülasyon Modu Aktif</p>
                <p className="text-xs text-amber-805/80 mt-0.5">
                  `DATABASE_URL` tanımlanmadığı için panelde Ejder Turizm programlarına ait gerçekçi örnek veriler (Mock Data) gösterilmektedir.
                </p>
              </div>
            </div>
            <span className="inline-block text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded bg-amber-200/50 border border-amber-300/40 shrink-0 text-center text-amber-900">
              Demo Görünümü
            </span>
          </div>
        )}

        {/* Aggregate Stats Cards */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          
          {/* Total Submissions */}
          <div className="bg-white border border-stone-200 p-5 rounded-2xl flex flex-col justify-between hover:border-stone-300 shadow-md shadow-stone-100/50 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Toplam Katılım
              </span>
              <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-slate-900">{data.totalCount}</span>
              <p className="text-[10px] text-slate-400 mt-1">Gönderilen anket sayısı</p>
            </div>
          </div>

          {/* Overall Average */}
          <div className="bg-white border border-stone-200 p-5 rounded-2xl flex flex-col justify-between hover:border-stone-300 shadow-md shadow-stone-100/50 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Genel Ortalama
              </span>
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 group-hover:scale-110 transition-transform">
                <Star className="w-4 h-4 fill-amber-400/20" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-extrabold ${getScoreColor(data.averages.overall)}`}>
                  {data.averages.overall}
                </span>
                <span className="text-xs text-slate-400">/5</span>
              </div>
              <div className="mt-1.5">{renderStars(data.averages.overall, 3.5)}</div>
            </div>
          </div>

          {/* Guide Performance */}
          <div className="bg-white border border-stone-200 p-5 rounded-2xl flex flex-col justify-between hover:border-stone-300 shadow-md shadow-stone-100/50 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Rehberlik Ort.
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-extrabold ${getScoreColor(data.averages.guidePerformance)}`}>
                  {data.averages.guidePerformance}
                </span>
                <span className="text-xs text-slate-400">/5</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Rehber memnuniyet ortalaması</p>
            </div>
          </div>

          {/* Hotel Satisfaction */}
          <div className="bg-white border border-stone-200 p-5 rounded-2xl flex flex-col justify-between hover:border-stone-300 shadow-md shadow-stone-100/50 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Otel Ortalaması
              </span>
              <div className="p-2 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 group-hover:scale-110 transition-transform">
                <BedDouble className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-extrabold ${getScoreColor(data.averages.hotelSatisfaction)}`}>
                  {data.averages.hotelSatisfaction}
                </span>
                <span className="text-xs text-slate-400">/5</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Konaklama memnuniyet ortalaması</p>
            </div>
          </div>

          {/* Restaurant Satisfaction */}
          <div className="bg-white border border-stone-200 p-5 rounded-2xl flex flex-col justify-between hover:border-stone-300 shadow-md shadow-stone-100/50 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Restoran Ort.
              </span>
              <div className="p-2 rounded-xl bg-orange-50 border border-orange-100 text-orange-650 group-hover:scale-110 transition-transform">
                <Utensils className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-extrabold ${getScoreColor(data.averages.restaurantSatisfaction)}`}>
                  {data.averages.restaurantSatisfaction}
                </span>
                <span className="text-xs text-slate-400">/5</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Restoran memnuniyet ort.</p>
            </div>
          </div>

          {/* Transportation Satisfaction */}
          <div className="bg-white border border-stone-200 p-5 rounded-2xl flex flex-col justify-between hover:border-stone-300 shadow-md shadow-stone-100/50 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ulaşım Ort.
              </span>
              <div className="p-2 rounded-xl bg-red-50 border border-red-100 text-red-700 group-hover:scale-110 transition-transform">
                <PlaneTakeoff className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-extrabold ${getScoreColor(data.averages.transportationSatisfaction)}`}>
                  {data.averages.transportationSatisfaction}
                </span>
                <span className="text-xs text-slate-400">/5</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Ulaşım memnuniyet ortalaması</p>
            </div>
          </div>

        </section>

        {/* Detailed Metrics Distributions */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-stone-200 p-6 rounded-2xl space-y-4 shadow-md shadow-stone-100/50">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-stone-100 pb-2.5">
              Genel Tur, Rehber ve Ulaşım Dağılımları
            </h2>

            <div className="space-y-4 pt-1">
              {/* Tour Satisfaction Distribution */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500">Tur Memnuniyeti Dağılımı</span>
                <div className="flex items-center gap-2">
                  <div className="flex-grow bg-stone-100 rounded-full h-3.5 overflow-hidden flex">
                    {data.distributions.tourSatisfaction.map((count, index) => {
                      const total = data.distributions.tourSatisfaction.reduce((a, b) => a + b, 0);
                      const widthPct = total > 0 ? (count / total) * 100 : 0;
                      const bgColors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-455', 'bg-emerald-500', 'bg-green-500'];
                      return widthPct > 0 ? (
                        <div
                          key={index}
                          style={{ width: `${widthPct}%` }}
                          className={`${bgColors[index]} h-full transition-all duration-300 border-r border-white/20`}
                          title={`${index + 1} Yıldız: ${count} Kişi`}
                        />
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              {/* Guide Performance Distribution */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500">Rehberlik Memnuniyeti Dağılımı</span>
                <div className="flex items-center gap-2">
                  <div className="flex-grow bg-stone-100 rounded-full h-3.5 overflow-hidden flex">
                    {data.distributions.guidePerformance.map((count, index) => {
                      const total = data.distributions.guidePerformance.reduce((a, b) => a + b, 0);
                      const widthPct = total > 0 ? (count / total) * 100 : 0;
                      const bgColors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-455', 'bg-emerald-500', 'bg-green-500'];
                      return widthPct > 0 ? (
                        <div
                          key={index}
                          style={{ width: `${widthPct}%` }}
                          className={`${bgColors[index]} h-full transition-all duration-300 border-r border-white/20`}
                          title={`${index + 1} Yıldız: ${count} Kişi`}
                        />
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              {/* Transportation Satisfaction Distribution */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500">Ulaşım Memnuniyeti Dağılımı</span>
                <div className="flex items-center gap-2">
                  <div className="flex-grow bg-stone-100 rounded-full h-3.5 overflow-hidden flex">
                    {data.distributions.transportationSatisfaction?.map((count, index) => {
                      const total = data.distributions.transportationSatisfaction.reduce((a, b) => a + b, 0);
                      const widthPct = total > 0 ? (count / total) * 100 : 0;
                      const bgColors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-455', 'bg-emerald-500', 'bg-green-500'];
                      return widthPct > 0 ? (
                        <div
                          key={index}
                          style={{ width: `${widthPct}%` }}
                          className={`${bgColors[index]} h-full transition-all duration-300 border-r border-white/20`}
                          title={`${index + 1} Yıldız: ${count} Kişi`}
                        />
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              {/* Color legend */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-green-500" /> 5 Yıldız (Mükemmel)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> 4 Yıldız (İyi)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-yellow-455" /> 3 Yıldız (Orta)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-orange-400" /> 2 Yıldız (Zayıf)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500" /> 1 Yıldız (Çok Kötü)</span>
              </div>
            </div>
          </div>

          {/* Accommodation & Catering Distributions */}
          <div className="bg-white border border-stone-200 p-6 rounded-2xl space-y-4 shadow-md shadow-stone-100/50">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-stone-100 pb-2.5">
              Otel & Restoran Değerlendirmeleri Dağılımı
            </h2>

            <div className="space-y-4 pt-1">
              {/* Hotel Satisfaction Distribution */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500">Otel Memnuniyeti Dağılımı</span>
                <div className="flex items-center gap-2">
                  <div className="flex-grow bg-stone-100 rounded-full h-3.5 overflow-hidden flex">
                    {data.distributions.hotelSatisfaction.map((count, index) => {
                      const total = data.distributions.hotelSatisfaction.reduce((a, b) => a + b, 0);
                      const widthPct = total > 0 ? (count / total) * 100 : 0;
                      const bgColors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-455', 'bg-emerald-500', 'bg-green-500'];
                      return widthPct > 0 ? (
                        <div
                          key={index}
                          style={{ width: `${widthPct}%` }}
                          className={`${bgColors[index]} h-full transition-all duration-300 border-r border-white/20`}
                          title={`${index + 1} Yıldız: ${count} Kişi`}
                        />
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              {/* Restaurant Satisfaction Distribution */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500">Yemek/Restoran Memnuniyeti Dağılımı</span>
                <div className="flex items-center gap-2">
                  <div className="flex-grow bg-stone-100 rounded-full h-3.5 overflow-hidden flex">
                    {data.distributions.restaurantSatisfaction.map((count, index) => {
                      const total = data.distributions.restaurantSatisfaction.reduce((a, b) => a + b, 0);
                      const widthPct = total > 0 ? (count / total) * 100 : 0;
                      const bgColors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-455', 'bg-emerald-500', 'bg-green-500'];
                      return widthPct > 0 ? (
                        <div
                          key={index}
                          style={{ width: `${widthPct}%` }}
                          className={`${bgColors[index]} h-full transition-all duration-300 border-r border-white/20`}
                          title={`${index + 1} Yıldız: ${count} Kişi`}
                        />
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              {/* Color legend */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-[10px] text-slate-450">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-green-500" /> 5 Yıldız</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> 4 Yıldız</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-yellow-455" /> 3 Yıldız</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-orange-400" /> 2 Yıldız</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500" /> 1 Yıldız</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Search Bar */}
        <section className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-105 pb-3">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-red-700" /> Filtreler & Arama
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {filteredFeedbacks.length} sonuç listelendi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Text Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Yolcu adı, E-posta, Rezervasyon veya Tur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-stone-300 focus:border-red-700 focus:ring-red-100 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all shadow-sm"
              />
            </div>

            {/* Tour filter selection */}
            <div>
              <select
                value={selectedTour}
                onChange={(e) => setSelectedTour(e.target.value)}
                className="w-full bg-white border border-stone-300 focus:border-red-700 focus:ring-red-100 rounded-xl px-3.5 py-2 text-sm text-slate-700 focus:outline-none focus:ring-4 transition-all shadow-sm"
              >
                <option value="all">Tüm Turlar</option>
                {uniqueTours.filter(t => t !== 'all').map((tour) => (
                  <option key={tour} value={tour}>
                    {tour}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Rating selection */}
            <div>
              <select
                value={minRatingFilter}
                onChange={(e) => setMinRatingFilter(Number(e.target.value))}
                className="w-full bg-white border border-stone-300 focus:border-red-700 focus:ring-red-100 rounded-xl px-3.5 py-2 text-sm text-slate-700 focus:outline-none focus:ring-4 transition-all shadow-sm"
              >
                <option value={0}>Tüm Derecelendirmeler</option>
                <option value={4.5}>4.5 Yıldız ve Üzeri (Çok İyi)</option>
                <option value={4}>4.0 Yıldız ve Üzeri (İyi)</option>
                <option value={3}>3.0 Yıldız ve Üzeri (Orta)</option>
                <option value={1}>3.0 Yıldız Altı (Kritik Bildirimler)</option>
              </select>
            </div>

          </div>
        </section>

        {/* Results Feedback Table */}
        <section className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Yolcu / İletişim / Rezervasyon</th>
                  <th className="p-4">Tur Programı</th>
                  <th className="p-4">Ortalama / Detay Puanlar</th>
                  <th className="p-4">Tarih</th>
                  <th className="p-4 pr-6">Görüşler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150">
                {filteredFeedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 text-sm">
                      Kriterlere uygun memnuniyet formu kaydı bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredFeedbacks.map((fb) => {
                    const avg =
                      (fb.tourSatisfaction +
                        fb.guidePerformance +
                        fb.hotelSatisfaction +
                        fb.restaurantSatisfaction +
                        fb.transportationSatisfaction) / 5;

                    return (
                      <tr
                        key={fb.id}
                        className="hover:bg-[#fafaf9]/60 transition-colors group text-sm text-slate-800"
                      >
                        {/* Passenger Details */}
                        <td className="p-4 pl-6 space-y-1">
                          <span className="font-semibold text-slate-900 block group-hover:text-red-750 transition-colors">
                            {fb.passengerName}
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="text-[10px] text-slate-600 font-mono bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded inline-block shadow-sm">
                              {fb.reservationNo}
                            </span>
                            {fb.email && (
                              <span className="text-[11px] text-slate-500 font-medium">
                                {fb.email}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Tour Name */}
                        <td className="p-4 text-slate-700 font-medium max-w-[200px] truncate">
                          {fb.tourName}
                        </td>

                        {/* Ratings */}
                        <td className="p-4 space-y-1.5">
                          <div className="flex items-center gap-2">
                            {renderStars(avg, 3.5)}
                            <span className={`text-xs font-bold ${getScoreColor(avg)}`}>
                              {avg.toFixed(2)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-slate-450 max-w-[240px]">
                            <span>Tur: <strong className="text-slate-655">{fb.tourSatisfaction}</strong></span>
                            <span>Rehber: <strong className="text-slate-655">{fb.guidePerformance}</strong></span>
                            <span>Otel: <strong className="text-slate-655">{fb.hotelSatisfaction}</strong></span>
                            <span>Yemek: <strong className="text-slate-655">{fb.restaurantSatisfaction}</strong></span>
                            <span className="col-span-2">Ulaşım: <strong className="text-slate-655">{fb.transportationSatisfaction}</strong></span>
                          </div>
                        </td>

                        {/* Submission Date */}
                        <td className="p-4 text-slate-500 text-xs shrink-0 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(fb.createdAt).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </td>

                        {/* Additional Comments */}
                        <td className="p-4 pr-6">
                          {fb.additionalComments ? (
                            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-slate-650 text-xs italic max-w-sm line-clamp-3 hover:line-clamp-none transition-all cursor-pointer leading-relaxed relative group/comment shadow-sm">
                              "{fb.additionalComments}"
                              <MessageSquare className="w-3 h-3 text-slate-400 absolute right-2 bottom-2 opacity-0 group-hover/comment:opacity-100 transition-opacity" />
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Yorum yok</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      <footer className="text-center py-10 text-xs text-slate-500 border-t border-stone-200 mt-10">
        © {new Date().getFullYear()} Ejder Turizm Admin Analiz Portalı. Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
