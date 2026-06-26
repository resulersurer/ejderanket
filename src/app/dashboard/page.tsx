'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Star,
  RefreshCw,
  Search,
  MessageSquare,
  Calendar,
  AlertCircle,
  ArrowLeft,
  Award,
  BedDouble,
  Utensils,
  PlaneTakeoff,
  TrendingUp,
  BarChart2,
  ChevronDown,
  ChevronUp,
  X,
  MapPin,
  Mail,
  Hash,
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

const SCORE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
const SCORE_LABELS = ['Çok Kötü', 'Zayıf', 'Orta', 'İyi', 'Mükemmel'];

function ScoreGauge({ value, max = 5 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  const color = value >= 4.5 ? '#10b981' : value >= 3.5 ? '#22c55e' : value >= 2.5 ? '#eab308' : '#ef4444';
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
        <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
        <circle
          cx="44" cy="44" r="36" fill="none"
          stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-black text-white leading-none">{value}</span>
        <span className="text-[9px] text-white/40 font-medium">/5</span>
      </div>
    </div>
  );
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          style={{ width: size, height: size }}
          className={s <= Math.round(rating) ? 'fill-amber-400 stroke-amber-400' : 'fill-transparent stroke-white/20'}
        />
      ))}
    </div>
  );
}

function DistributionBar({ distribution, label }: { distribution: number[]; label: string }) {
  const total = distribution.reduce((a, b) => a + b, 0);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-white/60">{label}</span>
        <span className="text-[10px] text-white/30">{total} yanıt</span>
      </div>
      <div className="flex gap-0.5 h-2 rounded-full overflow-hidden bg-white/5">
        {distribution.map((count, i) => {
          const w = total > 0 ? (count / total) * 100 : 0;
          return w > 0 ? (
            <div
              key={i}
              style={{ width: `${w}%`, backgroundColor: SCORE_COLORS[i] }}
              className="h-full transition-all duration-700"
              title={`${i + 1} Yıldız: ${count} kişi (${w.toFixed(1)}%)`}
            />
          ) : null;
        })}
      </div>
      <div className="flex gap-1">
        {distribution.map((count, i) => {
          const w = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={i} className="flex-1 text-center">
              <div className="text-[9px] font-bold" style={{ color: SCORE_COLORS[i] }}>{count}</div>
              <div className="text-[8px] text-slate-400">{i + 1}★</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [selectedTour, setSelectedTour] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Sunucu hata döndürdü.');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Veri çekilirken hata oluştu.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    document.title = 'Ejder Turizm | Yönetim Paneli';
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen dashboard-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <div className="w-16 h-16 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin" />
            <img src="/ejder-logo.png" alt="Logo" className="absolute inset-0 m-auto w-8 h-8 rounded-md object-cover" />
          </div>
          <p className="text-slate-500 text-sm font-medium tracking-wider">Veriler yükleniyor…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen dashboard-bg flex items-center justify-center p-6">
        <div className="glass-card max-w-sm w-full p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-slate-900 font-bold text-lg">Veriler Yüklenemedi</h2>
          <p className="text-slate-500 text-sm">{error || 'Beklenmedik bir hata oluştu.'}</p>
          <button
            onClick={() => { setLoading(true); fetchDashboardData(); }}
            className="btn-primary w-full"
          >
            <RefreshCw className="w-4 h-4" /> Yeniden Dene
          </button>
        </div>
      </div>
    );
  }

  const uniqueTours = ['all', ...Array.from(new Set(data.feedbacks.map((f) => f.tourName).filter(Boolean)))];

  const filteredFeedbacks = data.feedbacks
    .filter((fb) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        fb.passengerName?.toLowerCase().includes(q) ||
        fb.email?.toLowerCase().includes(q) ||
        fb.reservationNo?.toLowerCase().includes(q) ||
        fb.tourName?.toLowerCase().includes(q);
      const avg = (fb.tourSatisfaction + fb.guidePerformance + fb.hotelSatisfaction + fb.restaurantSatisfaction + fb.transportationSatisfaction) / 5;
      const matchRating = minRatingFilter === 0 || avg >= minRatingFilter;
      const matchTour = selectedTour === 'all' || fb.tourName === selectedTour;
      return matchSearch && matchRating && matchTour;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return sortDir === 'desc' ? -diff : diff;
      } else {
        const avgA = (a.tourSatisfaction + a.guidePerformance + a.hotelSatisfaction + a.restaurantSatisfaction + a.transportationSatisfaction) / 5;
        const avgB = (b.tourSatisfaction + b.guidePerformance + b.hotelSatisfaction + b.restaurantSatisfaction + b.transportationSatisfaction) / 5;
        return sortDir === 'desc' ? avgB - avgA : avgA - avgB;
      }
    });

  const getScoreBadge = (score: number) => {
    if (score >= 4.5) return { label: 'Mükemmel', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' };
    if (score >= 3.5) return { label: 'İyi', bg: 'bg-green-500/15 text-green-400 border-green-500/20' };
    if (score >= 2.5) return { label: 'Orta', bg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' };
    return { label: 'Kritik', bg: 'bg-red-500/15 text-red-400 border-red-500/20' };
  };

  const metrics = [
    { key: 'tourSatisfaction', label: 'Tur Memnuniyeti', icon: TrendingUp, color: '#6366f1', dist: data.distributions.tourSatisfaction },
    { key: 'guidePerformance', label: 'Rehber Performansı', icon: Award, color: '#10b981', dist: data.distributions.guidePerformance },
    { key: 'hotelSatisfaction', label: 'Otel Memnuniyeti', icon: BedDouble, color: '#8b5cf6', dist: data.distributions.hotelSatisfaction },
    { key: 'restaurantSatisfaction', label: 'Restoran', icon: Utensils, color: '#f97316', dist: data.distributions.restaurantSatisfaction },
    { key: 'transportationSatisfaction', label: 'Ulaşım', icon: PlaneTakeoff, color: '#ef4444', dist: data.distributions.transportationSatisfaction },
  ] as const;

  return (
    <>
      <style>{`
        .dashboard-bg {
          background: #f4f5f7;
          background-image:
            radial-gradient(ellipse 70% 40% at 10% 0%, rgba(122,0,6,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 90% 100%, rgba(99,102,241,0.06) 0%, transparent 60%);
          min-height: 100vh;
        }
        .glass-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
        }
        .glass-card-hover {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          transition: all 0.2s ease;
        }
        .glass-card-hover:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transform: translateY(-1px);
        }
        .stat-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 24px;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03);
        }
        .stat-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, transparent 60%);
          pointer-events: none;
        }
        .stat-card:hover {
          border-color: #d1d5db;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 18px;
          background: linear-gradient(135deg, #7a0006, #b91c1c);
          color: white;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(122,0,6,0.3);
        }
        .btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(122,0,6,0.4);
        }
        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: #ffffff;
          color: #374151;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .btn-ghost:hover {
          background: #f9fafb;
          border-color: #d1d5db;
          color: #111827;
        }
        .input-dark {
          width: 100%;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 10px 14px;
          color: #111827;
          font-size: 13px;
          outline: none;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .input-dark::placeholder { color: #9ca3af; }
        .input-dark:focus {
          border-color: #7a0006;
          box-shadow: 0 0 0 3px rgba(122,0,6,0.1);
        }
        .input-dark option { background: #ffffff; color: #111827; }
        .table-row-expanded {
          background: rgba(122,0,6,0.03);
          border-left: 2px solid rgba(122,0,6,0.4);
        }
        .sort-btn { 
          cursor: pointer; 
          user-select: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          transition: color 0.2s;
        }
        .sort-btn:hover, .sort-btn.active { color: #374151; }
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 8px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          border: 1px solid;
          letter-spacing: 0.04em;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in { animation: fadeInUp 0.4s ease forwards; }
        .animate-in-delay-1 { animation: fadeInUp 0.4s ease 0.05s forwards; opacity: 0; }
        .animate-in-delay-2 { animation: fadeInUp 0.4s ease 0.1s forwards; opacity: 0; }
        .animate-in-delay-3 { animation: fadeInUp 0.4s ease 0.15s forwards; opacity: 0; }
        .animate-in-delay-4 { animation: fadeInUp 0.4s ease 0.2s forwards; opacity: 0; }
        .scrollbar-dark::-webkit-scrollbar { height: 4px; }
        .scrollbar-dark::-webkit-scrollbar-track { background: #f3f4f6; }
        .scrollbar-dark::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
      `}</style>

      <div className="dashboard-bg">

        {/* ── HEADER ── */}
        <header className="sticky top-0 z-30 border-b border-slate-200" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)' }}>
          <div className="max-w-[1400px] mx-auto px-5 sm:px-8 h-[64px] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <a href="/" className="btn-ghost p-2" title="Anket Sayfasına Dön">
                <ArrowLeft className="w-4 h-4" />
              </a>
              <div className="w-px h-6 bg-slate-200" />
              <img src="/ejder-logo.png" alt="Ejder" className="w-9 h-9 rounded-xl object-cover border border-slate-200" />
              <div>
                <div className="text-[9px] font-bold text-red-700 tracking-[0.2em] uppercase">Ejder Turizm</div>
                <div className="text-sm font-bold text-slate-900 leading-none mt-0.5">Müşteri Analiz Paneli</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#059669' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {data.totalCount} Kayıt
              </div>
              <button
                onClick={fetchDashboardData}
                disabled={isRefreshing}
                className="btn-ghost disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Yenile</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-[1400px] mx-auto px-5 sm:px-8 py-8 space-y-8">

          {/* ── TOP KPI ROW ── */}
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 animate-in">

            {/* Overall Score - special card */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-2 stat-card flex items-center gap-6"
              style={{ background: 'linear-gradient(135deg, #7a0006 0%, #b91c1c 100%)', borderColor: '#991b1b' }}>
              <ScoreGauge value={data.averages.overall} />
              <div>
                <div className="text-[10px] font-bold text-red-200/70 uppercase tracking-widest mb-1">Genel Ortalama</div>
                <div className="text-4xl font-black text-white">{data.averages.overall}<span className="text-lg text-white/50 font-medium">/5</span></div>
                <StarRow rating={data.averages.overall} size={13} />
                <div className="mt-2 text-[10px] text-red-200/60">{data.totalCount} müşteri değerlendirmesi</div>
              </div>
            </div>

            {metrics.map((m, i) => {
              const val = data.averages[m.key];
              const Icon = m.icon;
              return (
                <div key={m.key} className="stat-card" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl" style={{ background: `${m.color}14`, border: `1px solid ${m.color}30` }}>
                      <Icon style={{ width: 16, height: 16, color: m.color }} />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{val >= 4 ? '↑' : val >= 3 ? '→' : '↓'}</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{val}<span className="text-xs text-slate-400">/5</span></div>
                  <div className="text-[10px] text-slate-500 mt-1 leading-tight">{m.label}</div>
                  <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(val / 5) * 100}%`, background: m.color }} />
                  </div>
                </div>
              );
            })}
          </section>

          {/* ── DISTRIBUTIONS PANEL ── */}
          <section className="glass-card p-6 animate-in-delay-1">
            <div className="flex items-center gap-2 mb-6">
              <BarChart2 className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Puan Dağılımları</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {metrics.map((m) => (
                <DistributionBar key={m.key} distribution={m.dist} label={m.label} />
              ))}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-5 pt-5 border-t border-slate-100">
              {SCORE_COLORS.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm" style={{ background: c }} />
                  <span className="text-[10px] text-slate-400">{i + 1}★ {SCORE_LABELS[i]}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── FILTERS ── */}
          <section className="glass-card p-5 animate-in-delay-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Yolcu adı, e-posta, rezervasyon, tur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-dark pl-10"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <select value={selectedTour} onChange={(e) => setSelectedTour(e.target.value)} className="input-dark">
                <option value="all">Tüm Turlar</option>
                {uniqueTours.filter((t) => t !== 'all').map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <select value={minRatingFilter} onChange={(e) => setMinRatingFilter(Number(e.target.value))} className="input-dark">
                <option value={0}>Tüm Değerlendirmeler</option>
                <option value={4.5}>4.5+ Yıldız (Çok İyi)</option>
                <option value={4}>4.0+ Yıldız (İyi)</option>
                <option value={3}>3.0+ Yıldız (Orta)</option>
                <option value={1}>3.0 Altı (Kritik)</option>
              </select>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                <strong className="text-slate-600">{filteredFeedbacks.length}</strong> kayıt gösteriliyor
              </span>
              <div className="flex items-center gap-3">
                <span
                  className={`sort-btn ${sortBy === 'date' ? 'active' : ''}`}
                  onClick={() => { setSortBy('date'); setSortDir(sortBy === 'date' && sortDir === 'desc' ? 'asc' : 'desc'); }}
                >
                  <Calendar className="w-3 h-3" /> Tarih
                  {sortBy === 'date' && (sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                </span>
                <span
                  className={`sort-btn ${sortBy === 'score' ? 'active' : ''}`}
                  onClick={() => { setSortBy('score'); setSortDir(sortBy === 'score' && sortDir === 'desc' ? 'asc' : 'desc'); }}
                >
                  <Star className="w-3 h-3" /> Puan
                  {sortBy === 'score' && (sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                </span>
              </div>
            </div>
          </section>

          {/* ── FEEDBACK TABLE ── */}
          <section className="glass-card overflow-hidden animate-in-delay-3">
            <div className="overflow-x-auto scrollbar-dark">
              <table className="w-full border-collapse" style={{ minWidth: 700 }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th className="p-4 pl-6 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Yolcu</th>
                    <th className="p-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Tur</th>
                    <th className="p-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Puanlar</th>
                    <th className="p-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Ortalama</th>
                    <th className="p-4 pr-6 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeedbacks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-16 text-center">
                        <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">Uygun kayıt bulunamadı.</p>
                      </td>
                    </tr>
                  ) : filteredFeedbacks.map((fb) => {
                    const avg = (fb.tourSatisfaction + fb.guidePerformance + fb.hotelSatisfaction + fb.restaurantSatisfaction + fb.transportationSatisfaction) / 5;
                    const badge = getScoreBadge(avg);
                    const isExpanded = expandedRow === fb.id;

                    return (
                      <React.Fragment key={fb.id}>
                        <tr
                          onClick={() => setExpandedRow(isExpanded ? null : fb.id)}
                          className={`cursor-pointer transition-all duration-150 ${isExpanded ? 'table-row-expanded' : ''}`}
                          style={{ borderBottom: '1px solid #f3f4f6' }}
                          onMouseEnter={(e) => { if (!isExpanded) (e.currentTarget as HTMLElement).style.background = '#f9fafb'; }}
                          onMouseLeave={(e) => { if (!isExpanded) (e.currentTarget as HTMLElement).style.background = ''; }}
                        >
                          {/* Passenger */}
                          <td className="p-4 pl-6">
                            <div className="font-semibold text-slate-900 text-sm">{fb.passengerName}</div>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {fb.reservationNo && (
                                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                                  <Hash className="w-2.5 h-2.5" />{fb.reservationNo}
                                </span>
                              )}
                              {fb.email && (
                                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                  <Mail className="w-2.5 h-2.5" />{fb.email}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Tour */}
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium max-w-[180px]">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{fb.tourName || '—'}</span>
                            </div>
                          </td>

                          {/* Score breakdown */}
                          <td className="p-4">
                            <div className="grid grid-cols-5 gap-1 max-w-[160px]">
                              {[
                                { label: 'T', val: fb.tourSatisfaction, color: '#6366f1' },
                                { label: 'R', val: fb.guidePerformance, color: '#10b981' },
                                { label: 'O', val: fb.hotelSatisfaction, color: '#8b5cf6' },
                                { label: 'Y', val: fb.restaurantSatisfaction, color: '#f97316' },
                                { label: 'U', val: fb.transportationSatisfaction, color: '#ef4444' },
                              ].map((s) => (
                                <div key={s.label} className="text-center" title={`${s.label}: ${s.val}/5`}>
                                  <div className="text-xs font-black text-slate-900">{s.val}</div>
                                  <div className="text-[8px] font-bold mt-0.5" style={{ color: s.color }}>{s.label}</div>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* Average */}
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-slate-900 font-black text-base">{avg.toFixed(2)}</span>
                              <span className={`badge ${badge.bg}`}>{badge.label}</span>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="p-4 pr-6">
                            <div className="text-xs text-slate-500 whitespace-nowrap">
                              {new Date(fb.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                            {(fb.additionalComments || isExpanded) && (
                              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-400">
                                <MessageSquare className="w-3 h-3" />
                                {isExpanded ? 'Kapat' : 'Yorum var'}
                              </div>
                            )}
                          </td>
                        </tr>

                        {/* Expanded comments row */}
                        {isExpanded && (
                          <tr style={{ background: '#fff9f9', borderBottom: '1px solid #f3f4f6' }}>
                            <td colSpan={5} className="px-6 pb-5 pt-2">
                              <div className="flex items-start gap-3 max-w-2xl">
                                <MessageSquare className="w-4 h-4 text-red-400/60 shrink-0 mt-1" />
                                <div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Müşteri Yorumu</div>
                                  {fb.additionalComments ? (
                                    <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-red-300 pl-3">
                                      "{fb.additionalComments}"
                                    </p>
                                  ) : (
                                    <p className="text-xs text-slate-400 italic">Bu kayıt için ek yorum girilmemiş.</p>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

        </main>

        {/* ── FOOTER ── */}
        <footer className="text-center py-8 mt-4 border-t border-slate-200">
          <p className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} Ejder Turizm · Müşteri Memnuniyeti Analiz Sistemi
          </p>
        </footer>
      </div>
    </>
  );
}
