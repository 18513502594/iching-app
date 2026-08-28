// Gumroad 配置：产品链接在 Gumroad 后台创建产品后可以拿到（Products → 你的产品 → Share）
// 需要在 Vercel 项目环境变量里配置

// 完整的 Gumroad 产品页链接，形如 https://你的用户名.gumroad.com/l/产品permalink
export const GUMROAD_PRODUCT_URL = process.env.NEXT_PUBLIC_GUMROAD_PRODUCT_URL || "";

// 展示用的价格文案（实际价格以 Gumroad 产品页为准，这里只是按钮上的参考文案）
export const PRICE_DISPLAY = process.env.NEXT_PUBLIC_PRICE_DISPLAY || "$6.99";
