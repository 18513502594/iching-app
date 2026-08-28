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
  // China
  { name: "Beijing, China", longitude: 116.40 },
  { name: "Shanghai, China", longitude: 121.47 },
  { name: "Guangzhou, China", longitude: 113.27 },
  { name: "Shenzhen, China", longitude: 114.06 },
  { name: "Chengdu, China", longitude: 104.07 },
  { name: "Xi'an, China", longitude: 108.95 },
  { name: "Hangzhou, China", longitude: 120.16 },
  { name: "Wuhan, China", longitude: 114.31 },
  { name: "Urumqi, China", longitude: 87.62 },
  { name: "Lhasa, China", longitude: 91.14 },
  { name: "Hong Kong SAR", longitude: 114.17 },
  { name: "Macau SAR", longitude: 113.54 },
  { name: "Taipei, Taiwan", longitude: 121.56 },
  // East / Southeast Asia
  { name: "Tokyo, Japan", longitude: 139.69 },
  { name: "Osaka, Japan", longitude: 135.50 },
  { name: "Seoul, South Korea", longitude: 126.98 },
  { name: "Singapore", longitude: 103.82 },
  { name: "Bangkok, Thailand", longitude: 100.50 },
  { name: "Manila, Philippines", longitude: 120.98 },
  { name: "Jakarta, Indonesia", longitude: 106.85 },
  { name: "Kuala Lumpur, Malaysia", longitude: 101.69 },
  { name: "Ho Chi Minh City, Vietnam", longitude: 106.63 },
  // South Asia / Middle East
  { name: "Mumbai, India", longitude: 72.88 },
  { name: "New Delhi, India", longitude: 77.21 },
  { name: "Dubai, UAE", longitude: 55.30 },
  { name: "Tel Aviv, Israel", longitude: 34.78 },
  // Europe
  { name: "London, UK", longitude: -0.13 },
  { name: "Paris, France", longitude: 2.35 },
  { name: "Berlin, Germany", longitude: 13.40 },
  { name: "Madrid, Spain", longitude: -3.70 },
  { name: "Rome, Italy", longitude: 12.50 },
  { name: "Amsterdam, Netherlands", longitude: 4.90 },
  { name: "Moscow, Russia", longitude: 37.62 },
  { name: "Zurich, Switzerland", longitude: 8.54 },
  // North America
  { name: "New York, USA", longitude: -74.01 },
  { name: "Los Angeles, USA", longitude: -118.24 },
  { name: "Chicago, USA", longitude: -87.63 },
  { name: "San Francisco, USA", longitude: -122.42 },
  { name: "Seattle, USA", longitude: -122.33 },
  { name: "Houston, USA", longitude: -95.37 },
  { name: "Toronto, Canada", longitude: -79.38 },
  { name: "Vancouver, Canada", longitude: -123.12 },
  { name: "Mexico City, Mexico", longitude: -99.13 },
  // Oceania
  { name: "Sydney, Australia", longitude: 151.21 },
  { name: "Melbourne, Australia", longitude: 144.96 },
  { name: "Auckland, New Zealand", longitude: 174.76 },
  // South America
  { name: "São Paulo, Brazil", longitude: -46.63 },
  { name: "Buenos Aires, Argentina", longitude: -58.38 },
  // Africa
  { name: "Cairo, Egypt", longitude: 31.24 },
  { name: "Johannesburg, South Africa", longitude: 28.05 },
  { name: "Lagos, Nigeria", longitude: 3.38 },
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
