// --- 八卦基础数据 ---
// 卦序：1乾 2兑 3离 4震 5巽 6坎 7艮 8坤（先天八卦数）
// lines 为自下而上（初爻→上爻）的阴阳排列，1=阳爻 0=阴爻
//
// 【重要修正说明】
// 原项目代码中 震(4)、艮(7) 的 lines 互相搞反了，且 巽(5) 与 兑(2) 使用了完全相同的
// [1,1,0] 数组（应为 [0,1,1]）。这会导致"变卦"查找函数 findTrigramCode 在变爻结果
// 命中巽卦时，永远误判成兑卦，本次重写已修正。

export interface TrigramInfo {
  code: number;
  name: string;
  symbol: string;
  lines: number[]; // 自下而上
  element: string; // 五行
  nature: string; // 卦象自然物
  family: string; // 六亲身份（乾坤为父母，其余六子）
  // 京房纳甲：内卦（本卦作下卦时）与外卦（本卦作上卦时）所配地支，均自初爻→上爻（即数组[0]=第1爻）
  branchInner: string[];
  branchOuter: string[];
  stemInner: string; // 作下卦时所纳天干
  stemOuter: string; // 作上卦时所纳天干
}

export const TRIGRAMS: Record<number, TrigramInfo> = {
  1: { code: 1, name: "乾", symbol: "☰", lines: [1, 1, 1], element: "金", nature: "天", family: "父",
    branchInner: ["子", "寅", "辰"], branchOuter: ["午", "申", "戌"], stemInner: "甲", stemOuter: "壬" },
  2: { code: 2, name: "兑", symbol: "☱", lines: [1, 1, 0], element: "金", nature: "泽", family: "少女",
    branchInner: ["巳", "卯", "丑"], branchOuter: ["亥", "酉", "未"], stemInner: "丁", stemOuter: "丁" },
  3: { code: 3, name: "离", symbol: "☲", lines: [1, 0, 1], element: "火", nature: "火", family: "中女",
    branchInner: ["卯", "丑", "亥"], branchOuter: ["酉", "未", "巳"], stemInner: "己", stemOuter: "己" },
  4: { code: 4, name: "震", symbol: "☳", lines: [1, 0, 0], element: "木", nature: "雷", family: "长男",
    branchInner: ["子", "寅", "辰"], branchOuter: ["午", "申", "戌"], stemInner: "庚", stemOuter: "庚" },
  5: { code: 5, name: "巽", symbol: "☴", lines: [0, 1, 1], element: "木", nature: "风", family: "长女",
    branchInner: ["丑", "亥", "酉"], branchOuter: ["未", "巳", "卯"], stemInner: "辛", stemOuter: "辛" },
  6: { code: 6, name: "坎", symbol: "☵", lines: [0, 1, 0], element: "水", nature: "水", family: "中男",
    branchInner: ["寅", "辰", "午"], branchOuter: ["申", "戌", "子"], stemInner: "戊", stemOuter: "戊" },
  7: { code: 7, name: "艮", symbol: "☶", lines: [0, 0, 1], element: "土", nature: "山", family: "少男",
    branchInner: ["辰", "午", "申"], branchOuter: ["戌", "子", "寅"], stemInner: "丙", stemOuter: "丙" },
  8: { code: 8, name: "坤", symbol: "☷", lines: [0, 0, 0], element: "土", nature: "地", family: "母",
    branchInner: ["未", "巳", "卯"], branchOuter: ["丑", "亥", "酉"], stemInner: "乙", stemOuter: "癸" },
};

// 地支五行
export const BRANCH_ELEMENT: Record<string, string> = {
  "子": "水", "亥": "水", "寅": "木", "卯": "木", "巳": "火", "午": "火",
  "申": "金", "酉": "金", "辰": "土", "戌": "土", "丑": "土", "未": "土",
};

// 天干、地支序列（用于流年、旬空等计算）
export const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
export const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 五行生克断六亲：以「宫五行」为我，判断爻支五行与我的生克关系
// 同我者兄弟，我生者子孙，生我者父母，克我者官鬼，我克者妻财
const SHENG: Record<string, string> = { "木": "火", "火": "土", "土": "金", "金": "水", "水": "木" };
const KE: Record<string, string> = { "木": "土", "土": "水", "水": "火", "火": "金", "金": "木" };

export function elementRelation(palaceElem: string, targetElem: string): string {
  if (palaceElem === targetElem) return "兄弟";
  if (SHENG[palaceElem] === targetElem) return "子孙";
  if (SHENG[targetElem] === palaceElem) return "父母";
  if (KE[palaceElem] === targetElem) return "妻财";
  if (KE[targetElem] === palaceElem) return "官鬼";
  return "兄弟";
}

// 根据六爻阴阳数组（自下而上3位）反查卦序号
export function findTrigramCode(lines: number[]): number {
  for (const key in TRIGRAMS) {
    if (TRIGRAMS[key].lines.join("") === lines.join("")) return parseInt(key);
  }
  return 1;
}
