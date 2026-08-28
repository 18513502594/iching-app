// Paddle 配置：客户端 Token 和价格 ID 需要在 Paddle Dashboard 创建后，
// 配置到 Vercel 项目的环境变量里（具体步骤见 README）。

// Client-side token：Paddle Dashboard → Developer Tools → Authentication
export const PADDLE_CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "";

// Price ID：Paddle Dashboard → Catalog → Products → 你创建的商品 → 对应的 Price
export const PADDLE_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID || "";

// 环境：先用 "sandbox" 测试，正式收款前改成 "production"
export const PADDLE_ENV = (process.env.NEXT_PUBLIC_PADDLE_ENV as "sandbox" | "production") || "sandbox";

// 展示用的价格文案（Paddle 结账弹窗会显示按用户所在地本地化后的真实价格，这里只是按钮上的参考文案）
export const PRICE_DISPLAY = process.env.NEXT_PUBLIC_PRICE_DISPLAY || "$6.99";
