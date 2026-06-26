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
  Utensils
} from 'lucide-react';

interface Feedback {
  id: string;
  passengerName: string;
  tourName: string;
  reservationNo: string;
  tourSatisfaction: number;
  guidePerformance: number;
  hotelSatisfaction: number;
  restaurantSatisfaction: number;
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
    overall: number;
  };
  distributions: {
    tourSatisfaction: number[];
    guidePerformance: number[];
    hotelSatisfaction: number[];
    restaurantSatisfaction: number[];
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
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050001] text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="space-y-4 text-center">
          <div className="relative inline-flex">
            <Compass className="w-12 h-12 text-amber-500 animate-spin duration-[4s]" />
            <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-red-500/20 animate-ping" />
          </div>
          <h2 className="text-lg font-semibold tracking-wider text-slate-300">İstatistikler Yükleniyor...</h2>
          <p className="text-xs text-slate-500 max-w-xs">Ejder Turizm memnuniyet verileri toparlanıyor.</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#050001] text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500/20 max-w-md p-6 rounded-2xl text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Veriler Yüklenemedi</h2>
          <p className="text-sm text-slate-400 leading-relaxed">{error || 'Beklenmedik bir hata oluştu.'}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchDashboardData();
            }}
            className="inline-flex items-center gap-2 bg-red-950 hover:bg-red-900 border border-red-800 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
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
      fb.reservationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fb.tourName.toLowerCase().includes(searchTerm.toLowerCase());

    const overallScore =
      (fb.tourSatisfaction + fb.guidePerformance + fb.hotelSatisfaction + fb.restaurantSatisfaction) / 4;
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
                : 'stroke-red-950 fill-transparent'
            }`}
          />
        ))}
      </div>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-emerald-400';
    if (score >= 3.5) return 'text-green-400';
    if (score >= 2.5) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-radial from-[#220207] via-[#050001] to-[#000000] text-slate-100 selection:bg-amber-500 selection:text-slate-900">
      
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-700/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-600/3 rounded-full blur-3xl -z-10" />

      {/* Navigation Header */}
      <header className="sticky top-0 bg-red-950/40 border-b border-red-950/60 backdrop-blur-md z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="p-2 rounded-lg bg-red-950/80 border border-red-900/30 text-slate-300 hover:text-white transition-all"
              title="Anket Formuna Dön"
            >
              <ArrowLeft className="w-4 h-4" />
            </a>
            
            <img
              src="/ejder-logo.png"
              alt="Ejder Logo"
              className="w-10 h-10 rounded-lg border border-red-500/20 object-cover"
            />

            <div>
              <span className="text-[10px] font-semibold text-amber-400 tracking-widest uppercase block">
                EJDER TURİZM
              </span>
              <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                Müşteri Memnuniyeti Analiz Paneli
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium bg-red-950/60 hover:bg-red-900/50 border border-red-900/30 text-slate-200 rounded-xl transition-all disabled:opacity-50"
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
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <p className="text-sm font-bold">Simülasyon Modu Aktif</p>
                <p className="text-xs text-amber-500/80 mt-0.5">
                  `DATABASE_URL` tanımlanmadığı için panelde Ejder Turizm programlarına ait gerçekçi örnek veriler (Mock Data) gösterilmektedir.
                </p>
              </div>
            </div>
            <span className="inline-block text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded bg-amber-500/25 border border-amber-500/20 shrink-0 text-center">
              Demo Görünümü
            </span>
          </div>
        )}

        {/* Aggregate Stats Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Total Submissions */}
          <div className="bg-red-950/10 border border-red-950/20 p-5 rounded-2xl flex flex-col justify-between hover:border-red-900/20 transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Toplam Katılım
              </span>
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-white">{data.totalCount}</span>
              <p className="text-[10px] text-slate-500 mt-1">Gönderilen anket sayısı</p>
            </div>
          </div>

          {/* Overall Average */}
          <div className="bg-red-950/10 border border-red-950/20 p-5 rounded-2xl flex flex-col justify-between hover:border-red-900/20 transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Genel Ortalama
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                <Star className="w-4 h-4 fill-amber-400/20" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-extrabold ${getScoreColor(data.averages.overall)}`}>
                  {data.averages.overall}
                </span>
                <span className="text-xs text-slate-500">/5</span>
              </div>
              <div className="mt-1.5">{renderStars(data.averages.overall, 3.5)}</div>
            </div>
          </div>

          {/* Guide Performance */}
          <div className="bg-red-950/10 border border-red-950/20 p-5 rounded-2xl flex flex-col justify-between hover:border-red-900/20 transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Rehberlik Ort.
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-extrabold ${getScoreColor(data.averages.guidePerformance)}`}>
                  {data.averages.guidePerformance}
                </span>
                <span className="text-xs text-slate-500">/5</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Rehber memnuniyet ortalaması</p>
            </div>
          </div>

          {/* Hotel Satisfaction */}
          <div className="bg-red-950/10 border border-red-950/20 p-5 rounded-2xl flex flex-col justify-between hover:border-red-900/20 transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Otel Ortalaması
              </span>
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                <BedDouble className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-extrabold ${getScoreColor(data.averages.hotelSatisfaction)}`}>
                  {data.averages.hotelSatisfaction}
                </span>
                <span className="text-xs text-slate-500">/5</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Konaklama memnuniyet ortalaması</p>
            </div>
          </div>

          {/* Restaurant Satisfaction */}
          <div className="bg-red-950/10 border border-red-950/20 p-5 rounded-2xl flex flex-col justify-between hover:border-red-900/20 transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Restoran Ort.
              </span>
              <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 group-hover:scale-110 transition-transform">
                <Utensils className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-extrabold ${getScoreColor(data.averages.restaurantSatisfaction)}`}>
                  {data.averages.restaurantSatisfaction}
                </span>
                <span className="text-xs text-slate-500">/5</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Restoran/Yemek memnuniyet ort.</p>
            </div>
          </div>

        </section>

        {/* Detailed Metrics Distributions */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-red-950/10 border border-red-950/20 p-6 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-red-950/25 pb-2.5">
              Genel Tur ve Rehber Performansı Dağılımı
            </h2>

            <div className="space-y-4 pt-1">
              {/* Tour Satisfaction Distribution */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400">Tur Memnuniyeti Dağılımı</span>
                <div className="flex items-center gap-2">
                  <div className="flex-grow bg-black/40 rounded-full h-3.5 overflow-hidden flex">
                    {data.distributions.tourSatisfaction.map((count, index) => {
                      const total = data.distributions.tourSatisfaction.reduce((a, b) => a + b, 0);
                      const widthPct = total > 0 ? (count / total) * 100 : 0;
                      const bgColors = ['bg-red-600', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-green-500'];
                      return widthPct > 0 ? (
                        <div
                          key={index}
                          style={{ width: `${widthPct}%` }}
                          className={`${bgColors[index]} h-full transition-all duration-300 border-r border-black/20`}
                          title={`${index + 1} Yıldız: ${count} Kişi`}
                        />
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              {/* Guide Performance Distribution */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400">Rehberlik Memnuniyeti Dağılımı</span>
                <div className="flex items-center gap-2">
                  <div className="flex-grow bg-black/40 rounded-full h-3.5 overflow-hidden flex">
                    {data.distributions.guidePerformance.map((count, index) => {
                      const total = data.distributions.guidePerformance.reduce((a, b) => a + b, 0);
                      const widthPct = total > 0 ? (count / total) * 100 : 0;
                      const bgColors = ['bg-red-600', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-green-500'];
                      return widthPct > 0 ? (
                        <div
                          key={index}
                          style={{ width: `${widthPct}%` }}
                          className={`${bgColors[index]} h-full transition-all duration-300 border-r border-black/20`}
                          title={`${index + 1} Yıldız: ${count} Kişi`}
                        />
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              {/* Color legend */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-green-500" /> 5 Yıldız (Mükemmel)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> 4 Yıldız (İyi)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-yellow-500" /> 3 Yıldız (Orta)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-orange-500" /> 2 Yıldız (Zayıf)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-600" /> 1 Yıldız (Çok Kötü)</span>
              </div>
            </div>
          </div>

          {/* Accommodation & Catering Distributions */}
          <div className="bg-red-950/10 border border-red-950/20 p-6 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-red-950/25 pb-2.5">
              Otel & Restoran Değerlendirmeleri Dağılımı
            </h2>

            <div className="space-y-4 pt-1">
              {/* Hotel Satisfaction Distribution */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400">Otel Memnuniyeti Dağılımı</span>
                <div className="flex items-center gap-2">
                  <div className="flex-grow bg-black/40 rounded-full h-3.5 overflow-hidden flex">
                    {data.distributions.hotelSatisfaction.map((count, index) => {
                      const total = data.distributions.hotelSatisfaction.reduce((a, b) => a + b, 0);
                      const widthPct = total > 0 ? (count / total) * 100 : 0;
                      const bgColors = ['bg-red-600', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-green-500'];
                      return widthPct > 0 ? (
                        <div
                          key={index}
                          style={{ width: `${widthPct}%` }}
                          className={`${bgColors[index]} h-full transition-all duration-300 border-r border-black/20`}
                          title={`${index + 1} Yıldız: ${count} Kişi`}
                        />
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              {/* Restaurant Satisfaction Distribution */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400">Yemek/Restoran Memnuniyeti Dağılımı</span>
                <div className="flex items-center gap-2">
                  <div className="flex-grow bg-black/40 rounded-full h-3.5 overflow-hidden flex">
                    {data.distributions.restaurantSatisfaction.map((count, index) => {
                      const total = data.distributions.restaurantSatisfaction.reduce((a, b) => a + b, 0);
                      const widthPct = total > 0 ? (count / total) * 100 : 0;
                      const bgColors = ['bg-red-600', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-green-500'];
                      return widthPct > 0 ? (
                        <div
                          key={index}
                          style={{ width: `${widthPct}%` }}
                          className={`${bgColors[index]} h-full transition-all duration-300 border-r border-black/20`}
                          title={`${index + 1} Yıldız: ${count} Kişi`}
                        />
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              {/* Color legend */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-green-500" /> 5 Yıldız</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> 4 Yıldız</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-yellow-500" /> 3 Yıldız</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-orange-500" /> 2 Yıldız</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-600" /> 1 Yıldız</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Search Bar */}
        <section className="bg-red-950/10 border border-red-950/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-red-950/25 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-amber-500" /> Filtreler & Arama
            </h2>
            <span className="text-xs text-slate-500">
              {filteredFeedbacks.length} sonuç listelendi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Text Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-650" />
              <input
                type="text"
                placeholder="Yolcu adı, Rezervasyon veya Tur adı..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/40 border border-red-950/60 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-650 focus:outline-none focus:ring-4 transition-all"
              />
            </div>

            {/* Tour filter selection */}
            <div>
              <select
                value={selectedTour}
                onChange={(e) => setSelectedTour(e.target.value)}
                className="w-full bg-black/40 border border-red-950/60 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl px-3.5 py-2 text-sm text-slate-300 focus:outline-none focus:ring-4 transition-all"
              >
                <option value="all" className="bg-[#0c0103]">Tüm Turlar</option>
                {uniqueTours.filter(t => t !== 'all').map((tour) => (
                  <option key={tour} value={tour} className="bg-[#0c0103]">
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
                className="w-full bg-black/40 border border-red-950/60 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl px-3.5 py-2 text-sm text-slate-300 focus:outline-none focus:ring-4 transition-all"
              >
                <option value={0} className="bg-[#0c0103]">Tüm Derecelendirmeler</option>
                <option value={4.5} className="bg-[#0c0103]">4.5 Yıldız ve Üzeri (Çok İyi)</option>
                <option value={4} className="bg-[#0c0103]">4.0 Yıldız ve Üzeri (İyi)</option>
                <option value={3} className="bg-[#0c0103]">3.0 Yıldız ve Üzeri (Orta)</option>
                <option value={1} className="bg-[#0c0103]">3.0 Yıldız Altı (Kritik Bildirimler)</option>
              </select>
            </div>

          </div>
        </section>

        {/* Results Feedback Table */}
        <section className="bg-red-950/10 border border-red-950/20 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#100103] border-b border-red-950/40 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 pl-6">Yolcu / Rezervasyon</th>
                  <th className="p-4">Tur Programı</th>
                  <th className="p-4">Ortalama / Detay Puanlar</th>
                  <th className="p-4">Tarih</th>
                  <th className="p-4 pr-6">Görüşler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-950/10">
                {filteredFeedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">
                      Kriterlere uygun memnuniyet formu kaydı bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredFeedbacks.map((fb) => {
                    const avg =
                      (fb.tourSatisfaction +
                        fb.guidePerformance +
                        fb.hotelSatisfaction +
                        fb.restaurantSatisfaction) / 4;

                    return (
                      <tr
                        key={fb.id}
                        className="hover:bg-[#150206] transition-colors group text-sm"
                      >
                        {/* Passenger Details */}
                        <td className="p-4 pl-6 space-y-1">
                          <span className="font-semibold text-white block group-hover:text-amber-400 transition-colors">
                            {fb.passengerName}
                          </span>
                          <span className="text-xs text-slate-500 font-mono bg-black/45 border border-red-950/40 px-2 py-0.5 rounded inline-block">
                            {fb.reservationNo}
                          </span>
                        </td>

                        {/* Tour Name */}
                        <td className="p-4 text-slate-300 font-medium max-w-[200px] truncate">
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
                          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-slate-500 max-w-[240px]">
                            <span>Tur: <strong className="text-slate-400">{fb.tourSatisfaction}</strong></span>
                            <span>Rehber: <strong className="text-slate-400">{fb.guidePerformance}</strong></span>
                            <span>Otel: <strong className="text-slate-400">{fb.hotelSatisfaction}</strong></span>
                            <span>Yemek: <strong className="text-slate-400">{fb.restaurantSatisfaction}</strong></span>
                          </div>
                        </td>

                        {/* Submission Date */}
                        <td className="p-4 text-slate-500 text-xs shrink-0 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-650" />
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
                            <div className="p-2.5 rounded-xl bg-black/35 border border-red-950/20 text-slate-300 text-xs italic max-w-sm line-clamp-3 hover:line-clamp-none transition-all cursor-pointer leading-relaxed relative group/comment">
                              "{fb.additionalComments}"
                              <MessageSquare className="w-3 h-3 text-slate-650 absolute right-2 bottom-2 opacity-0 group-hover/comment:opacity-100 transition-opacity" />
                            </div>
                          ) : (
                            <span className="text-slate-600 text-xs italic">Yorum yok</span>
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

      <footer className="text-center py-10 text-xs text-slate-650 border-t border-red-950/20 mt-10">
        © {new Date().getFullYear()} Ejder Turizm Admin Analiz Portalı. Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
