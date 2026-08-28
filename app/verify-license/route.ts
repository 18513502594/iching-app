import { NextRequest, NextResponse } from "next/server";

// GUMROAD_PRODUCT_ID 是服务端专用环境变量（不带 NEXT_PUBLIC_ 前缀，不会暴露给浏览器）
// 在 Gumroad 后台：Products → 你的产品 → Share → API 里能找到这个 ID
export async function POST(req: NextRequest) {
  const { licenseKey } = await req.json().catch(() => ({ licenseKey: null }));

  if (!licenseKey || typeof licenseKey !== "string" || !licenseKey.trim()) {
    return NextResponse.json({ valid: false, error: "Please enter a license key." }, { status: 400 });
  }

  const productId = process.env.GUMROAD_PRODUCT_ID;
  if (!productId) {
    return NextResponse.json({ valid: false, error: "Server is not configured yet. Please contact support." }, { status: 500 });
  }

  try {
    const body = new URLSearchParams();
    body.append("product_id", productId);
    body.append("license_key", licenseKey.trim());
    // 不递增使用次数——允许用户在不同设备/清缓存后用同一个授权码反复解锁自己买过的内容
    body.append("increment_uses_count", "false");

    const gumroadRes = await fetch("https://api.gumroad.com/v2/licenses/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await gumroadRes.json();

    if (!data.success) {
      return NextResponse.json({ valid: false, error: "That license key doesn't look right. Please double-check and try again." });
    }
    if (data.purchase?.refunded || data.purchase?.chargebacked || data.purchase?.disputed) {
      return NextResponse.json({ valid: false, error: "This purchase was refunded or disputed, so the reading can't be unlocked." });
    }

    return NextResponse.json({ valid: true });
  } catch (err) {
    console.error("Gumroad license verification failed:", err);
    return NextResponse.json({ valid: false, error: "Verification failed. Please try again in a moment." }, { status: 500 });
  }
}
