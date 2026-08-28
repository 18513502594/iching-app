'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { calculateFortune, CalcResult } from '@/lib/calc';
import { CITY_LOCATIONS } from '@/lib/geo';
import { getHexNameEn, LUCK_EN } from '@/lib/hexagram-names-en';
import { generateFreeSummaryEn, generateFullReadingEn, palaceLabelEn } from '@/lib/interpret-en';
import { PADDLE_CLIENT_TOKEN, PADDLE_PRICE_ID, PADDLE_ENV, PRICE_DISPLAY } from '@/lib/paddle-config';

const LINE_LABEL = ['1st', '2nd', '3rd', '4th', '5th', '6th'];

interface FormData {
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthHour: string;
  birthMinute: string;
  gender: 'male' | 'female';
  targetYear: string;
  city: string;
  customLongitude: string;
  useCustomLongitude: boolean;
  isOverseas: boolean;
}

const DEFAULT_FORM: FormData = {
  birthYear: '1995',
  birthMonth: '6',
  birthDay: '15',
  birthHour: '12',
  birthMinute: '30',
  gender: 'female',
  targetYear: '2026',
  city: 'Beijing, China',
  customLongitude: '',
  useCustomLongitude: false,
  isOverseas: false,
};

function LineBars({
  lines, changingLine, shi,
}: { lines: number[]; changingLine?: number; shi?: number }) {
  return (
    <div className="space-y-2 max-w-[260px] my-6">
      {lines.slice().reverse().map((line, idx) => {
        const lineNum = 6 - idx;
        const isChanging = lineNum === changingLine;
        const isShi = lineNum === shi;
        return (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span className={`w-10 text-[10px] ${isChanging ? 'text-[#9e2a2b] font-bold' : 'text-[#8c8577]'}`}>
              {LINE_LABEL[lineNum - 1]}
            </span>
            <div className="flex-grow">
              {line === 1 ? (
                <div className={`h-3 rounded bg-gradient-to-r from-[#d4af37] via-[#f3ece0] to-[#d4af37] ${isChanging ? '!from-[#9e2a2b] !via-[#f3ece0] !to-[#9e2a2b]' : ''}`} />
              ) : (
                <div className="h-3 flex justify-between">
                  <div className={`w-[46%] rounded bg-gradient-to-r from-[#d4af37] via-[#f3ece0] to-[#d4af37] ${isChanging ? '!from-[#9e2a2b] !via-[#f3ece0] !to-[#9e2a2b]' : ''}`} />
                  <div className={`w-[46%] rounded bg-gradient-to-r from-[#d4af37] via-[#f3ece0] to-[#d4af37] ${isChanging ? '!from-[#9e2a2b] !via-[#f3ece0] !to-[#9e2a2b]' : ''}`} />
                </div>
              )}
            </div>
            {shi !== undefined && <span className="text-[10px] w-10 text-[#d4af37]">{isShi ? 'Ruling' : ''}</span>}
            {isChanging && <span className="text-[10px] text-[#9e2a2b] whitespace-nowrap">● moving</span>}
          </div>
        );
      })}
    </div>
  );
}

export default function Page() {
  const [step, setStep] = useState<'input' | 'casting' | 'result'>('input');
  const [castProgress, setCastProgress] = useState(0);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);
  const [result, setResult] = useState<CalcResult | null>(null);

  const [isPaid, setIsPaid] = useState(false);
  const [paddleReady, setPaddleReady] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'saved'>('idle');

  const resolvedLongitude = useMemo(() => {
    if (formData.useCustomLongitude) {
      const v = parseFloat(formData.customLongitude);
      return isNaN(v) ? 120 : v;
    }
    const city = CITY_LOCATIONS.find(c => c.name === formData.city);
    return city ? city.longitude : 120;
  }, [formData.city, formData.customLongitude, formData.useCustomLongitude]);

  function runCalculation(data: FormData, longitude: number) {
    return calculateFortune({
      birthYear: parseInt(data.birthYear) || 1995,
      birthMonth: parseInt(data.birthMonth) || 6,
      birthDay: parseInt(data.birthDay) || 15,
      birthHour: parseInt(data.birthHour) || 12,
      birthMinute: parseInt(data.birthMinute) || 0,
      longitude,
      isOverseas: data.isOverseas,
      gender: data.gender,
      targetYear: parseInt(data.targetYear) || 2026,
    });
  }

  // 加载 Paddle.js 并初始化。Paddle 用页面内弹窗结账（不像 Stripe 会跳走整页），
  // 所以不需要把生辰数据编码进链接来防止刷新丢失——用户全程留在这个页面上。
  useEffect(() => {
    if (!PADDLE_CLIENT_TOKEN || !PADDLE_PRICE_ID) return; // 环境变量没配置时不加载，避免报错

    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.onload = () => {
      if (window.Paddle) {
        window.Paddle.Environment.set(PADDLE_ENV);
        window.Paddle.Initialize({
          token: PADDLE_CLIENT_TOKEN,
          eventCallback: (event) => {
            if (event.name === 'checkout.completed') {
              setIsPaid(true);
              setCheckoutLoading(false);
            }
            if (event.name === 'checkout.closed') {
              setCheckoutLoading(false);
            }
          },
        });
        setPaddleReady(true);
      }
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handleCalculate = () => {
    setError('');
    setStep('casting');
    setCastProgress(0);

    const interval = setInterval(() => {
      setCastProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          try {
            const res = runCalculation(formData, resolvedLongitude);
            setResult(res);
            setIsPaid(false);
            setStep('result');
          } catch (e: any) {
            setError(e?.message || 'Something went wrong while casting your hexagram. Please check your inputs.');
            setStep('input');
          }
          return 100;
        }
        return prev + 25;
      });
    }, 350);
  };

  const handleUnlock = () => {
    setError('');
    if (!window.Paddle || !paddleReady) {
      setError('Payment system is still loading. Please wait a moment and try again.');
      return;
    }
    if (!PADDLE_PRICE_ID) {
      setError('Payment is not configured yet on this site.');
      return;
    }
    setCheckoutLoading(true);
    window.Paddle.Checkout.open({
      items: [{ priceId: PADDLE_PRICE_ID, quantity: 1 }],
      settings: { displayMode: 'overlay', theme: 'dark' },
    });
  };

  const handleDownload = () => {
    if (!result) return;
    const lines: string[] = [];
    lines.push('I CHING HEXAGRAM & YEARLY FORTUNE READING');
    lines.push('='.repeat(50));
    lines.push(`Birth data: ${result.lunarStr}`);
    lines.push(`Four Pillars: ${result.baziStr}`);
    lines.push(result.trueSolarNote);
    lines.push(`Forecast Target: ${result.targetYearGanZhi}`);
    lines.push('');
    lines.push(`Primary Hexagram: ${result.originalHex.name} (${result.originalHex.palace})`);
    lines.push(`Hexagram Text: ${result.originalHex.desc}`);
    lines.push(`Image: ${result.originalHex.xiang}`);
    lines.push('');
    lines.push(`Moving Line ${result.changingLine} (${result.changingDetail?.name}): ${result.changingDetail?.ci}`);
    lines.push(`Line Commentary: ${result.changingDetail?.xiang}`);
    lines.push('');
    lines.push(`Transformed Hexagram: ${result.transformedHex.name}`);
    lines.push(`Hexagram Text: ${result.transformedHex.desc}`);
    lines.push('');
    lines.push('NAJIA SIX-LINE CHART');
    result.najiaLines.slice().reverse().forEach(l => {
      lines.push(`Line ${l.lineIndex}: ${l.stem}${l.branch} (${l.elem}) — ${l.relative}${l.isShi ? ' [Ruling]' : ''}${l.isYing ? ' [Paired]' : ''}`);
    });
    lines.push(`Void (Xunkong): ${result.xunKong.join(', ')}`);
    lines.push('');
    lines.push('MONTH-BY-MONTH FORECAST');
    result.monthlyFortunes.forEach(m => {
      lines.push(`Month ${m.month} (${m.term}) [${m.element}] — ${m.status} ${m.score}`);
      lines.push(`  ${m.advice}`);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iching-reading-${result.targetYearGanZhi.split(' ')[0] || 'result'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadStatus('saved');
    setTimeout(() => setDownloadStatus('idle'), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0b0e] text-[#e2d9c8] font-serif p-4 md:p-8 print:bg-white print:text-black">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10 print:hidden">
          <div className="inline-block px-4 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs tracking-widest uppercase mb-3 font-mono">
            ☯ Classical I Ching Najia & Plum Blossom Casting Engine
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-[#f3ece0] tracking-wide mb-2">
            I Ching Hexagram & Yearly Fortune Reading
          </h1>
          <p className="text-sm text-[#a39b8b] max-w-lg mx-auto">
            Combining the complete 384-line text of the I Ching, true solar time-corrected birth data,
            classical Han-dynasty Najia line assignment, and month-by-month solar term forecasting.
          </p>
        </header>

        {step === 'input' && (
          <div className="bg-[#12141a] border border-[#2a2d37] rounded-2xl p-6 md:p-8 shadow-2xl">
            <h2 className="text-lg font-medium text-[#d4af37] border-b border-[#2a2d37] pb-3 mb-6 flex items-center gap-2">
              <span>☯</span> Enter Your Birth Details
            </h2>

            {error && (
              <div className="mb-4 text-xs text-[#f3ece0] bg-[#9e2a2b]/20 border border-[#9e2a2b]/50 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Field label="Birth Year (Gregorian)">
                  <input type="number" value={formData.birthYear}
                    onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                    className={inputClass} />
                </Field>
                <Field label="Month">
                  <input type="number" min="1" max="12" value={formData.birthMonth}
                    onChange={(e) => setFormData({ ...formData, birthMonth: e.target.value })}
                    className={inputClass} />
                </Field>
                <Field label="Day">
                  <input type="number" min="1" max="31" value={formData.birthDay}
                    onChange={(e) => setFormData({ ...formData, birthDay: e.target.value })}
                    className={inputClass} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Birth Hour (0-23, clock time)">
                  <input type="number" min="0" max="23" value={formData.birthHour}
                    onChange={(e) => setFormData({ ...formData, birthHour: e.target.value })}
                    className={inputClass} />
                </Field>
                <Field label="Minute (0-59)">
                  <input type="number" min="0" max="59" value={formData.birthMinute}
                    onChange={(e) => setFormData({ ...formData, birthMinute: e.target.value })}
                    className={inputClass} />
                </Field>
              </div>

              <div>
                <label className="block text-xs text-[#8c8577] mb-1">
                  Birthplace <span className="text-[#65605a]">(used for true solar time correction — affects your exact birth hour)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={formData.city}
                    disabled={formData.useCustomLongitude}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`${inputClass} disabled:opacity-40`}
                  >
                    {CITY_LOCATIONS.map(c => (
                      <option key={c.name} value={c.name}>{c.name} ({c.longitude >= 0 ? 'E' : 'W'}{Math.abs(c.longitude)}°)</option>
                    ))}
                  </select>
                  <input
                    type="number" step="0.01" placeholder="Or enter longitude manually"
                    value={formData.customLongitude}
                    onChange={(e) => setFormData({ ...formData, customLongitude: e.target.value, useCustomLongitude: e.target.value !== '' })}
                    className={inputClass}
                  />
                </div>
                <label className="flex items-center gap-2 mt-2 text-[11px] text-[#8c8577]">
                  <input type="checkbox" checked={formData.isOverseas}
                    onChange={(e) => setFormData({ ...formData, isOverseas: e.target.checked })}
                    className="accent-[#d4af37]" />
                  Birthplace is outside China (correct against the nearest standard time meridian instead of UTC+8)
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Gender">
                  <select value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                    className={inputClass}>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </Field>
                <Field label="Target Year to Forecast">
                  <select value={formData.targetYear}
                    onChange={(e) => setFormData({ ...formData, targetYear: e.target.value })}
                    className={inputClass}>
                    <option value="2026">2026 — Year of the Horse</option>
                    <option value="2027">2027 — Year of the Goat</option>
                    <option value="2025">2025 — Year of the Snake</option>
                    <option value="2028">2028 — Year of the Monkey</option>
                  </select>
                </Field>
              </div>

              <button
                onClick={handleCalculate}
                className="w-full mt-6 bg-gradient-to-r from-[#9e2a2b] to-[#b83b27] hover:from-[#b83b27] hover:to-[#d4af37] text-white font-medium py-3.5 rounded-xl transition-all shadow-lg shadow-[#9e2a2b]/30 flex items-center justify-center gap-2 text-base"
              >
                <span>Cast My Hexagram</span>
                <span>→</span>
              </button>
              <p className="text-center text-[11px] text-[#65605a]">
                Free overview included. Full detailed reading available for {PRICE_DISPLAY}.
              </p>
            </div>
          </div>
        )}

        {step === 'casting' && (
          <div className="bg-[#12141a] border border-[#2a2d37] rounded-2xl p-12 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-t-[#d4af37] border-r-transparent border-b-[#9e2a2b] border-l-transparent animate-spin" />
              <span className="text-3xl text-[#d4af37]">☯</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-[#f3ece0] font-medium">
                {castProgress < 30 && 'Correcting for true solar time and building your birth chart...'}
                {castProgress >= 30 && castProgress < 60 && 'Casting your primary and transformed hexagrams...'}
                {castProgress >= 60 && castProgress < 90 && 'Assigning Najia stems, branches, and ruling/paired lines...'}
                {castProgress >= 90 && 'Matching the classical I Ching text to your reading...'}
              </p>
              <div className="w-full bg-[#1a1d26] h-2 rounded-full overflow-hidden max-w-xs mx-auto">
                <div className="bg-gradient-to-r from-[#9e2a2b] to-[#d4af37] h-full transition-all duration-300"
                  style={{ width: `${castProgress}%` }} />
              </div>
            </div>
          </div>
        )}

        {step === 'result' && result && (() => {
          const originalNameEn = getHexNameEn(result.originalHex.upperCode, result.originalHex.lowerCode);
          const transformedNameEn = getHexNameEn(result.transformedHex.upperCode, result.transformedHex.lowerCode);
          const luckInfo = LUCK_EN[result.originalHex.luck] ?? { label: 'Neutral', tone: 'neutral' as const };

          return (
            <div className="space-y-8">
              <div className="bg-[#12141a] border border-[#2a2d37] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <div>
                  <div className="text-xs text-[#d4af37] font-mono mb-1">
                    {result.lunarStr} • {result.baziStr}
                  </div>
                  <div className="text-[11px] text-[#8c8577] mb-2">{result.trueSolarNote}</div>
                  <h2 className="text-2xl text-[#f3ece0] font-bold">
                    Forecast Target: {result.targetYearGanZhi}
                  </h2>
                </div>
                <button onClick={() => setStep('input')}
                  className="px-4 py-2 bg-[#1a1d26] hover:bg-[#252936] text-[#d4af37] border border-[#d4af37]/30 rounded-lg text-xs whitespace-nowrap">
                  ↺ Start Over
                </button>
              </div>

              {isPaid && (
                <div className="bg-gradient-to-r from-[#9e2a2b]/30 to-[#d4af37]/20 border-2 border-[#d4af37] rounded-2xl p-5 print:hidden">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-[#f3ece0] mb-1">⚠️ Save your result now</p>
                      <p className="text-xs text-[#e2d9c8]">
                        This reading isn't stored on any account — closing or refreshing this page means it's gone.
                        Download a copy or save a PDF before you leave.
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={handleDownload}
                        className="px-4 py-2 bg-[#d4af37] hover:bg-[#e5c158] text-[#0a0b0e] font-bold text-xs rounded-lg whitespace-nowrap">
                        {downloadStatus === 'saved' ? '✓ Downloaded' : '⬇ Download Reading (.txt)'}
                      </button>
                      <button onClick={() => window.print()}
                        className="px-4 py-2 bg-[#1a1d26] hover:bg-[#252936] text-[#f3ece0] border border-[#d4af37]/40 text-xs rounded-lg whitespace-nowrap">
                        🖨 Save as PDF
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#12141a] border border-[#d4af37]/40 rounded-2xl p-6 relative">
                  <div className="absolute top-4 right-4 text-xs px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#d4af37]">
                    Primary Hexagram ({palaceLabelEn(result.originalHex.palace)})
                  </div>
                  <h3 className="text-xl font-bold text-[#f3ece0] mb-1">
                    {originalNameEn.pinyin} — {originalNameEn.gloss}
                  </h3>
                  <p className="text-xs text-[#a39b8b] mb-1">{result.originalHex.name} · {result.originalHex.category}</p>
                  <p className="text-xs mb-4">
                    <span className={`inline-block px-2 py-0.5 rounded font-bold ${
                      luckInfo.tone === 'great' || luckInfo.tone === 'good' ? 'bg-emerald-900/40 text-emerald-400' :
                      luckInfo.tone === 'bad' || luckInfo.tone === 'caution' ? 'bg-[#9e2a2b]/30 text-[#e08a8a]' :
                      'bg-[#2a2d37] text-[#a39b8b]'
                    }`}>{luckInfo.label}</span>
                  </p>
                  <LineBars lines={result.originalLines} changingLine={result.changingLine} shi={result.originalHex.shi} />
                  <p className="text-xs text-[#c5bcac] leading-relaxed bg-[#1a1d26] p-3 rounded-lg border border-[#2a2d37]">
                    {generateFreeSummaryEn(result.originalHex)}
                  </p>
                </div>

                <div className="bg-[#12141a] border border-[#2a2d37] rounded-2xl p-6 relative">
                  <div className="absolute top-4 right-4 text-xs px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-400">
                    Transformed Hexagram
                  </div>
                  <h3 className="text-xl font-bold text-[#f3ece0] mb-1">
                    {transformedNameEn.pinyin} — {transformedNameEn.gloss}
                  </h3>
                  <p className="text-xs text-[#a39b8b] mb-4">{result.transformedHex.name} · {palaceLabelEn(result.transformedHex.palace)}</p>
                  <LineBars lines={result.transformedLines} />
                  <p className="text-xs text-[#8c8577] leading-relaxed bg-[#1a1d26] p-3 rounded-lg border border-[#2a2d37]">
                    This is what your situation is shifting toward. Full interpretation is part of the detailed reading below.
                  </p>
                </div>
              </div>

              {!isPaid && (
                <div className="bg-gradient-to-b from-[#1a1d26] to-[#12141a] border-2 border-dashed border-[#d4af37]/40 rounded-2xl p-8 text-center print:hidden">
                  <div className="text-3xl mb-3">🔒</div>
                  <h3 className="text-lg font-bold text-[#f3ece0] mb-2">Unlock Your Full Reading</h3>
                  <p className="text-xs text-[#a39b8b] max-w-md mx-auto mb-5">
                    Get the complete classical text for your moving line, the full Najia six-line chart with
                    ruling/paired lines and hidden relatives, and a detailed month-by-month forecast for {result.targetYearGanZhi}.
                  </p>
                  <button
                    onClick={handleUnlock}
                    disabled={checkoutLoading}
                    className="bg-gradient-to-r from-[#9e2a2b] to-[#d4af37] hover:opacity-90 text-white font-bold px-8 py-3 rounded-xl shadow-lg disabled:opacity-50"
                  >
                    {checkoutLoading ? 'Opening secure checkout…' : `Unlock Full Reading — ${PRICE_DISPLAY}`}
                  </button>
                  <p className="text-[10px] text-[#65605a] mt-3">Secure payment via Paddle · One-time payment, no subscription</p>
                  {error && <p className="text-xs text-[#e08a8a] mt-3">{error}</p>}
                </div>
              )}

              {isPaid && (
                <>
                  <div className="bg-[#12141a] border border-[#9e2a2b]/50 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-[#d4af37] border-b border-[#2a2d37] pb-2 mb-3 flex items-center gap-2">
                      <span>☯</span> Full Reading &amp; Moving Line Analysis (Line {result.changingLine}: {result.changingDetail?.name})
                    </h3>
                    <p className="text-xs text-[#8c8577] mb-3 leading-relaxed">
                      {generateFullReadingEn(result.originalHex, result.changingLine, result.monthlyFortunes, result.targetYearGanZhi)}
                    </p>
                    <div className="bg-[#1a1d26] p-4 rounded-lg border border-[#2a2d37] space-y-2">
                      <p className="text-base text-[#f3ece0] font-bold">Hexagram Text (Original): {result.originalHex.desc}</p>
                      <p className="text-xs text-[#a39b8b]">Image (Daxiang): {result.originalHex.xiang}</p>
                      <p className="text-base text-[#f3ece0] font-bold pt-2 border-t border-[#2a2d37]">Moving Line Text: {result.changingDetail?.ci}</p>
                      <p className="text-xs text-[#d4af37]">Line Commentary (Xiaoxiang): {result.changingDetail?.xiang}</p>
                    </div>
                  </div>

                  <div className="bg-[#12141a] border border-[#2a2d37] rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-[#d4af37] border-b border-[#2a2d37] pb-3 mb-4 flex flex-wrap items-center justify-between gap-2">
                      <span>☯ Najia Six-Line Chart ({palaceLabelEn(result.originalHex.palace)})</span>
                      <span className="text-xs font-normal text-[#8c8577]">
                        Void (Xunkong): {result.xunKong[0]}, {result.xunKong[1]}
                      </span>
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#2a2d37] text-[#8c8577]">
                            <th className="py-2">Line</th>
                            <th className="py-2">Stem-Branch</th>
                            <th className="py-2">Element</th>
                            <th className="py-2">Relative</th>
                            <th className="py-2">Ruling/Paired/Void</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2d37]/50 text-[#c5bcac]">
                          {result.najiaLines.slice().reverse().map((item) => {
                            const isKong = result.xunKong.includes(item.branch);
                            return (
                              <tr key={item.lineIndex} className={item.lineIndex === result.changingLine ? "bg-[#9e2a2b]/10" : ""}>
                                <td className="py-2.5 font-bold">{LINE_LABEL[item.lineIndex - 1]}</td>
                                <td className="py-2.5 text-[#f3ece0]">{item.stem}{item.branch}</td>
                                <td className="py-2.5">{item.elem}</td>
                                <td className="py-2.5 text-[#d4af37]">{item.relative}</td>
                                <td className="py-2.5 space-x-1">
                                  {item.isShi && <span className="text-[#d4af37] font-bold">Ruling</span>}
                                  {item.isYing && <span className="text-[#8fb3d9] font-bold">Paired</span>}
                                  {isKong && <span className="text-[#65605a]">(Void)</span>}
                                  {item.lineIndex === result.changingLine && <span className="text-[#9e2a2b]">● moving</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-[#12141a] border border-[#2a2d37] rounded-2xl p-6 md:p-8">
                    <h3 className="text-lg font-bold text-[#d4af37] border-b border-[#2a2d37] pb-4 mb-6 flex justify-between items-center">
                      <span>📅 {result.targetYearGanZhi} — Month-by-Month Forecast</span>
                      <span className="text-xs font-normal text-[#8c8577]">Based on solar terms &amp; elemental interaction</span>
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {result.monthlyFortunes.map((m) => (
                        <div key={m.month} className="bg-[#1a1d26] border border-[#2a2d37] p-4 rounded-xl flex items-start gap-4">
                          <div className="bg-[#222632] text-[#d4af37] font-bold text-center p-2 rounded-lg min-w-[56px]">
                            <div className="text-xs">Mo. {m.month}</div>
                            <div className="text-[10px] text-[#8c8577]">{m.element}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-[#f3ece0]">{m.term}</span>
                              <span className="text-[10px] text-[#d4af37]">{m.score}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#d4af37]/10 text-[#d4af37]">{m.status}</span>
                            </div>
                            <p className="text-xs text-[#a39b8b] leading-relaxed">{m.advice}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })()}

        <footer className="mt-16 pt-6 border-t border-[#2a2d37] text-center text-[10px] text-[#65605a] print:hidden">
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/terms" className="hover:text-[#d4af37]">Terms of Service</Link>
            <span>&middot;</span>
            <Link href="/privacy" className="hover:text-[#d4af37]">Privacy Policy</Link>
            <span>&middot;</span>
            <Link href="/refund" className="hover:text-[#d4af37]">Refund Policy</Link>
          </div>
          <p className="mt-3">Payments securely processed by Paddle.com, our Merchant of Record.</p>
        </footer>
      </div>
    </div>
  );
}

const inputClass = "w-full bg-[#1a1d26] border border-[#343846] rounded-lg px-3 py-2 text-sm text-[#f3ece0] focus:outline-none focus:border-[#d4af37]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-[#8c8577] mb-1">{label}</label>
      {children}
    </div>
  );
}
