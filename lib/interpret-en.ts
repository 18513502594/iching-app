import { FullHexagram } from "./hexagram-data";
import { getHexNameEn, ELEMENT_EN, LUCK_EN } from "./hexagram-names-en";
import { MonthlyFortune } from "./calc";

const CATEGORY_NOTE_EN: Record<string, string> = {
  "本宫": "a foundational hexagram of its palace, indicating a matter close to its root nature",
  "一世": "a first-stage transformation, suggesting change is still near its starting point",
  "二世": "a second-stage transformation, suggesting the situation is gaining momentum",
  "三世": "a third-stage transformation, marking a turning point where the outcome is not yet fixed",
  "四世": "a fourth-stage transformation, suggesting the matter is now largely out of its original context",
  "五世": "a fifth-stage transformation, close to full change and nearing resolution",
  "游魂": "a 'wandering soul' hexagram, associated with restlessness, travel, or ideas not yet settled",
  "归魂": "a 'returning soul' hexagram, associated with matters coming back full circle or reconciliations",
};

const ELEMENT_TRAIT_EN: Record<string, string> = {
  "金": "clarity, decisiveness, and structure — but can turn rigid or severe if unchecked",
  "木": "growth, flexibility, and expansion — but can overextend without enough grounding",
  "水": "adaptability, depth, and quiet momentum — but can drift or lose direction",
  "火": "visibility, passion, and quick transformation — but can burn out or provoke conflict",
  "土": "stability, patience, and accumulation — but can become inertia if overdone",
};

function starCount(score: string): number {
  return (score.match(/★/g) || []).length;
}

const PALACE_PINYIN_EN: Record<string, string> = {
  "乾": "Qian", "兑": "Dui", "离": "Li", "震": "Zhen", "巽": "Xun", "坎": "Kan", "艮": "Gen", "坤": "Kun",
};

export function palaceLabelEn(palace: string): string {
  const char = palace.replace("宫", "");
  return `${PALACE_PINYIN_EN[char] ?? char} Palace`;
}

function pickBestWorstMonths(months: MonthlyFortune[]) {
  const sorted = [...months].sort((a, b) => starCount(b.score) - starCount(a.score));
  return { best: sorted[0], worst: sorted[sorted.length - 1] };
}

/** 生成英文版整体运势解读（免费层：仅一句话摘要） */
export function generateFreeSummaryEn(hex: FullHexagram): string {
  const nameEn = getHexNameEn(hex.upperCode, hex.lowerCode);
  const luck = LUCK_EN[hex.luck] ?? { label: "Neutral", tone: "neutral" };
  return `Your cast hexagram is ${nameEn.pinyin} (${nameEn.gloss}) — a reading generally classed as "${luck.label}." A more specific, line-by-line forecast for your target year is available in the full reading.`;
}

/** 生成英文版完整解读（付费层：结合宫位、五行、动爻、流月最佳/最差月份） */
export function generateFullReadingEn(hex: FullHexagram, changingLineIndex: number, months: MonthlyFortune[], targetYearLabel: string): string {
  const nameEn = getHexNameEn(hex.upperCode, hex.lowerCode);
  const elementEn = ELEMENT_EN[hex.element] ?? hex.element;
  const trait = ELEMENT_TRAIT_EN[hex.element] ?? "";
  const categoryNote = CATEGORY_NOTE_EN[hex.category] ?? "";
  const { best, worst } = pickBestWorstMonths(months);

  return [
    `Your primary hexagram, ${nameEn.pinyin} (${nameEn.gloss}), belongs to the ${palaceLabelEn(hex.palace)} and carries the elemental quality of ${elementEn} — a force associated with ${trait}.`,
    `Structurally, this is ${categoryNote}, which frames how quickly the situation described by this hexagram is likely to evolve during ${targetYearLabel}.`,
    `The moving line falls at position ${changingLineIndex} of 6 — classical I Ching theory treats the moving line as the single most decisive detail in a reading, since it marks precisely where change is entering the situation. Read its line text (below) as the specific pivot point of your year, not just general background.`,
    `Across the twelve solar-term months of ${targetYearLabel}, ${best.term.split(" ")[0]} stands out as your most favorably aspected month (${best.status}), while ${worst.term.split(" ")[0]} is comparatively the most challenging (${worst.status}) — worth extra caution around major decisions in that window.`,
  ].join(" ");
}
