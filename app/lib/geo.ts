// --- 出生地经度库与真太阳时校正 ---
//
// 中国大陆统一使用北京时间（东八区，以东经120°为标准子午线）报时，
// 但真太阳时是依据当地实际经度计算的"视太阳时"。两者的时差公式：
//   真太阳时偏移(分钟) = (当地经度 - 120) × 4
// 例如：新疆乌鲁木齐（约东经87.6°）比北京时间的真太阳时要晚 (87.6-120)×4 ≈ -130分钟，
// 即北京时间12:00时，乌鲁木齐的真太阳时其实只有约9:50。
// 这个偏移在生辰时辰临界点（如子时、午时前后）会直接改变"时柱"和起卦用的时支，
// 因此出生地信息对严肃的命理推算是有意义的。

export interface CityLocation {
  name: string;
  longitude: number;
}

// 常用城市经度表（东经为正）。找不到时可用「自定义经度」手动输入。
export const CITY_LOCATIONS: CityLocation[] = [
  { name: "北京", longitude: 116.40 },
  { name: "上海", longitude: 121.47 },
  { name: "广州", longitude: 113.27 },
  { name: "深圳", longitude: 114.06 },
  { name: "天津", longitude: 117.20 },
  { name: "重庆", longitude: 106.55 },
  { name: "成都", longitude: 104.07 },
  { name: "杭州", longitude: 120.16 },
  { name: "南京", longitude: 118.80 },
  { name: "武汉", longitude: 114.31 },
  { name: "西安", longitude: 108.95 },
  { name: "苏州", longitude: 120.62 },
  { name: "郑州", longitude: 113.65 },
  { name: "长沙", longitude: 112.94 },
  { name: "沈阳", longitude: 123.43 },
  { name: "哈尔滨", longitude: 126.53 },
  { name: "长春", longitude: 125.32 },
  { name: "济南", longitude: 117.00 },
  { name: "青岛", longitude: 120.38 },
  { name: "合肥", longitude: 117.27 },
  { name: "福州", longitude: 119.30 },
  { name: "厦门", longitude: 118.09 },
  { name: "南昌", longitude: 115.86 },
  { name: "南宁", longitude: 108.37 },
  { name: "昆明", longitude: 102.71 },
  { name: "贵阳", longitude: 106.71 },
  { name: "兰州", longitude: 103.83 },
  { name: "西宁", longitude: 101.78 },
  { name: "银川", longitude: 106.27 },
  { name: "乌鲁木齐", longitude: 87.62 },
  { name: "拉萨", longitude: 91.14 },
  { name: "呼和浩特", longitude: 111.75 },
  { name: "太原", longitude: 112.55 },
  { name: "石家庄", longitude: 114.51 },
  { name: "海口", longitude: 110.35 },
  { name: "香港", longitude: 114.17 },
  { name: "澳门", longitude: 113.54 },
  { name: "台北", longitude: 121.56 },
  { name: "东京", longitude: 139.69 },
  { name: "首尔", longitude: 126.98 },
  { name: "新加坡", longitude: 103.82 },
  { name: "纽约", longitude: -74.01 },
  { name: "洛杉矶", longitude: -118.24 },
  { name: "伦敦", longitude: -0.13 },
  { name: "悉尼", longitude: 151.21 },
  { name: "多伦多", longitude: -79.38 },
  { name: "温哥华", longitude: -123.12 },
];

/**
 * 计算真太阳时相对于当地标准时（以中国为例，东八区标准时=北京时间）的偏移分钟数。
 * standardMeridian 默认 120（东八区）；如出生地在其他时区，可传入对应的标准经度
 * （如西五区纽约传 -75，欧洲中部时区传 15 等），使换算逻辑保持一致。
 */
export function trueSolarTimeOffsetMinutes(longitude: number, standardMeridian: number = 120): number {
  return (longitude - standardMeridian) * 4;
}

/**
 * 依据经度自动推断合理的标准时区经度（15°一个时区，取最近的整时区中央经线）。
 * 用于国际城市：不强行套用东八区，而是先按其自身所在时区校正，避免出现校正方向搞反的问题。
 */
export function inferStandardMeridian(longitude: number): number {
  return Math.round(longitude / 15) * 15;
}

/** 将出生的"钟表时间"（时、分）按真太阳时偏移，返回校正后的分钟数（可能为负或超过1440，调用方需处理跨日） */
export function applyTrueSolarTime(hour: number, minute: number, longitude: number, isOverseas: boolean): {
  correctedHour: number;
  correctedMinute: number;
  dayOffset: number; // -1, 0, or 1，表示是否跨日
  offsetMinutes: number;
} {
  const standardMeridian = isOverseas ? inferStandardMeridian(longitude) : 120;
  const offsetMinutes = trueSolarTimeOffsetMinutes(longitude, standardMeridian);
  let totalMinutes = hour * 60 + minute + offsetMinutes;
  let dayOffset = 0;
  if (totalMinutes < 0) { totalMinutes += 1440; dayOffset = -1; }
  if (totalMinutes >= 1440) { totalMinutes -= 1440; dayOffset = 1; }
  return {
    correctedHour: Math.floor(totalMinutes / 60),
    correctedMinute: Math.round(totalMinutes % 60),
    dayOffset,
    offsetMinutes,
  };
}
