import { HEX_TEXTS_1, HexText, HexLine } from "./hexagram-texts-1";
import { HEX_TEXTS_2 } from "./hexagram-texts-2";
import { getHexMeta, HexMeta } from "./najia";

export type { HexText, HexLine, HexMeta };

const ALL_TEXTS: Record<string, HexText> = { ...HEX_TEXTS_1, ...HEX_TEXTS_2 };

export interface FullHexagram extends HexMeta, HexText {
  upperCode: number;
  lowerCode: number;
}

/** 查询某一卦（由上卦、下卦八卦序号 1-8 组成）的完整信息：结构元数据 + 卦辞爻辞原文 */
export function getHexagram(upperCode: number, lowerCode: number): FullHexagram {
  const meta = getHexMeta(upperCode, lowerCode);
  const text = ALL_TEXTS[`${upperCode},${lowerCode}`];
  if (!text) {
    // 理论上64卦已全量覆盖，这里仅作为异常兜底，不应触发
    throw new Error(`未找到卦象数据：上${upperCode} 下${lowerCode}`);
  }
  return { ...meta, ...text, upperCode, lowerCode };
}
