import { NextResponse } from 'next/server';

const BAGUA = [
  { name: "Kun (Earth)", attr: "Earth", wuxing: "Earth", health: "Digestive system" },
  { name: "Zhen (Thunder)", attr: "Thunder", wuxing: "Wood", health: "Nervous system" },
  { name: "Kan (Water)", attr: "Water", wuxing: "Water", health: "Kidneys & Circulation" },
  { name: "Dui (Lake)", attr: "Lake", wuxing: "Metal", health: "Respiratory system" },
  { name: "Gen (Mountain)", attr: "Mountain", wuxing: "Earth", health: "Joints & Spine" },
  { name: "Li (Fire)", attr: "Fire", wuxing: "Fire", health: "Heart & Eyes" },
  { name: "Xun (Wind)", attr: "Wind", wuxing: "Wood", health: "Lungs & Breathing" },
  { name: "Qian (Heaven)", attr: "Heaven", wuxing: "Metal", health: "Head & Vitality" }
];

export async function POST(req: Request) {
  try {
    const { year, month, day, hour, targetYear, isPaid } = await req.json();

    let upperSum = Number(year) + Number(month) + Number(day);
    let lowerSum = upperSum + Number(hour);
    let movingSum = lowerSum + Number(targetYear);

    let upperIdx = upperSum % 8;
    let lowerIdx = lowerSum % 8;
    let movingYao = (movingSum % 6) || 6;

    const upperGua = BAGUA[upperIdx];
    const lowerGua = BAGUA[lowerIdx];

    let tiGua = movingYao <= 3 ? upperGua : lowerGua;
    let yongGua = movingYao <= 3 ? lowerGua : upperGua;

    const baseResult = {
      hexagramName: `${upperGua.attr} over ${lowerGua.attr}`,
      tiGua: tiGua.name,
      yongGua: yongGua.name,
      movingYao: movingYao,
      year: targetYear
    };

    if (!isPaid) {
      return NextResponse.json({
        success: true,
        isPaid: false,
        preview: baseResult,
        message: "Unlock full I Ching forecast to access detailed dimensions."
      });
    }

    const fullForecast = {
      ...baseResult,
      overallEnergy: `Your primary energy for ${targetYear} is guided by ${tiGua.name} interacting with ${yongGua.name}. The element of ${tiGua.wuxing} meets ${yongGua.wuxing}, creating a season of structural transformation and strategic timing.`,
      careerAndWealth: `In your professional journey, ${upperGua.attr} above ${lowerGua.attr} signifies strong external momentum. Focus on leveraging your core strengths while adapting to market shifts during Line ${movingYao}'s cycle.`,
      relationshipAndHealth: `Interpersonal dynamics require emotional balance. Pay close attention to wellness related to your ${tiGua.health} during high-stress periods.`
    };

    return NextResponse.json({
      success: true,
      isPaid: true,
      data: fullForecast
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}