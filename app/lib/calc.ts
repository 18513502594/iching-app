import { Solar } from "lunar-typescript";
import { TRIGRAMS, STEMS, BRANCHES, findTrigramCode } from "./trigrams";
import { getHexagram, FullHexagram } from "./hexagram-data";
import { buildNajiaLines, NajiaLine, getXunKong } from "./najia";
import { applyTrueSolarTime } from "./geo";

export interface CalcInput {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  birthMinute: number;
  longitude: number;
  isOverseas: boolean;
  gender: "male" | "female";
  targetYear: number;
}

export interface CalcResult {
  solarStr: string;
  lunarStr: string;
  baziStr: string;
  trueSolarNote: string;
  originalHex: FullHexagram;
  originalLines: number[];
  transformedHex: FullHexagram;
  transformedLines: number[];
  changingLine: number;
  changingDetail: { name: string; ci: string; xiang: string };
  najiaLines: NajiaLine[];
  xunKong: [string, string];
  targetYearGanZhi: string;
  monthlyFortunes: MonthlyFortune[];
}

export interface MonthlyFortune {
  month: number;
  term: string;
  element: string;
  status: string;
  score: string;
  advice: string;
}

const MONTH_ELEMENTS = ["木", "木", "土", "火", "火", "土", "金", "金", "土", "水", "水", "土"];
const SOLAR_TERMS = [
  "立春 (正月)", "惊蛰 (二月)", "清明 (三月)", "立夏 (四月)", "芒种 (五月)", "小暑 (六月)",
  "立秋 (七月)", "白露 (八月)", "寒露 (九月)", "立冬 (十月)", "大雪 (十一月)", "小寒 (十二月)",
];

const SHENG: Record<string, string> = { "木": "火", "火": "土", "土": "金", "金": "水", "水": "木" };
const KE: Record<string, string> = { "木": "土", "土": "水", "水": "火", "火": "金", "金": "木" };

function monthElementRelation(monthElem: string, hexElem: string): { status: string; score: string; advice: string } {
  if (monthElem === hexElem) {
    return { status: "旺相得助", score: "★★★★★", advice: "五行同气扶助，事业与人际关系皆有突破契机，宜主动出击。" };
  }
  if (SHENG[monthElem] === hexElem) {
    return { status: "生扶有情", score: "★★★★☆", advice: "月建生扶卦身，诸事顺遂，适合推进重要项目与决策。" };
  }
  if (SHENG[hexElem] === monthElem) {
    return { status: "泄气耗神", score: "★★★☆☆", advice: "卦气外泄，宜以静制动，避免过度消耗精力与资源。" };
  }
  if (KE[monthElem] === hexElem) {
    return { status: "休囚受克", score: "★★☆☆☆", advice: "月建克制卦体，宜守不宜攻，防范决策失误与财务波动。" };
  }
  return { status: "反克得势", score: "★★★★☆", advice: "卦身反制月建，主动权在己，适合排除阻力、推进计划。" };
}

/** 依据出生真太阳时进行梅花易数「年月日时起卦法」并完成完整六爻纳甲排盘 */
export function calculateFortune(input: CalcInput): CalcResult {
  const { birthYear, birthMonth, birthDay, birthHour, birthMinute, longitude, isOverseas, targetYear } = input;

  // 1. 真太阳时校正
  const tst = applyTrueSolarTime(birthHour, birthMinute, longitude, isOverseas);
  const adjustedDay = birthDay + tst.dayOffset;

  const solar = Solar.fromYmdHms(
    birthYear, birthMonth, adjustedDay,
    tst.correctedHour, tst.correctedMinute, 0
  );
  const lunar = solar.getLunar();
  const bazi = lunar.getEightChar();

  const offsetAbs = Math.abs(Math.round(tst.offsetMinutes));
  const trueSolarNote = offsetAbs < 1
    ? "出生地经度接近标准时区中央经线，真太阳时校正可忽略。"
    : `出生地经度校正：钟表时间${tst.offsetMinutes > 0 ? "加" : "减"} ${offsetAbs} 分钟得真太阳时，用于确定精确时辰。`;

  // 2. 梅花易数·年月日时起卦法（以校正后的农历年支、月、日、时支起卦）
  const yearBranchNum = lunar.getYearZhiIndex() + 1; // 子=1...亥=12
  const lunarMonth = Math.abs(lunar.getMonth());
  const lunarDay = lunar.getDay();
  const hourBranchNum = lunar.getTimeZhiIndex() + 1;

  let upperCode = (yearBranchNum + lunarMonth + lunarDay) % 8;
  if (upperCode === 0) upperCode = 8;

  let lowerCode = (yearBranchNum + lunarMonth + lunarDay + hourBranchNum) % 8;
  if (lowerCode === 0) lowerCode = 8;

  let changingLine = (yearBranchNum + lunarMonth + lunarDay + hourBranchNum) % 6;
  if (changingLine === 0) changingLine = 6;

  // 3. 本卦、变卦
  const originalHex = getHexagram(upperCode, lowerCode);
  const lowerTri = TRIGRAMS[lowerCode];
  const upperTri = TRIGRAMS[upperCode];
  const originalLines = [...lowerTri.lines, ...upperTri.lines];

  const transformedLines = [...originalLines];
  transformedLines[changingLine - 1] = transformedLines[changingLine - 1] === 1 ? 0 : 1;

  const transLowerCode = findTrigramCode(transformedLines.slice(0, 3));
  const transUpperCode = findTrigramCode(transformedLines.slice(3, 6));
  const transformedHex = getHexagram(transUpperCode, transLowerCode);

  // 4. 京房纳甲装卦（六亲、世应）
  const najiaLines = buildNajiaLines(upperCode, lowerCode, originalHex.element, originalHex.shi);

  // 5. 旬空（以出生日柱定旬）
  const dayGanZhi = bazi.getDay(); // 如 "甲子"
  const dayStemIdx = STEMS.indexOf(dayGanZhi[0]);
  const dayBranchIdx = BRANCHES.indexOf(dayGanZhi[1]);
  const xunKong = getXunKong(dayStemIdx, dayBranchIdx);

  // 6. 目标流年干支
  const targetSolar = Solar.fromYmd(targetYear, 6, 1);
  const targetLunar = targetSolar.getLunar();
  const targetYearGanZhi = `${targetLunar.getYearInGanZhi()} (${targetLunar.getYearShengXiao()})年`;

  // 7. 十二节气流月运势：以本卦宫五行为体，与月建五行生克比对
  const monthlyFortunes: MonthlyFortune[] = SOLAR_TERMS.map((term, index) => {
    const monthElement = MONTH_ELEMENTS[index];
    const { status, score, advice } = monthElementRelation(monthElement, originalHex.element);
    return { month: index + 1, term, element: monthElement, status, score, advice };
  });

  return {
    solarStr: `${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日 ${solar.getHour()}:${String(solar.getMinute()).padStart(2, "0")}（真太阳时）`,
    lunarStr: `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    baziStr: `${bazi.getYear()} ${bazi.getMonth()} ${bazi.getDay()} ${bazi.getTime()}`,
    trueSolarNote,
    originalHex,
    originalLines,
    transformedHex,
    transformedLines,
    changingLine,
    changingDetail: originalHex.lines[changingLine - 1],
    najiaLines,
    xunKong,
    targetYearGanZhi,
    monthlyFortunes,
  };
}
