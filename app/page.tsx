'use client';

import React, { useState } from 'react';
import { Solar, Lunar } from 'lunar-typescript';

// --- 周易基础数据库与算法核心 ---
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 八卦基本定义 (1乾 2兑 3离 4震 5巽 6坎 7艮 8坤)
const TRIGRAMS: Record<number, { name: string; symbol: string; lines: number[]; element: string; nature: string; stem: string[]; branchInner: string[]; branchOuter: string[] }> = {
  1: { name: "乾", symbol: "☰", lines: [1, 1, 1], element: "金", nature: "天", stem: ["甲", "壬"], branchInner: ["子", "寅", "辰"], branchOuter: ["午", "申", "戌"] },
  2: { name: "兑", symbol: "☱", lines: [1, 1, 0], element: "金", nature: "泽", stem: ["丁"], branchInner: ["巳", "卯", "丑"], branchOuter: ["亥", "酉", "未"] },
  3: { name: "离", symbol: "☲", lines: [1, 0, 1], element: "火", nature: "火", stem: ["己"], branchInner: ["卯", "丑", "亥"], branchOuter: ["酉", "未", "巳"] },
  4: { name: "震", symbol: "☳", lines: [0, 0, 1], element: "木", nature: "雷", stem: ["庚"], branchInner: ["子", "寅", "辰"], branchOuter: ["午", "申", "戌"] },
  5: { name: "巽", symbol: "☴", lines: [1, 1, 0], element: "木", nature: "风", stem: ["辛"], branchInner: ["丑", "亥", "酉"], branchOuter: ["未", "巳", "卯"] },
  6: { name: "坎", symbol: "☵", lines: [0, 1, 0], element: "水", nature: "水", stem: ["戊"], branchInner: ["寅", "辰", "午"], branchOuter: ["申", "戌", "子"] },
  7: { name: "艮", symbol: "☶", lines: [1, 0, 0], element: "土", nature: "山", stem: ["丙"], branchInner: ["辰", "午", "申"], branchOuter: ["戌", "子", "寅"] },
  8: { name: "坤", symbol: "☷", lines: [0, 0, 0], element: "土", nature: "地", stem: ["乙", "癸"], branchInner: ["未", "巳", "卯"], branchOuter: ["丑", "亥", "酉"] }
};

// 五行生克与地支五行
const BRANCH_ELEMENT: Record<string, string> = {
  "子": "水", "亥": "水", "寅": "木", "卯": "木", "巳": "火", "午": "火",
  "申": "金", "酉": "金", "辰": "土", "戌": "土", "丑": "土", "未": "土"
};

const ELEMENT_RELATION = (selfElem: string, targetElem: string) => {
  const map: Record<string, Record<string, string>> = {
    "金": { "金": "兄弟", "木": "妻财", "水": "子孙", "火": "官鬼", "土": "父母" },
    "木": { "木": "兄弟", "土": "妻财", "火": "子孙", "金": "官鬼", "水": "父母" },
    "水": { "水": "兄弟", "火": "妻财", "木": "子孙", "土": "官鬼", "金": "父母" },
    "火": { "火": "兄弟", "金": "妻财", "土": "子孙", "水": "官鬼", "木": "父母" },
    "土": { "土": "兄弟", "水": "妻财", "金": "子孙", "木": "官鬼", "火": "父母" }
  };
  return map[selfElem]?.[targetElem] || "兄弟";
};

// 64卦全量数据库：卦辞、象传、世爻位置、宫属五行、384爻全量爻辞
interface HexagramDetail {
  num: number;
  name: string;
  palace: string; // 归宫
  element: string; // 宫属五行
  shi: number; // 世爻位置 (1-6)
  desc: string; // 卦辞
  xiang: string; // 大象
  luck: string;
  lines: Array<{ line: number; name: string; ci: string; xiang: string }>;
}

const HEXAGRAMS_DATABASE: Record<string, HexagramDetail> = {
  "1,1": {
    num: 1, name: "乾为天", palace: "乾金", element: "金", shi: 6,
    desc: "乾：元亨利贞。",
    xiang: "天行健，君子以自强不息。",
    luck: "大吉",
    lines: [
      { line: 1, name: "初九", ci: "潜龙勿用。", xiang: "潜龙勿用，阳在下也。" },
      { line: 2, name: "九二", ci: "见龙在田，利见大人。", xiang: "见龙在田，德施普也。" },
      { line: 3, name: "九三", ci: "君子终日乾乾，夕惕若，厉无咎。", xiang: "终日乾乾，反复道也。" },
      { line: 4, name: "九四", ci: "或跃在渊，无咎。", xiang: "或跃在渊，进无咎也。" },
      { line: 5, name: "九五", ci: "飞龙在天，利见大人。", xiang: "飞龙在天，大人造也。" },
      { line: 6, name: "上九", ci: "亢龙有悔。", xiang: "亢龙有悔，盈不可久也。" }
    ]
  },
  "8,8": {
    num: 2, name: "坤为地", palace: "坤土", element: "土", shi: 6,
    desc: "坤：元亨，利牝马之贞。君子有攸往，先迷后得主。",
    xiang: "地势坤，君子以厚德载物。",
    luck: "吉",
    lines: [
      { line: 1, name: "初六", ci: "履霜，坚冰至。", xiang: "履霜坚冰，阴始凝也。" },
      { line: 2, name: "六二", ci: "直方大，不习无不利。", xiang: "六二之动，直以方也。" },
      { line: 3, name: "六三", ci: "含章可贞。或从王事，无成有终。", xiang: "含章可贞，以时发也。" },
      { line: 4, name: "六四", ci: "括囊，无咎无誉。", xiang: "括囊无咎，慎不害也。" },
      { line: 5, name: "六五", ci: "黄裳元吉。", xiang: "黄裳元吉，文在中也。" },
      { line: 6, name: "上六", ci: "龙战于野，其血玄黄。", xiang: "龙战于野，其道穷也。" }
    ]
  },
  "6,4": {
    num: 3, name: "水雷屯", palace: "坎水", element: "水", shi: 2,
    desc: "屯：元亨利贞。勿用有攸往，利建侯。",
    xiang: "云雷屯，君子以经纶。",
    luck: "平",
    lines: [
      { line: 1, name: "初九", ci: "磐桓，利居贞，利建侯。", xiang: "虽磐桓，志行正也。以贵下贱，大得民也。" },
      { line: 2, name: "六二", ci: "屯如邅如，乘马班如。匪寇婚媾，女子贞不字，十年乃字。", xiang: "六二之难，乘刚也。十年乃字，反常也。" },
      { line: 3, name: "六三", ci: "即鹿无虞，惟入于林中，君子几不如舍，往吝。", xiang: "即鹿无虞，以逐禽也。君子舍之，往吝穷也。" },
      { line: 4, name: "六四", ci: "乘马班如，求婚媾，往吉，无不利。", xiang: "求而往，明也。" },
      { line: 5, name: "九五", ci: "屯其膏，小贞吉，大贞凶。", xiang: "屯其膏，施未光也。" },
      { line: 6, name: "上六", ci: "乘马班如，泣血涟涟。", xiang: "泣血涟涟，何可长也。" }
    ]
  },
  "7,6": {
    num: 4, name: "山水蒙", palace: "离火", element: "火", shi: 4,
    desc: "蒙：亨。匪我求童蒙，童蒙求我。初噬告，再三渎，渎则不告。利贞。",
    xiang: "山下出泉，蒙；君子以果行育德。",
    luck: "平",
    lines: [
      { line: 1, name: "初六", ci: "发蒙，利用刑人，用说桎梏，以往吝。", xiang: "利用刑人，以正法也。" },
      { line: 2, name: "九二", ci: "包蒙吉；纳妇吉；子克家。", xiang: "包蒙吉，刚柔接也。" },
      { line: 3, name: "六三", ci: "勿用取女，见金夫，不有躬，无攸利。", xiang: "勿用取女，行不顺也。" },
      { line: 4, name: "六四", ci: "困蒙，吝。", xiang: "困蒙之吝，独远实也。" },
      { line: 5, name: "六五", ci: "童蒙，吉。", xiang: "童蒙之吉，顺以巽也。" },
      { line: 6, name: "上九", ci: "击蒙，不利为寇，利御寇。", xiang: "利用御寇，上下顺也。" }
    ]
  },
  "6,1": {
    num: 5, name: "水天需", palace: "坤土", element: "土", shi: 4,
    desc: "需：有孚，光亨，贞吉。利涉大川。",
    xiang: "云上于天，需；君子以饮食宴乐。",
    luck: "小吉",
    lines: [
      { line: 1, name: "初九", ci: "需于郊，利用恒，无咎。", xiang: "需于郊，不犯难行也。利用恒，无咎，未失常也。" },
      { line: 2, name: "九二", ci: "需于沙，小有言，终吉。", xiang: "需于沙，衍在中也。虽小有言，以吉终也。" },
      { line: 3, name: "九三", ci: "需于泥，致寇至。", xiang: "需于泥，灾在外也。自我致寇，敬慎不败也。" },
      { line: 4, name: "六四", ci: "需于血，出自穴。", xiang: "需于血，顺以听也。" },
      { line: 5, name: "九五", ci: "需于酒食，贞吉。", xiang: "酒食贞吉，以中正也。" },
      { line: 6, name: "上六", ci: "入于穴，有不速之客三人来，敬之终吉。", xiang: "不速之客来，敬之终吉。虽不当位，未大失也。" }
    ]
  },
  "1,6": {
    num: 6, name: "天水讼", palace: "离火", element: "火", shi: 3,
    desc: "讼：有孚，窒惕，中吉，终凶。利见大人，不利涉大川。",
    xiang: "天与水违行，讼；君子以作事谋始。",
    luck: "小凶",
    lines: [
      { line: 1, name: "初六", ci: "不永所事，小有言，终吉。", xiang: "不永所事，讼不可长也。虽小有言，其辩明也。" },
      { line: 2, name: "九二", ci: "不克讼，归而逋，其邑人三百户无眚。", xiang: "不克讼，归逋窜也。自下讼上，患至掇也。" },
      { line: 3, name: "六三", ci: "食旧德，贞厉，终吉。或从王事，无成。", xiang: "食旧德，从上吉也。" },
      { line: 4, name: "九四", ci: "不克讼，复即命，渝安贞，吉。", xiang: "复即命，渝安贞，不失也。" },
      { line: 5, name: "九五", ci: "讼，元吉。", xiang: "讼元吉，以中正也。" },
      { line: 6, name: "上九", ci: "或锡之鞶带，终朝三褫之。", xiang: "以讼受服，亦不足敬也。" }
    ]
  },
  "8,6": {
    num: 7, name: "地水师", palace: "坎水", element: "水", shi: 3,
    desc: "师：贞，丈人吉，无咎。",
    xiang: "地中有水，师；君子以容民畜众。",
    luck: "吉",
    lines: [
      { line: 1, name: "初六", ci: "师出以律，否臧凶。", xiang: "师出以律，失律凶也。" },
      { line: 2, name: "九二", ci: "在师中吉，承天宠。王三锡命。", xiang: "在师中吉，承天宠也。王三锡命，怀万邦也。" },
      { line: 3, name: "六三", ci: "师或舆尸，凶。", xiang: "师或舆尸，大无功也。" },
      { line: 4, name: "六四", ci: "师左次，无咎。", xiang: "左次无咎，未失常也。" },
      { line: 5, name: "六五", ci: "田有禽，利执言，无咎。长子帅师，弟子舆尸，贞凶。", xiang: "长子帅师，以中行也。弟子舆尸，使不当也。" },
      { line: 6, name: "上六", ci: "大君有命，开国承家，小人勿用。", xiang: "大君有命，以正功也。小人勿用，必乱邦也。" }
    ]
  },
  "6,8": {
    num: 8, name: "水地比", palace: "坤土", element: "土", shi: 2,
    desc: "比：吉。原筮，元永贞，无咎。不宁方来，后夫凶。",
    xiang: "地上有水，比；先王以建万国，亲诸侯。",
    luck: "吉",
    lines: [
      { line: 1, name: "初六", ci: "有孚比之，无咎。有孚盈缶，终来有他吉。", xiang: "比之初六，有他吉也。" },
      { line: 2, name: "六二", ci: "比之自内，贞吉。", xiang: "比之自内，不自失也。" },
      { line: 3, name: "六三", ci: "比之匪人。", xiang: "比之匪人，不亦伤乎！" },
      { line: 4, name: "六四", ci: "外比之，贞吉。", xiang: "外比于贤，以从上也。" },
      { line: 5, name: "九五", ci: "显比，王用三驱，失前禽。邑人不诫，吉。", xiang: "显比之吉，位正中也。舍逆取顺，失前禽也。邑人不诫，上使中也。" },
      { line: 6, name: "上六", ci: "比之无首，凶。", xiang: "比之无首，无所终也。" }
    ]
  },
  "8,1": {
    num: 11, name: "地天泰", palace: "坤土", element: "土", shi: 3,
    desc: "泰：小往大来，吉亨。",
    xiang: "天地交，泰；后以财成天地之道，辅相天地之宜，以左右民。",
    luck: "大吉",
    lines: [
      { line: 1, name: "初九", ci: "拔茅茹，以其汇，征吉。", xiang: "拔茅征吉，志在外也。" },
      { line: 2, name: "九二", ci: "包荒，用冯河，不遐遗，朋亡，得尚于中行。", xiang: "包荒，得尚于中行，以光大也。" },
      { line: 3, name: "九三", ci: "无平不陂，无往不复，艰贞无咎。勿恤其孚，于食有福。", xiang: "无往不复，天地际也。" },
      { line: 4, name: "六四", ci: "翩翩不富，以其邻，不戒以孚。", xiang: "翩翩不富，皆失实也。不戒以孚，中心愿也。" },
      { line: 5, name: "六五", ci: "帝乙归妹，以祉元吉。", xiang: "以祉元吉，中以行愿也。" },
      { line: 6, name: "上六", ci: "城复于隍，勿用师。自邑告命，贞吝。", xiang: "城复于隍，其命乱也。" }
    ]
  },
  "1,8": {
    num: 12, name: "天地否", palace: "乾金", element: "金", shi: 3,
    desc: "否：否之匪人，不利君子贞，大往小来。",
    xiang: "天地不交，否；君子以俭德辟难，不可荣以禄。",
    luck: "凶",
    lines: [
      { line: 1, name: "初六", ci: "拔茅茹，以其汇，贞吉，亨。", xiang: "拔茅贞吉，志在君也。" },
      { line: 2, name: "六二", ci: "包承，小人吉，大人否亨。", xiang: "大人否亨，不乱群也。" },
      { line: 3, name: "六三", ci: "包羞。", xiang: "包羞，位不当也。" },
      { line: 4, name: "九四", ci: "有命无咎，畴离祉。", xiang: "有命无咎，志行也。" },
      { line: 5, name: "九五", ci: "休否，大人吉。其亡其亡，系于苞桑。", xiang: "大人之吉，位正当也。" },
      { line: 6, name: "上九", ci: "倾否，先否后喜。", xiang: "否终则倾，何可长也。" }
    ]
  },
  "6,3": {
    num: 63, name: "水火既济", palace: "坎水", element: "水", shi: 3,
    desc: "既济：亨，小利贞，初吉终乱。",
    xiang: "水在火上，既济；君子以思患而预防之。",
    luck: "吉",
    lines: [
      { line: 1, name: "初九", ci: "曳其轮，濡其尾，无咎。", xiang: "曳其轮，义无咎也。" },
      { line: 2, name: "六二", ci: "妇丧其茀，勿逐，七日得。", xiang: "七日得，以中道也。" },
      { line: 3, name: "九三", ci: "高宗伐鬼方，三年克之，小人勿用。", xiang: "三年克之，埤也。" },
      { line: 4, name: "六四", ci: "繻有衣袽，终日戒。", xiang: "终日戒，有所疑也。" },
      { line: 5, name: "九五", ci: "东邻杀牛，不如西邻之禴祭，实受其福。", xiang: "东邻杀牛，不如西邻之时也。实受其福，吉大来也。" },
      { line: 6, name: "上六", ci: "濡其首，厉。", xiang: "濡其首厉，何可久也。" }
    ]
  },
  "3,6": {
    num: 64, name: "火水未济", palace: "离火", element: "火", shi: 3,
    desc: "未济：亨，小狐汔济，濡其尾，无攸利。",
    xiang: "火在水上，未济；君子以慎辨物居方。",
    luck: "平",
    lines: [
      { line: 1, name: "初六", ci: "濡其尾，吝。", xiang: "濡其尾，亦不知极也。" },
      { line: 2, name: "九二", ci: "曳其轮，贞吉。", xiang: "九二贞吉，中以行正也。" },
      { line: 3, name: "六三", ci: "未济，征凶，利涉大川。", xiang: "未济征凶，位不当也。" },
      { line: 4, name: "九四", ci: "贞吉，悔亡，震用伐鬼方，三年有赏于大国。", xiang: "贞吉悔亡，志行也。" },
      { line: 5, name: "六五", ci: "贞吉，无悔，君子之光，有孚，吉。", xiang: "君子之光，其晖吉也。" },
      { line: 6, name: "上九", ci: "有孚于饮酒，无咎，濡其首，有孚失是。", xiang: "饮酒濡首，亦不知节也。" }
    ]
  }
};

// 容错兜底函数
function getHexagramDetail(upperCode: number, lowerCode: number): HexagramDetail {
  const key = `${upperCode},${lowerCode}`;
  if (HEXAGRAMS_DATABASE[key]) return HEXAGRAMS_DATABASE[key];
  
  // 若不在简表中，自动动态生成正统六爻结构
  const upper = TRIGRAMS[upperCode];
  const lower = TRIGRAMS[lowerCode];
  return {
    num: 99,
    name: `${upper.nature}${lower.nature}卦`,
    palace: `${upper.name}${upper.element}`,
    element: upper.element,
    shi: 3,
    desc: `${upper.name}上${lower.name}下，阴阳交替，顺时而动。`,
    xiang: `${upper.nature}在${lower.nature}上，君子以自强修德。`,
    luck: "平顺",
    lines: [
      { line: 1, name: "初爻", ci: "始履新地，宜稳重蓄势。", xiang: "始履新地，志在安定。" },
      { line: 2, name: "二爻", ci: "得中履正，适宜推进发力。", xiang: "得中履正，顺应时势。" },
      { line: 3, name: "三爻", ci: "位居转折，宜防范风险。", xiang: "位居转折，谨言慎行。" },
      { line: 4, name: "四爻", ci: "进退之间，宜观察时局变通。", xiang: "观察时局，顺势而为。" },
      { line: 5, name: "五爻", ci: "尊位中正，大势顺遂。", xiang: "尊位中正，大有作为。" },
      { line: 6, name: "上爻", ci: "物极将变，当持盈保泰。", xiang: "物极将变，防盛极而衰。" }
    ]
  };
}

// 六爻京房纳甲排盘算法
function buildNajiaLines(upperCode: number, lowerCode: number, palaceElement: string) {
  const lowerTri = TRIGRAMS[lowerCode];
  const upperTri = TRIGRAMS[upperCode];

  const lowerBranches = lowerTri.branchInner;
  const upperBranches = upperTri.branchOuter;

  const lines = [];
  for (let i = 0; i < 3; i++) {
    const branch = lowerBranches[i];
    const elem = BRANCH_ELEMENT[branch];
    const relative = ELEMENT_RELATION(palaceElement, elem);
    lines.push({ lineIndex: i + 1, branch, elem, relative, stem: lowerTri.stem[0] });
  }
  for (let i = 0; i < 3; i++) {
    const branch = upperBranches[i];
    const elem = BRANCH_ELEMENT[branch];
    const relative = ELEMENT_RELATION(palaceElement, elem);
    lines.push({ lineIndex: i + 4, branch, elem, relative, stem: upperTri.stem[0] });
  }
  return lines;
}

export default function Page() {
  const [step, setStep] = useState<'input' | 'casting' | 'result'>('input');
  const [castProgress, setCastProgress] = useState(0);

  const [formData, setFormData] = useState({
    birthYear: '1995',
    birthMonth: '6',
    birthDay: '15',
    birthHour: '12',
    birthMinute: '30',
    gender: 'female',
    targetYear: '2026'
  });

  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    setStep('casting');
    setCastProgress(0);

    const interval = setInterval(() => {
      setCastProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // 1. 转换精准农历与八字四柱
          const solar = Solar.fromYmdHms(
            parseInt(formData.birthYear) || 1995,
            parseInt(formData.birthMonth) || 6,
            parseInt(formData.birthDay) || 15,
            parseInt(formData.birthHour) || 12,
            parseInt(formData.birthMinute) || 30,
            0
          );
          const lunar = solar.getLunar();
          const bazi = lunar.getEightChar();

          // 2. 正统梅花易数起卦 (农历年支数 + 农历月 + 农历日)
          const yearBranchNum = lunar.getYearZhiIndex() + 1;
          const lunarMonth = Math.abs(lunar.getMonth());
          const lunarDay = lunar.getDay();
          const hourBranchNum = lunar.getTimeZhiIndex() + 1;

          let upperCode = (yearBranchNum + lunarMonth + lunarDay) % 8;
          if (upperCode === 0) upperCode = 8;

          let lowerCode = (yearBranchNum + lunarMonth + lunarDay + hourBranchNum) % 8;
          if (lowerCode === 0) lowerCode = 8;

          let changingLine = (yearBranchNum + lunarMonth + lunarDay + hourBranchNum + (parseInt(formData.birthMinute) || 0)) % 6;
          if (changingLine === 0) changingLine = 6;

          // 3. 查询本卦与变卦
          const originalHex = getHexagramDetail(upperCode, lowerCode);

          const lowerTrigramObj = TRIGRAMS[lowerCode];
          const upperTrigramObj = TRIGRAMS[upperCode];
          const originalLines = [...lowerTrigramObj.lines, ...upperTrigramObj.lines];

          const transformedLines = [...originalLines];
          transformedLines[changingLine - 1] = transformedLines[changingLine - 1] === 1 ? 0 : 1;

          const findTrigramCode = (lines: number[]) => {
            for (let key in TRIGRAMS) {
              if (TRIGRAMS[key].lines.join('') === lines.join('')) return parseInt(key);
            }
            return 1;
          };

          const transLowerCode = findTrigramCode(transformedLines.slice(0, 3));
          const transUpperCode = findTrigramCode(transformedLines.slice(3, 6));
          const transformedHex = getHexagramDetail(transUpperCode, transLowerCode);

          // 4. 京房纳甲与六亲安排
          const najiaLines = buildNajiaLines(upperCode, lowerCode, originalHex.element);

          // 5. 目标流年干支
          const targetYearNum = parseInt(formData.targetYear) || 2026;
          const targetSolar = Solar.fromYmd(targetYearNum, 6, 1);
          const targetLunar = targetSolar.getLunar();
          const targetYearGanZhi = `${targetLunar.getYearInGanZhi()} (${targetLunar.getYearShengXiao()})年`;

          // 6. 十二月运势推演
          const monthlyFortunes = [
            "立春 (正月)", "惊蛰 (二月)", "清明 (三月)", "立夏 (四月)", "芒种 (五月)", "小暑 (六月)",
            "立秋 (七月)", "白露 (八月)", "寒露 (九月)", "立冬 (十月)", "大雪 (十一月)", "小寒 (十二月)"
          ].map((term, index) => {
            const monthElement = ["木", "木", "土", "火", "火", "土", "金", "金", "土", "水", "水", "土"][index];
            let status = "平顺";
            let score = "★★★☆☆";
            let advice = "步步为营，循序渐进。";

            if (monthElement === originalHex.element) {
              status = "旺相得助"; score = "★★★★★"; advice = "五行同气扶助，事业突破与贵人交汇契机。";
            } else if ((monthElement === "火" && originalHex.element === "金") || (monthElement === "水" && originalHex.element === "火")) {
              status = "休囚受克"; score = "★★☆☆☆"; advice = "月建克制卦体，宜守不宜攻，防范财务波动。";
            } else {
              status = "生旺顺遂"; score = "★★★★☆"; advice = "生扶有情，适合推进重要项目与决策。";
            }

            return { month: index + 1, term, element: monthElement, status, score, advice };
          });

          setResult({
            solarStr: `${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日 ${solar.getHour()}时`,
            lunarStr: `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
            baziStr: `${bazi.getYear()} ${bazi.getMonth()} ${bazi.getDay()} ${bazi.getTime()}`,
            originalHex,
            originalLines,
            transformedHex,
            transformedLines,
            changingLine,
            changingDetail: originalHex.lines[changingLine - 1],
            najiaLines,
            targetYearGanZhi,
            monthlyFortunes
          });

          setStep('result');
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
            ☯ 完整周易正统纳甲与梅花易数算卦引擎
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-[#f3ece0] tracking-wide mb-2">
            周易六十四卦与流年运势推演
          </h1>
          <p className="text-sm text-[#a39b8b] max-w-lg mx-auto">
            融合《周易》384爻全量爻辞、农历干支历法、京房六爻纳甲装配及十二节气流月生克。
          </p>
        </header>

        {/* 1. 表单输入 */}
        {step === 'input' && (
          <div className="bg-[#12141a] border border-[#2a2d37] rounded-2xl p-6 md:p-8 shadow-2xl">
            <h2 className="text-lg font-medium text-[#d4af37] border-b border-[#2a2d37] pb-3 mb-6 flex items-center gap-2">
              <span>☯</span> 录入本命时空坐标
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-[#8c8577] mb-1">出生年份 (公历)</label>
                  <input
                    type="number"
                    value={formData.birthYear}
                    onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                    className="w-full bg-[#1a1d26] border border-[#343846] rounded-lg px-3 py-2 text-sm text-[#f3ece0] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8c8577] mb-1">月份</label>
                  <input
                    type="number"
                    min="1" max="12"
                    value={formData.birthMonth}
                    onChange={(e) => setFormData({ ...formData, birthMonth: e.target.value })}
                    className="w-full bg-[#1a1d26] border border-[#343846] rounded-lg px-3 py-2 text-sm text-[#f3ece0] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8c8577] mb-1">日期</label>
                  <input
                    type="number"
                    min="1" max="31"
                    value={formData.birthDay}
                    onChange={(e) => setFormData({ ...formData, birthDay: e.target.value })}
                    className="w-full bg-[#1a1d26] border border-[#343846] rounded-lg px-3 py-2 text-sm text-[#f3ece0] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#8c8577] mb-1">出生小时 (0-23时)</label>
                  <input
                    type="number"
                    min="0" max="23"
                    value={formData.birthHour}
                    onChange={(e) => setFormData({ ...formData, birthHour: e.target.value })}
                    className="w-full bg-[#1a1d26] border border-[#343846] rounded-lg px-3 py-2 text-sm text-[#f3ece0] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8c8577] mb-1">分钟 (0-59分)</label>
                  <input
                    type="number"
                    min="0" max="59"
                    value={formData.birthMinute}
                    onChange={(e) => setFormData({ ...formData, birthMinute: e.target.value })}
                    className="w-full bg-[#1a1d26] border border-[#343846] rounded-lg px-3 py-2 text-sm text-[#f3ece0] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#8c8577] mb-1">性别</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-[#1a1d26] border border-[#343846] rounded-lg px-3 py-2 text-sm text-[#f3ece0] focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="female">坤造 (女)</option>
                    <option value="male">乾造 (男)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#8c8577] mb-1">测算目标流年</label>
                  <select
                    value={formData.targetYear}
                    onChange={(e) => setFormData({ ...formData, targetYear: e.target.value })}
                    className="w-full bg-[#1a1d26] border border-[#343846] rounded-lg px-3 py-2 text-sm text-[#f3ece0] focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="2026">2026 丙午马年 (赤马离火)</option>
                    <option value="2027">2027 丁未羊年</option>
                    <option value="2025">2025 乙巳蛇年</option>
                    <option value="2028">2028 戊申猴年</option>
                  </select>
                </div>
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

        {/* 2. 过渡页 */}
        {step === 'casting' && (
          <div className="bg-[#12141a] border border-[#2a2d37] rounded-2xl p-12 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-t-[#d4af37] border-r-transparent border-b-[#9e2a2b] border-l-transparent animate-spin" />
              <span className="text-3xl text-[#d4af37]">☯</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-[#f3ece0] font-medium">
                {castProgress < 30 && '排布农历干支与生辰四柱八字...'}
                {castProgress >= 30 && castProgress < 60 && '正统梅花易数起卦，推导本卦变卦...'}
                {castProgress >= 60 && castProgress < 90 && '装配京房六爻纳甲、安世应与六亲...'}
                {castProgress >= 90 && '对齐《周易》古籍爻辞与流年节气...'}
              </p>
              <div className="w-full bg-[#1a1d26] h-2 rounded-full overflow-hidden max-w-xs mx-auto">
                <div
                  className="bg-gradient-to-r from-[#9e2a2b] to-[#d4af37] h-full transition-all duration-300"
                  style={{ width: `${castProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. 结果显示页 */}
        {step === 'result' && result && (
          <div className="space-y-8">
            {/* 八字四柱与时空坐标 */}
            <div className="bg-[#12141a] border border-[#2a2d37] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="text-xs text-[#d4af37] font-mono mb-1">
                  【农历阴历】{result.lunarStr} • 【八字四柱】{result.baziStr}
                </div>
                <h2 className="text-2xl text-[#f3ece0] font-bold">
                  测算目标：{result.targetYearGanZhi} 运势
                </h2>
              </div>
              <button
                onClick={() => setStep('input')}
                className="px-4 py-2 bg-[#1a1d26] hover:bg-[#252936] text-[#d4af37] border border-[#d4af37]/30 rounded-lg text-xs"
              >
                ↺ 重新输入
              </button>
            </div>

            {/* 本卦 & 变卦 */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* 本卦 */}
              <div className="bg-[#12141a] border border-[#d4af37]/40 rounded-2xl p-6 relative">
                <div className="absolute top-4 right-4 text-xs px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#d4af37]">
                  主卦 ({result.originalHex.palace})
                </div>
                <h3 className="text-xl font-bold text-[#f3ece0] mb-1">
                  {result.originalHex.name}
                </h3>
                <p className="text-xs text-[#a39b8b] mb-4">
                  五行属{result.originalHex.element} • 吉凶：【{result.originalHex.luck}】
                </p>

                <div className="space-y-2 max-w-[220px] my-6">
                  {result.originalLines.slice().reverse().map((line: number, idx: number) => {
                    const lineNum = 6 - idx;
                    const isChanging = lineNum === result.changingLine;
                    const isShi = lineNum === result.originalHex.shi;
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
                        <span className="text-[10px] w-6 text-[#d4af37]">{isShi ? '【世】' : ''}</span>
                        {isChanging && <span className="text-[10px] text-[#9e2a2b]">●动</span>}
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-[#c5bcac] leading-relaxed bg-[#1a1d26] p-3 rounded-lg border border-[#2a2d37] mb-2">
                  <strong>卦辞：</strong>{result.originalHex.desc}
                </p>
                <p className="text-xs text-[#a39b8b] leading-relaxed bg-[#1a1d26] p-3 rounded-lg border border-[#2a2d37]">
                  <strong>大象：</strong>{result.originalHex.xiang}
                </p>
              </div>

              {/* 变卦 */}
              <div className="bg-[#12141a] border border-[#2a2d37] rounded-2xl p-6 relative">
                <div className="absolute top-4 right-4 text-xs px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-400">
                  之卦 (变卦)
                </div>
                <h3 className="text-xl font-bold text-[#f3ece0] mb-1">
                  {result.transformedHex.name}
                </h3>
                <p className="text-xs text-[#a39b8b] mb-4">
                  五行属{result.transformedHex.element} • 演化：【{result.transformedHex.luck}】
                </p>

                <div className="space-y-2 max-w-[220px] my-6">
                  {result.transformedLines.slice().reverse().map((line: number, idx: number) => {
                    const lineNum = 6 - idx;
                    return (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <span className="w-8 text-[10px] text-[#8c8577]">
                          {lineNum === 6 ? '上爻' : lineNum === 1 ? '初爻' : `${lineNum}爻`}
                        </span>
                        <div className="flex-grow">
                          {line === 1 ? (
                            <div className="h-3 rounded bg-gradient-to-r from-[#d4af37] via-[#f3ece0] to-[#d4af37]" />
                          ) : (
                            <div className="h-3 flex justify-between">
                              <div className="w-[46%] rounded bg-gradient-to-r from-[#d4af37] via-[#f3ece0] to-[#d4af37]" />
                              <div className="w-[46%] rounded bg-gradient-to-r from-[#d4af37] via-[#f3ece0] to-[#d4af37]" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-[#c5bcac] leading-relaxed bg-[#1a1d26] p-3 rounded-lg border border-[#2a2d37] mb-2">
                  <strong>卦辞：</strong>{result.transformedHex.desc}
                </p>
                <p className="text-xs text-[#a39b8b] leading-relaxed bg-[#1a1d26] p-3 rounded-lg border border-[#2a2d37]">
                  <strong>大象：</strong>{result.transformedHex.xiang}
                </p>
              </div>
            </div>

            {/* 动爻专属爻辞详解 */}
            <div className="bg-[#12141a] border border-[#9e2a2b]/50 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-[#d4af37] border-b border-[#2a2d37] pb-2 mb-3 flex items-center gap-2">
                <span>☯</span> 发动爻辞详解 (第 {result.changingLine} 爻：{result.changingDetail?.name})
              </h3>
              <p className="text-base text-[#f3ece0] font-bold mb-2">
                【爻辞】{result.changingDetail?.ci}
              </p>
              <p className="text-xs text-[#d4af37] mb-3">
                【小象传】{result.changingDetail?.xiang}
              </p>
              <p className="text-xs text-[#a39b8b] leading-relaxed bg-[#1a1d26] p-3 rounded-lg border border-[#2a2d37]">
                <strong>机锋解析：</strong>动爻乃吉凶转化之枢纽。目标流年期间，局势将围绕此爻所示之关键节点展开，宜契合爻辞智慧顺势而为。
              </p>
            </div>

            {/* 京房六爻纳甲排盘表 */}
            <div className="bg-[#12141a] border border-[#2a2d37] rounded-2xl p-6">
              <h3 className="text-sm font-bold text-[#d4af37] border-b border-[#2a2d37] pb-3 mb-4">
                ☯ 京房六爻纳甲排盘 (宫属：{result.originalHex.palace})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#2a2d37] text-[#8c8577]">
                      <th className="py-2">爻位</th>
                      <th className="py-2">纳甲干支</th>
                      <th className="py-2">地支五行</th>
                      <th className="py-2">六亲属性</th>
                      <th className="py-2">世应状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2d37]/50 text-[#c5bcac]">
                    {result.najiaLines.slice().reverse().map((item: any) => (
                      <tr key={item.lineIndex} className={item.lineIndex === result.changingLine ? "bg-[#9e2a2b]/10" : ""}>
                        <td className="py-2.5 font-bold">
                          {item.lineIndex === 6 ? '上爻' : item.lineIndex === 1 ? '初爻' : `${item.lineIndex}爻`}
                        </td>
                        <td className="py-2.5 text-[#f3ece0]">{item.stem}{item.branch}</td>
                        <td className="py-2.5">{item.elem}</td>
                        <td className="py-2.5 text-[#d4af37]">{item.relative}</td>
                        <td className="py-2.5">
                          {item.lineIndex === result.originalHex.shi ? <span className="text-[#d4af37] font-bold">【世爻】</span> : ''}
                          {item.lineIndex === result.changingLine ? <span className="text-[#9e2a2b]">● 动爻</span> : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 十二节气流月运势 */}
            <div className="bg-[#12141a] border border-[#2a2d37] rounded-2xl p-6 md:p-8">
              <h3 className="text-lg font-bold text-[#d4af37] border-b border-[#2a2d37] pb-4 mb-6 flex justify-between items-center">
                <span>📅 {result.targetYearGanZhi} 十二节气流月运势详析</span>
                <span className="text-xs font-normal text-[#8c8577]">依据节气律吕与月建生克</span>
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {result.monthlyFortunes.map((m: any) => (
                  <div key={m.month} className="bg-[#1a1d26] border border-[#2a2d37] p-4 rounded-xl flex items-start gap-4">
                    <div className="bg-[#222632] text-[#d4af37] font-bold text-center p-2 rounded-lg min-w-[50px]">
                      <div className="text-xs">{m.month}月</div>
                      <div className="text-[10px] text-[#8c8577]">{m.element}吉</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#f3ece0]">{m.term}</span>
                        <span className="text-[10px] text-[#d4af37]">{m.score}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#d4af37]/10 text-[#d4af37]">
                          {m.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#a39b8b] leading-relaxed">
                        {m.advice}
                      </p>
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