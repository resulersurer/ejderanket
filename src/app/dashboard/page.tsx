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
  Activity,
  Zap,
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
  const color =
    value >= 4.5 ? '#10b981' : value >= 3.5 ? '#22c55e' : value >= 2.5 ? '#eab308' : '#ef4444';
  const circumference = 2 * Math.PI * 38;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle
          cx="48" cy="48" r="38" fill="none"
          stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-black text-white leading-none" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{value}</span>
        <span className="text-[10px] text-white/30 font-medium">/5</span>
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
          className={s <= Math.round(rating) ? 'fill-amber-400 stroke-amber-400' : 'fill-transparent stroke-white/15'}
        />
      ))}
    </div>
  );
}

function DistributionBar({ distribution, label, color }: { distribution: number[]; label: string; color: string }) {
  const total = distribution.reduce((a, b) => a + b, 0);
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-white/50" style={{ fontFamily: 'var(--font-inter)' }}>{label}</span>
        <span className="text-[10px] text-white/25 font-mono">{total}</span>
      </div>
      <div className="flex gap-0.5 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
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
        {distribution.map((count, i) => (
          <div key={i} className="flex-1 text-center">
            <div className="text-[9px] font-bold" style={{ color: SCORE_COLORS[i] }}>{count}</div>
            <div className="text-[8px] text-white/20">{i + 1}★</div>
          </div>
        ))}
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b0d14' }}>
        <div className="text-center space-y-6">
          <div className="relative inline-flex">
            <div className="w-20 h-20 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" />
            <img src="/ejder-logo.png" alt="Logo" className="absolute inset-0 m-auto w-10 h-10 rounded-xl object-cover" />
          </div>
          <div>
            <p className="text-white/40 text-sm font-medium tracking-widest uppercase" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Yükleniyor
            </p>
            <div className="flex justify-center gap-1 mt-2">
              {[0,1,2].map(i => (
                <div key={i} className="w-1 h-1 rounded-full bg-red-500/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0b0d14' }}>
        <div className="max-w-sm w-full p-8 text-center space-y-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Veriler Yüklenemedi</h2>
          <p className="text-white/40 text-sm">{error || 'Beklenmedik bir hata oluştu.'}</p>
          <button
            onClick={() => { setLoading(true); fetchDashboardData(); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm text-white cursor-pointer transition-all duration-200 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7a0006, #b91c1c)' }}
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
    if (score >= 4.5) return { label: 'Mükemmel', style: { background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' } };
    if (score >= 3.5) return { label: 'İyi', style: { background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' } };
    if (score >= 2.5) return { label: 'Orta', style: { background: 'rgba(234,179,8,0.12)', color: '#facc15', border: '1px solid rgba(234,179,8,0.2)' } };
    return { label: 'Kritik', style: { background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' } };
  };

  const metrics = [
    { key: 'tourSatisfaction', label: 'Tur Memnuniyeti', icon: TrendingUp, color: '#818cf8' },
    { key: 'guidePerformance', label: 'Rehber', icon: Award, color: '#34d399' },
    { key: 'hotelSatisfaction', label: 'Otel', icon: BedDouble, color: '#a78bfa' },
    { key: 'restaurantSatisfaction', label: 'Restoran', icon: Utensils, color: '#fb923c' },
    { key: 'transportationSatisfaction', label: 'Ulaşım', icon: PlaneTakeoff, color: '#f87171' },
  ] as const;

  const cardBg = 'rgba(255,255,255,0.03)';
  const cardBorder = '1px solid rgba(255,255,255,0.07)';
  const cardRadius = '18px';

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        .db-root {
          min-height: 100vh;
          background: #0b0d14;
          background-image:
            radial-gradient(ellipse 80% 50% at 15% -5%, rgba(122,0,6,0.18) 0%, transparent 55%),
            radial-gradient(ellipse 60% 40% at 85% 105%, rgba(99,102,241,0.1) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 50% 50%, rgba(255,255,255,0.01) 0%, transparent 70%);
          font-family: var(--font-inter), system-ui, sans-serif;
        }

        .db-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(11,13,20,0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .db-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .db-card:hover {
          border-color: rgba(255,255,255,0.11);
        }

        .stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 20px;
          position: relative;
          overflow: hidden;
          transition: all 0.25s ease;
        }
        .stat-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%);
          pointer-events: none;
          border-radius: inherit;
        }
        .stat-card:hover {
          border-color: rgba(255,255,255,0.13);
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.4);
        }

        .hero-stat-card {
          background: linear-gradient(135deg, #7a0006 0%, #b91c1c 60%, #9f1d2e 100%);
          border: 1px solid rgba(185,28,28,0.5);
          border-radius: 16px;
          padding: 24px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(122,0,6,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .hero-stat-card::before {
          content: '';
          position: absolute;
          top: -40px; right: -40px;
          width: 160px; height: 160px;
          background: radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%);
          border-radius: 50%;
        }

        .db-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.6);
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          transition: all 0.18s ease;
          font-family: var(--font-inter), sans-serif;
          text-decoration: none;
        }
        .db-btn-ghost:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.13);
          color: rgba(255,255,255,0.9);
        }

        .db-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 10px 14px;
          color: rgba(255,255,255,0.85);
          font-size: 13px;
          font-family: var(--font-inter), sans-serif;
          outline: none;
          transition: all 0.2s ease;
        }
        .db-input::placeholder { color: rgba(255,255,255,0.2); }
        .db-input:focus {
          border-color: rgba(185,28,28,0.5);
          box-shadow: 0 0 0 3px rgba(122,0,6,0.15);
          background: rgba(255,255,255,0.05);
        }
        .db-input option {
          background: #1a1d28;
          color: rgba(255,255,255,0.85);
        }

        .db-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          font-family: var(--font-space-grotesk), sans-serif;
        }

        .sort-btn {
          cursor: pointer;
          user-select: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          transition: color 0.2s;
          font-family: var(--font-space-grotesk), sans-serif;
          padding: 4px 8px;
          border-radius: 6px;
        }
        .sort-btn:hover, .sort-btn.active {
          color: rgba(255,255,255,0.75);
          background: rgba(255,255,255,0.05);
        }

        .table-head-row {
          background: rgba(255,255,255,0.025);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .table-body-row {
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s ease;
          cursor: pointer;
        }
        .table-body-row:hover {
          background: rgba(255,255,255,0.025);
        }
        .table-body-row.expanded {
          background: rgba(122,0,6,0.06);
          border-left: 2px solid rgba(185,28,28,0.5);
        }
        .table-expanded-row {
          background: rgba(122,0,6,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .db-section-title {
          font-family: var(--font-space-grotesk), sans-serif;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.3);
        }

        .db-display-font {
          font-family: var(--font-space-grotesk), sans-serif;
        }

        .scrollbar-dark::-webkit-scrollbar { height: 4px; }
        .scrollbar-dark::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .scrollbar-dark::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .scrollbar-dark::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-0 { animation: fadeSlideUp 0.45s ease forwards; }
        .anim-1 { animation: fadeSlideUp 0.45s ease 0.07s forwards; opacity: 0; }
        .anim-2 { animation: fadeSlideUp 0.45s ease 0.14s forwards; opacity: 0; }
        .anim-3 { animation: fadeSlideUp 0.45s ease 0.21s forwards; opacity: 0; }

        .pulse-dot {
          animation: pulseDot 2s cubic-bezier(0.4,0,0.6,1) infinite;
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <div className="db-root">

        {/* ── HEADER ── */}
        <header className="db-header">
          <div style={{ maxWidth: 1400 }} className="mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <a href="/" className="db-btn-ghost p-2" title="Anket Sayfasına Dön">
                <ArrowLeft className="w-4 h-4" />
              </a>
              <div className="w-px h-5" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <img src="/ejder-logo.png" alt="Ejder" className="w-9 h-9 rounded-xl object-cover" style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
              <div>
                <div className="text-[9px] font-bold tracking-[0.22em] uppercase" style={{ color: '#f87171', fontFamily: 'var(--font-space-grotesk)' }}>Ejder Turizm</div>
                <div className="text-sm font-bold text-white leading-none mt-0.5 db-display-font">Müşteri Analiz Paneli</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', fontFamily: 'var(--font-space-grotesk)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                {data.totalCount} Kayıt
              </div>
              <button
                onClick={fetchDashboardData}
                disabled={isRefreshing}
                className="db-btn-ghost disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Yenile</span>
              </button>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 1400 }} className="mx-auto px-5 sm:px-8 py-8 space-y-6">

          {/* ── KPI ROW ── */}
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 anim-0">

            {/* Hero card */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-2 hero-stat-card flex items-center gap-5">
              <ScoreGauge value={data.averages.overall} />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-1 db-display-font" style={{ color: 'rgba(255,200,200,0.6)' }}>Genel Ortalama</div>
                <div className="text-4xl font-black text-white leading-none db-display-font">
                  {data.averages.overall}
                  <span className="text-lg font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>/5</span>
                </div>
                <StarRow rating={data.averages.overall} size={13} />
                <div className="mt-2 text-[10px]" style={{ color: 'rgba(255,200,200,0.5)' }}>
                  {data.totalCount} müşteri değerlendirmesi
                </div>
              </div>
            </div>

            {/* Metric mini-cards */}
            {metrics.map((m, i) => {
              const val = data.averages[m.key];
              const Icon = m.icon;
              const trendIcon = val >= 4 ? '↑' : val >= 3 ? '→' : '↓';
              const trendColor = val >= 4 ? '#34d399' : val >= 3 ? '#facc15' : '#f87171';
              return (
                <div key={m.key} className="stat-card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl" style={{ background: `${m.color}14`, border: `1px solid ${m.color}22` }}>
                      <Icon style={{ width: 15, height: 15, color: m.color }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: trendColor }}>{trendIcon}</span>
                  </div>
                  <div className="text-2xl font-black text-white db-display-font">
                    {val}
                    <span className="text-xs font-normal" style={{ color: 'rgba(255,255,255,0.25)' }}>/5</span>
                  </div>
                  <div className="text-[10px] mt-1 leading-tight" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-inter)' }}>{m.label}</div>
                  <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(val / 5) * 100}%`, background: `linear-gradient(90deg, ${m.color}80, ${m.color})` }}
                    />
                  </div>
                </div>
              );
            })}
          </section>

          {/* ── DISTRIBUTIONS ── */}
          <section className="db-card p-6 anim-1">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-1.5 rounded-lg" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <BarChart2 className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />
              </div>
              <h2 className="db-section-title">Puan Dağılımları</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {metrics.map((m) => (
                <DistributionBar key={m.key} distribution={data.distributions[m.key]} label={m.label} color={m.color} />
              ))}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {SCORE_COLORS.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm" style={{ background: c }} />
                  <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-inter)' }}>{i + 1}★ {SCORE_LABELS[i]}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── FILTERS ── */}
          <section className="db-card p-5 anim-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
                <input
                  type="text"
                  placeholder="Yolcu, e-posta, rezervasyon, tur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="db-input pl-10"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <select value={selectedTour} onChange={(e) => setSelectedTour(e.target.value)} className="db-input">
                <option value="all">Tüm Turlar</option>
                {uniqueTours.filter((t) => t !== 'all').map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <select value={minRatingFilter} onChange={(e) => setMinRatingFilter(Number(e.target.value))} className="db-input">
                <option value={0}>Tüm Değerlendirmeler</option>
                <option value={4.5}>4.5+ Yıldız (Çok İyi)</option>
                <option value={4}>4.0+ Yıldız (İyi)</option>
                <option value={3}>3.0+ Yıldız (Orta)</option>
                <option value={1}>3.0 Altı (Kritik)</option>
              </select>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-inter)' }}>
                <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{filteredFeedbacks.length}</strong> kayıt gösteriliyor
              </span>
              <div className="flex items-center gap-1">
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

          {/* ── TABLE ── */}
          <section className="db-card overflow-hidden anim-3">
            <div className="overflow-x-auto scrollbar-dark">
              <table className="w-full border-collapse" style={{ minWidth: 700 }}>
                <thead>
                  <tr className="table-head-row">
                    <th className="p-4 pl-6 text-left" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-space-grotesk)' }}>Yolcu</th>
                    <th className="p-4 text-left" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-space-grotesk)' }}>Tur</th>
                    <th className="p-4 text-left" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-space-grotesk)' }}>Puanlar</th>
                    <th className="p-4 text-left" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-space-grotesk)' }}>Ort.</th>
                    <th className="p-4 pr-6 text-left" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-space-grotesk)' }}>Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeedbacks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-16 text-center">
                        <Search className="w-8 h-8 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.1)' }} />
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-inter)' }}>Uygun kayıt bulunamadı.</p>
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
                          className={`table-body-row ${isExpanded ? 'expanded' : ''}`}
                        >
                          {/* Passenger */}
                          <td className="p-4 pl-6">
                            <div className="font-semibold text-sm" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-inter)' }}>{fb.passengerName}</div>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {fb.reservationNo && (
                                <span className="flex items-center gap-1 text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>
                                  <Hash className="w-2.5 h-2.5" />{fb.reservationNo}
                                </span>
                              )}
                              {fb.email && (
                                <span className="flex items-center gap-1 text-[10px]" style={{ color: 'rgba(255,255,255,0.22)' }}>
                                  <Mail className="w-2.5 h-2.5" />{fb.email}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Tour */}
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 text-sm font-medium max-w-[180px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                              <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />
                              <span className="truncate" style={{ fontFamily: 'var(--font-inter)' }}>{fb.tourName || '—'}</span>
                            </div>
                          </td>

                          {/* Scores */}
                          <td className="p-4">
                            <div className="grid grid-cols-5 gap-1 max-w-[160px]">
                              {[
                                { label: 'T', val: fb.tourSatisfaction, color: '#818cf8' },
                                { label: 'R', val: fb.guidePerformance, color: '#34d399' },
                                { label: 'O', val: fb.hotelSatisfaction, color: '#a78bfa' },
                                { label: 'Y', val: fb.restaurantSatisfaction, color: '#fb923c' },
                                { label: 'U', val: fb.transportationSatisfaction, color: '#f87171' },
                              ].map((s) => (
                                <div key={s.label} className="text-center" title={`${s.label}: ${s.val}/5`}>
                                  <div className="text-xs font-black db-display-font" style={{ color: 'rgba(255,255,255,0.75)' }}>{s.val}</div>
                                  <div className="text-[8px] font-bold mt-0.5" style={{ color: s.color }}>{s.label}</div>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* Average */}
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <span className="font-black text-base db-display-font" style={{ color: 'rgba(255,255,255,0.9)' }}>{avg.toFixed(2)}</span>
                              <span className="db-badge" style={badge.style}>{badge.label}</span>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="p-4 pr-6">
                            <div className="text-xs whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-inter)' }}>
                              {new Date(fb.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                            {(fb.additionalComments || isExpanded) && (
                              <div className="flex items-center gap-1 mt-1.5 text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                                <MessageSquare className="w-3 h-3" />
                                {isExpanded ? 'Kapat' : 'Yorum'}
                              </div>
                            )}
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="table-expanded-row">
                            <td colSpan={5} className="px-6 pb-5 pt-3">
                              <div className="flex items-start gap-3 max-w-2xl">
                                <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'rgba(185,28,28,0.5)' }} />
                                <div>
                                  <div className="text-[10px] font-bold uppercase tracking-wider mb-2 db-section-title">Müşteri Yorumu</div>
                                  {fb.additionalComments ? (
                                    <p className="text-sm leading-relaxed italic pl-3" style={{ color: 'rgba(255,255,255,0.5)', borderLeft: '2px solid rgba(185,28,28,0.35)', fontFamily: 'var(--font-inter)' }}>
                                      "{fb.additionalComments}"
                                    </p>
                                  ) : (
                                    <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-inter)' }}>Bu kayıt için ek yorum girilmemiş.</p>
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
        <footer className="text-center py-8 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.18)', fontFamily: 'var(--font-inter)' }}>
            © {new Date().getFullYear()} Ejder Turizm · Müşteri Memnuniyeti Analiz Sistemi
          </p>
        </footer>

      </div>
    </>
  );
}
