// 64卦英文标准名称（沿用国际通行的 Wilhelm/Baynes 译名体系，是英语世界最广为人知的版本）
// key: "上卦code,下卦code" -> { pinyin, gloss }
export interface HexNameEn {
  pinyin: string;
  gloss: string; // 简短英文释名
}

export const HEX_NAMES_EN: Record<string, HexNameEn> = {
  "1,1": { pinyin: "Qián", gloss: "The Creative" },
  "1,2": { pinyin: "Lǚ", gloss: "Treading (Conduct)" },
  "1,3": { pinyin: "Tóngrén", gloss: "Fellowship with Others" },
  "1,4": { pinyin: "Wúwàng", gloss: "Innocence (The Unexpected)" },
  "1,5": { pinyin: "Gòu", gloss: "Coming to Meet" },
  "1,6": { pinyin: "Sòng", gloss: "Conflict" },
  "1,7": { pinyin: "Dùn", gloss: "Retreat" },
  "1,8": { pinyin: "Pǐ", gloss: "Standstill" },
  "2,1": { pinyin: "Guài", gloss: "Breakthrough" },
  "2,2": { pinyin: "Duì", gloss: "The Joyous, Lake" },
  "2,3": { pinyin: "Gé", gloss: "Revolution" },
  "2,4": { pinyin: "Suí", gloss: "Following" },
  "2,5": { pinyin: "Dàguò", gloss: "Preponderance of the Great" },
  "2,6": { pinyin: "Kùn", gloss: "Oppression (Exhaustion)" },
  "2,7": { pinyin: "Xián", gloss: "Influence (Wooing)" },
  "2,8": { pinyin: "Cuì", gloss: "Gathering Together" },
  "3,1": { pinyin: "Dàyǒu", gloss: "Possession in Great Measure" },
  "3,2": { pinyin: "Kuí", gloss: "Opposition" },
  "3,3": { pinyin: "Lí", gloss: "The Clinging, Fire" },
  "3,4": { pinyin: "Shìhé", gloss: "Biting Through" },
  "3,5": { pinyin: "Dǐng", gloss: "The Cauldron" },
  "3,6": { pinyin: "Wèijì", gloss: "Before Completion" },
  "3,7": { pinyin: "Lǚ", gloss: "The Wanderer" },
  "3,8": { pinyin: "Jìn", gloss: "Progress" },
  "4,1": { pinyin: "Dàzhuàng", gloss: "The Power of the Great" },
  "4,2": { pinyin: "Guīmèi", gloss: "The Marrying Maiden" },
  "4,3": { pinyin: "Fēng", gloss: "Abundance" },
  "4,4": { pinyin: "Zhèn", gloss: "The Arousing, Thunder" },
  "4,5": { pinyin: "Héng", gloss: "Duration" },
  "4,6": { pinyin: "Xiè", gloss: "Deliverance" },
  "4,7": { pinyin: "Xiǎoguò", gloss: "Preponderance of the Small" },
  "4,8": { pinyin: "Yù", gloss: "Enthusiasm" },
  "5,1": { pinyin: "Xiǎochù", gloss: "Small Taming" },
  "5,2": { pinyin: "Zhōngfú", gloss: "Inner Truth" },
  "5,3": { pinyin: "Jiārén", gloss: "The Family" },
  "5,4": { pinyin: "Yì", gloss: "Increase" },
  "5,5": { pinyin: "Xùn", gloss: "The Gentle, Wind" },
  "5,6": { pinyin: "Huàn", gloss: "Dispersion" },
  "5,7": { pinyin: "Jiàn", gloss: "Gradual Progress" },
  "5,8": { pinyin: "Guān", gloss: "Contemplation" },
  "6,1": { pinyin: "Xū", gloss: "Waiting" },
  "6,2": { pinyin: "Jié", gloss: "Limitation" },
  "6,3": { pinyin: "Jìjì", gloss: "After Completion" },
  "6,4": { pinyin: "Zhūn", gloss: "Difficulty at the Beginning" },
  "6,5": { pinyin: "Jǐng", gloss: "The Well" },
  "6,6": { pinyin: "Kǎn", gloss: "The Abysmal, Water" },
  "6,7": { pinyin: "Jiǎn", gloss: "Obstruction" },
  "6,8": { pinyin: "Bǐ", gloss: "Holding Together" },
  "7,1": { pinyin: "Dàchù", gloss: "Great Taming" },
  "7,2": { pinyin: "Sǔn", gloss: "Decrease" },
  "7,3": { pinyin: "Bì", gloss: "Grace" },
  "7,4": { pinyin: "Yí", gloss: "Nourishment" },
  "7,5": { pinyin: "Gǔ", gloss: "Work on the Decayed" },
  "7,6": { pinyin: "Méng", gloss: "Youthful Folly" },
  "7,7": { pinyin: "Gèn", gloss: "Keeping Still, Mountain" },
  "7,8": { pinyin: "Bō", gloss: "Splitting Apart" },
  "8,1": { pinyin: "Tài", gloss: "Peace" },
  "8,2": { pinyin: "Lín", gloss: "Approach" },
  "8,3": { pinyin: "Míngyí", gloss: "Darkening of the Light" },
  "8,4": { pinyin: "Fù", gloss: "Return" },
  "8,5": { pinyin: "Shēng", gloss: "Pushing Upward" },
  "8,6": { pinyin: "Shī", gloss: "The Army" },
  "8,7": { pinyin: "Qiān", gloss: "Modesty" },
  "8,8": { pinyin: "Kūn", gloss: "The Receptive" },
};

export function getHexNameEn(upper: number, lower: number): HexNameEn {
  return HEX_NAMES_EN[`${upper},${lower}`] ?? { pinyin: "Unknown", gloss: "Unknown Hexagram" };
}

// 五行英文
export const ELEMENT_EN: Record<string, string> = {
  "金": "Metal", "木": "Wood", "水": "Water", "火": "Fire", "土": "Earth",
};

// 六亲英文
export const RELATIVE_EN: Record<string, string> = {
  "父母": "Parent", "兄弟": "Sibling", "子孙": "Offspring", "妻财": "Wealth", "官鬼": "Officer/Demon",
};

// 吉凶速览英文
export const LUCK_EN: Record<string, { label: string; tone: "great" | "good" | "neutral" | "caution" | "bad" }> = {
  "大吉": { label: "Highly Auspicious", tone: "great" },
  "吉": { label: "Auspicious", tone: "good" },
  "小吉": { label: "Mildly Favorable", tone: "good" },
  "平": { label: "Neutral", tone: "neutral" },
  "小凶": { label: "Mildly Cautionary", tone: "caution" },
  "凶": { label: "Inauspicious", tone: "bad" },
};
