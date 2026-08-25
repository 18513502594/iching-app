'use client';

import React, { useMemo, useState } from 'react';
import { calculateFortune, CalcResult } from '@/lib/calc';
import { CITY_LOCATIONS } from '@/lib/geo';

const LINE_LABEL = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

function LineBars({
  lines, changingLine, shi,
}: { lines: number[]; changingLine?: number; shi?: number }) {
  return (
    <div className="space-y-2 max-w-[240px] my-6">
      {lines.slice().reverse().map((line, idx) => {
        const lineNum = 6 - idx;
        const isChanging = lineNum === changingLine;
        const isShi = lineNum === shi;
        return (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span className={`w-8 text-[10px] ${isChanging ? 'text-[#9e2a2b] font-bold' : 'text-[#8c8577]'}`}>
              {lineNum === 6 ? '上爻' : lineNum === 1 ? '初爻' : `${lineNum}爻`}
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
            {shi !== undefined && <span className="text-[10px] w-8 text-[#d4af37]">{isShi ? '【世】' : ''}</span>}
            {isChanging && <span className="text-[10px] text-[#9e2a2b]">●动</span>}
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

  const [formData, setFormData] = useState({
    birthYear: '1995',
    birthMonth: '6',
    birthDay: '15',
    birthHour: '12',
    birthMinute: '30',
    gender: 'female' as 'male' | 'female',
    targetYear: '2026',
    city: '北京',
    customLongitude: '',
    useCustomLongitude: false,
    isOverseas: false,
  });

  const [result, setResult] = useState<CalcResult | null>(null);

  const resolvedLongitude = useMemo(() => {
    if (formData.useCustomLongitude) {
      const v = parseFloat(formData.customLongitude);
      return isNaN(v) ? 120 : v;
    }
    const city = CITY_LOCATIONS.find(c => c.name === formData.city);
    return city ? city.longitude : 120;
  }, [formData.city, formData.customLongitude, formData.useCustomLongitude]);

  const handleCalculate = () => {
    setError('');
    setStep('casting');
    setCastProgress(0);

    const interval = setInterval(() => {
      setCastProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          try {
            const res = calculateFortune({
              birthYear: parseInt(formData.birthYear) || 1995,
              birthMonth: parseInt(formData.birthMonth) || 6,
              birthDay: parseInt(formData.birthDay) || 15,
              birthHour: parseInt(formData.birthHour) || 12,
              birthMinute: parseInt(formData.birthMinute) || 0,
              longitude: resolvedLongitude,
              isOverseas: formData.isOverseas,
              gender: formData.gender,
              targetYear: parseInt(formData.targetYear) || 2026,
            });
            setResult(res);
            setStep('result');
          } catch (e: any) {
            setError(e?.message || '排盘计算出错，请检查输入信息。');
            setStep('input');
          }
          return 100;
        }
        return prev + 25;
      });
    }, 350);
  };

  return (
    <div className="min-h-screen bg-[#0a0b0e] text-[#e2d9c8] font-serif p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-block px-4 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs tracking-widest uppercase mb-3 font-mono">
            ☯ 周易正统纳甲与梅花易数算卦引擎
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-[#f3ece0] tracking-wide mb-2">
            周易六十四卦与流年运势推演
          </h1>
          <p className="text-sm text-[#a39b8b] max-w-lg mx-auto">
            融合《周易》384爻全量原文、真太阳时校正农历干支、京房六爻纳甲装配及十二节气流月生克。
          </p>
        </header>

        {step === 'input' && (
          <div className="bg-[#12141a] border border-[#2a2d37] rounded-2xl p-6 md:p-8 shadow-2xl">
            <h2 className="text-lg font-medium text-[#d4af37] border-b border-[#2a2d37] pb-3 mb-6 flex items-center gap-2">
              <span>☯</span> 录入本命时空坐标
            </h2>

            {error && (
              <div className="mb-4 text-xs text-[#f3ece0] bg-[#9e2a2b]/20 border border-[#9e2a2b]/50 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Field label="出生年份 (公历)">
                  <input type="number" value={formData.birthYear}
                    onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                    className={inputClass} />
                </Field>
                <Field label="月份">
                  <input type="number" min="1" max="12" value={formData.birthMonth}
                    onChange={(e) => setFormData({ ...formData, birthMonth: e.target.value })}
                    className={inputClass} />
                </Field>
                <Field label="日期">
                  <input type="number" min="1" max="31" value={formData.birthDay}
                    onChange={(e) => setFormData({ ...formData, birthDay: e.target.value })}
                    className={inputClass} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="出生小时 (0-23时，钟表时间)">
                  <input type="number" min="0" max="23" value={formData.birthHour}
                    onChange={(e) => setFormData({ ...formData, birthHour: e.target.value })}
                    className={inputClass} />
                </Field>
                <Field label="分钟 (0-59分)">
                  <input type="number" min="0" max="59" value={formData.birthMinute}
                    onChange={(e) => setFormData({ ...formData, birthMinute: e.target.value })}
                    className={inputClass} />
                </Field>
              </div>

              <div>
                <label className="block text-xs text-[#8c8577] mb-1">
                  出生地 <span className="text-[#65605a]">（用于真太阳时校正，影响精确时辰判定）</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={formData.city}
                    disabled={formData.useCustomLongitude}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`${inputClass} disabled:opacity-40`}
                  >
                    {CITY_LOCATIONS.map(c => (
                      <option key={c.name} value={c.name}>{c.name}（东经{c.longitude}°）</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" step="0.01" placeholder="或手动输入经度"
                      value={formData.customLongitude}
                      onChange={(e) => setFormData({ ...formData, customLongitude: e.target.value, useCustomLongitude: e.target.value !== '' })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 mt-2 text-[11px] text-[#8c8577]">
                  <input type="checkbox" checked={formData.isOverseas}
                    onChange={(e) => setFormData({ ...formData, isOverseas: e.target.checked })}
                    className="accent-[#d4af37]" />
                  出生地位于海外（按当地最近时区标准经线校正，而非东八区）
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="性别">
                  <select value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                    className={inputClass}>
                    <option value="female">坤造 (女)</option>
                    <option value="male">乾造 (男)</option>
                  </select>
                </Field>
                <Field label="测算目标流年">
                  <select value={formData.targetYear}
                    onChange={(e) => setFormData({ ...formData, targetYear: e.target.value })}
                    className={inputClass}>
                    <option value="2026">2026 丙午马年</option>
                    <option value="2027">2027 丁未羊年</option>
                    <option value="2025">2025 乙巳蛇年</option>
                    <option value="2028">2028 戊申猴年</option>
                  </select>
                </Field>
              </div>

              <button
                onClick={handleCalculate}
                className="w-full mt-6 bg-gradient-to-r from-[#9e2a2b] to-[#b83b27] hover:from-[#b83b27] hover:to-[#d4af37] text-white font-medium py-3.5 rounded-xl transition-all shadow-lg shadow-[#9e2a2b]/30 flex items-center justify-center gap-2 text-base"
              >
                <span>开始演卦起算</span>
                <span>→</span>
              </button>
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
                {castProgress < 30 && '真太阳时校正，排布农历干支与生辰四柱八字...'}
                {castProgress >= 30 && castProgress < 60 && '梅花易数年月日时起卦，推导本卦变卦...'}
                {castProgress >= 60 && castProgress < 90 && '装配京房六爻纳甲、安世应与六亲旬空...'}
                {castProgress >= 90 && '对齐《周易》384爻原文与流年节气...'}
              </p>
              <div className="w-full bg-[#1a1d26] h-2 rounded-full overflow-hidden max-w-xs mx-auto">
                <div className="bg-gradient-to-r from-[#9e2a2b] to-[#d4af37] h-full transition-all duration-300"
                  style={{ width: `${castProgress}%` }} />
              </div>
            </div>
          </div>
        )}

        {step === 'result' && result && (
          <div className="space-y-8">
            <div className="bg-[#12141a] border border-[#2a2d37] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="text-xs text-[#d4af37] font-mono mb-1">
                  【农历阴历】{result.lunarStr} • 【八字四柱】{result.baziStr}
                </div>
                <div className="text-[11px] text-[#8c8577] mb-2">{result.trueSolarNote}</div>
                <h2 className="text-2xl text-[#f3ece0] font-bold">
                  测算目标：{result.targetYearGanZhi} 运势
                </h2>
              </div>
              <button onClick={() => setStep('input')}
                className="px-4 py-2 bg-[#1a1d26] hover:bg-[#252936] text-[#d4af37] border border-[#d4af37]/30 rounded-lg text-xs">
                ↺ 重新输入
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#12141a] border border-[#d4af37]/40 rounded-2xl p-6 relative">
                <div className="absolute top-4 right-4 text-xs px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#d4af37]">
                  主卦 ({result.originalHex.palace})
                </div>
                <h3 className="text-xl font-bold text-[#f3ece0] mb-1">{result.originalHex.name}</h3>
                <p className="text-xs text-[#a39b8b] mb-4">
                  五行属{result.originalHex.element} • {result.originalHex.category} • 吉凶：【{result.originalHex.luck}】
                </p>
                <LineBars lines={result.originalLines} changingLine={result.changingLine} shi={result.originalHex.shi} />
                <p className="text-xs text-[#c5bcac] leading-relaxed bg-[#1a1d26] p-3 rounded-lg border border-[#2a2d37] mb-2">
                  <strong>卦辞：</strong>{result.originalHex.desc}
                </p>
                <p className="text-xs text-[#a39b8b] leading-relaxed bg-[#1a1d26] p-3 rounded-lg border border-[#2a2d37]">
                  <strong>大象：</strong>{result.originalHex.xiang}
                </p>
              </div>

              <div className="bg-[#12141a] border border-[#2a2d37] rounded-2xl p-6 relative">
                <div className="absolute top-4 right-4 text-xs px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-400">
                  之卦 (变卦)
                </div>
                <h3 className="text-xl font-bold text-[#f3ece0] mb-1">{result.transformedHex.name}</h3>
                <p className="text-xs text-[#a39b8b] mb-4">
                  五行属{result.transformedHex.element} • {result.transformedHex.palace} • 【{result.transformedHex.luck}】
                </p>
                <LineBars lines={result.transformedLines} />
                <p className="text-xs text-[#c5bcac] leading-relaxed bg-[#1a1d26] p-3 rounded-lg border border-[#2a2d37] mb-2">
                  <strong>卦辞：</strong>{result.transformedHex.desc}
                </p>
                <p className="text-xs text-[#a39b8b] leading-relaxed bg-[#1a1d26] p-3 rounded-lg border border-[#2a2d37]">
                  <strong>大象：</strong>{result.transformedHex.xiang}
                </p>
              </div>
            </div>

            <div className="bg-[#12141a] border border-[#9e2a2b]/50 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-[#d4af37] border-b border-[#2a2d37] pb-2 mb-3 flex items-center gap-2">
                <span>☯</span> 发动爻辞详解 (第 {result.changingLine} 爻：{result.changingDetail?.name})
              </h3>
              <p className="text-base text-[#f3ece0] font-bold mb-2">【爻辞】{result.changingDetail?.ci}</p>
              <p className="text-xs text-[#d4af37] mb-3">【小象传】{result.changingDetail?.xiang}</p>
              <p className="text-xs text-[#a39b8b] leading-relaxed bg-[#1a1d26] p-3 rounded-lg border border-[#2a2d37]">
                <strong>机锋解析：</strong>动爻乃吉凶转化之枢纽。目标流年期间，局势将围绕此爻所示之关键节点展开，宜契合爻辞智慧顺势而为。
              </p>
            </div>

            <div className="bg-[#12141a] border border-[#2a2d37] rounded-2xl p-6">
              <h3 className="text-sm font-bold text-[#d4af37] border-b border-[#2a2d37] pb-3 mb-4 flex flex-wrap items-center justify-between gap-2">
                <span>☯ 京房六爻纳甲排盘 (宫属：{result.originalHex.palace})</span>
                <span className="text-xs font-normal text-[#8c8577]">
                  旬空：{result.xunKong[0]}、{result.xunKong[1]}
                </span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#2a2d37] text-[#8c8577]">
                      <th className="py-2">爻位</th>
                      <th className="py-2">纳甲干支</th>
                      <th className="py-2">地支五行</th>
                      <th className="py-2">六亲属性</th>
                      <th className="py-2">世应/空亡</th>
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
                            {item.isShi && <span className="text-[#d4af37] font-bold">【世】</span>}
                            {item.isYing && <span className="text-[#8fb3d9] font-bold">【应】</span>}
                            {isKong && <span className="text-[#65605a]">（空）</span>}
                            {item.lineIndex === result.changingLine && <span className="text-[#9e2a2b]">● 动</span>}
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
                <span>📅 {result.targetYearGanZhi} 十二节气流月运势详析</span>
                <span className="text-xs font-normal text-[#8c8577]">依据节气律吕与卦身生克</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {result.monthlyFortunes.map((m) => (
                  <div key={m.month} className="bg-[#1a1d26] border border-[#2a2d37] p-4 rounded-xl flex items-start gap-4">
                    <div className="bg-[#222632] text-[#d4af37] font-bold text-center p-2 rounded-lg min-w-[50px]">
                      <div className="text-xs">{m.month}月</div>
                      <div className="text-[10px] text-[#8c8577]">{m.element}气</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#f3ece0]">{m.term}</span>
                        <span className="text-[10px] text-[#d4af37]">{m.score}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#d4af37]/10 text-[#d4af37]">{m.status}</span>
                      </div>
                      <p className="text-xs text-[#a39b8b] leading-relaxed">{m.advice}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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
