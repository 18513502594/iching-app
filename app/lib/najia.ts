import { TRIGRAMS, BRANCH_ELEMENT, elementRelation } from "./trigrams";

// --- 京房八宫卦序：乾兑离震巽坎艮坤，每宫8卦 ---
// 每宫内部固定顺序：[本宫, 一世, 二世, 三世, 四世, 五世, 游魂, 归魂]
// 数组元素为 [上卦code, 下卦code]，已与《京氏易传》通行的八宫卦序逐宫核对
const PALACES: { host: string; element: string; members: [number, number][] }[] = [
  { host: "乾", element: "金", members: [[1,1],[1,5],[1,7],[1,8],[5,8],[7,8],[3,8],[3,1]] },
  { host: "兑", element: "金", members: [[2,2],[2,6],[2,8],[2,7],[6,7],[8,7],[4,7],[4,2]] },
  { host: "离", element: "火", members: [[3,3],[3,7],[3,5],[3,6],[7,6],[5,6],[1,6],[1,3]] },
  { host: "震", element: "木", members: [[4,4],[4,8],[4,6],[4,5],[8,5],[6,5],[2,5],[2,4]] },
  { host: "巽", element: "木", members: [[5,5],[5,1],[5,3],[5,4],[1,4],[3,4],[7,4],[7,5]] },
  { host: "坎", element: "水", members: [[6,6],[6,2],[6,4],[6,3],[2,3],[4,3],[8,3],[8,6]] },
  { host: "艮", element: "土", members: [[7,7],[7,3],[7,1],[7,2],[3,2],[1,2],[5,2],[5,7]] },
  { host: "坤", element: "土", members: [[8,8],[8,4],[8,2],[8,1],[4,1],[2,1],[6,1],[6,8]] },
];
const CATEGORIES = ["本宫", "一世", "二世", "三世", "四世", "五世", "游魂", "归魂"] as const;
export type HexCategory = typeof CATEGORIES[number];
const SHI_BY_CATEGORY: Record<HexCategory, number> = {
  "本宫": 6, "一世": 1, "二世": 2, "三世": 3, "四世": 4, "五世": 5, "游魂": 4, "归魂": 3,
};

// 标准六十四卦卦名对照表（通行本卦名），key: "上卦code,下卦code"
export const HEX_NAMES: Record<string, string> = {
  "1,1": "乾为天", "1,2": "天泽履", "1,3": "天火同人", "1,4": "天雷无妄",
  "1,5": "天风姤", "1,6": "天水讼", "1,7": "天山遁", "1,8": "天地否",
  "2,1": "泽天夬", "2,2": "兑为泽", "2,3": "泽火革", "2,4": "泽雷随",
  "2,5": "泽风大过", "2,6": "泽水困", "2,7": "泽山咸", "2,8": "泽地萃",
  "3,1": "火天大有", "3,2": "火泽睽", "3,3": "离为火", "3,4": "火雷噬嗑",
  "3,5": "火风鼎", "3,6": "火水未济", "3,7": "火山旅", "3,8": "火地晋",
  "4,1": "雷天大壮", "4,2": "雷泽归妹", "4,3": "雷火丰", "4,4": "震为雷",
  "4,5": "雷风恒", "4,6": "雷水解", "4,7": "雷山小过", "4,8": "雷地豫",
  "5,1": "风天小畜", "5,2": "风泽中孚", "5,3": "风火家人", "5,4": "风雷益",
  "5,5": "巽为风", "5,6": "风水涣", "5,7": "风山渐", "5,8": "风地观",
  "6,1": "水天需", "6,2": "水泽节", "6,3": "水火既济", "6,4": "水雷屯",
  "6,5": "水风井", "6,6": "坎为水", "6,7": "水山蹇", "6,8": "水地比",
  "7,1": "山天大畜", "7,2": "山泽损", "7,3": "山火贲", "7,4": "山雷颐",
  "7,5": "山风蛊", "7,6": "山水蒙", "7,7": "艮为山", "7,8": "山地剥",
  "8,1": "地天泰", "8,2": "地泽临", "8,3": "地火明夷", "8,4": "地雷复",
  "8,5": "地风升", "8,6": "地水师", "8,7": "地山谦", "8,8": "坤为地",
};

export interface HexMeta {
  name: string;
  palace: string;
  element: string;
  shi: number;
  category: HexCategory;
}

const HEX_META: Record<string, HexMeta> = {};
for (const palace of PALACES) {
  palace.members.forEach(([upper, lower], idx) => {
    const key = `${upper},${lower}`;
    const category = CATEGORIES[idx];
    HEX_META[key] = {
      name: HEX_NAMES[key],
      palace: `${palace.host}宫`,
      element: palace.element,
      shi: SHI_BY_CATEGORY[category],
      category,
    };
  });
}

export function getHexMeta(upper: number, lower: number): HexMeta {
  const key = `${upper},${lower}`;
  return HEX_META[key] ?? { name: HEX_NAMES[key] ?? "未知卦", palace: "未知宫", element: "土", shi: 3, category: "三世" };
}

// --- 京房纳甲装卦：六爻天干地支、五行、六亲、世应 ---
export interface NajiaLine {
  lineIndex: number; // 1-6，自下而上
  stem: string;
  branch: string;
  elem: string;
  relative: string; // 六亲
  isShi: boolean;
  isYing: boolean;
}

export function buildNajiaLines(upperCode: number, lowerCode: number, palaceElement: string, shi: number): NajiaLine[] {
  const lowerTri = TRIGRAMS[lowerCode];
  const upperTri = TRIGRAMS[upperCode];
  const ying = ((shi + 2) % 6) + 1;

  const lines: NajiaLine[] = [];
  for (let i = 0; i < 3; i++) {
    const branch = lowerTri.branchInner[i];
    const elem = BRANCH_ELEMENT[branch];
    lines.push({
      lineIndex: i + 1, branch, elem,
      relative: elementRelation(palaceElement, elem),
      stem: lowerTri.stemInner,
      isShi: i + 1 === shi, isYing: i + 1 === ying,
    });
  }
  for (let i = 0; i < 3; i++) {
    const branch = upperTri.branchOuter[i];
    const elem = BRANCH_ELEMENT[branch];
    lines.push({
      lineIndex: i + 4, branch, elem,
      relative: elementRelation(palaceElement, elem),
      stem: upperTri.stemOuter,
      isShi: i + 4 === shi, isYing: i + 4 === ying,
    });
  }
  return lines;
}

// --- 旬空（空亡）：按日柱所在的六十甲子"旬"查表 ---
const XUN_KONG_TABLE: { branchStart: number; kong: [string, string] }[] = [
  { branchStart: 0, kong: ["戌", "亥"] },  // 甲子旬
  { branchStart: 10, kong: ["申", "酉"] }, // 甲戌旬
  { branchStart: 8, kong: ["午", "未"] },  // 甲申旬
  { branchStart: 6, kong: ["辰", "巳"] },  // 甲午旬
  { branchStart: 4, kong: ["寅", "卯"] },  // 甲辰旬
  { branchStart: 2, kong: ["子", "丑"] },  // 甲寅旬
];

/** 输入日柱天干序号(0-9,甲=0)、地支序号(0-11,子=0)，返回空亡的两个地支 */
export function getXunKong(stemIdx: number, branchIdx: number): [string, string] {
  const offset = (branchIdx - stemIdx + 12) % 12;
  const entry = XUN_KONG_TABLE.find(e => e.branchStart === offset);
  return entry ? entry.kong : ["戌", "亥"];
}
