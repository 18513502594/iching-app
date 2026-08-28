import Link from 'next/link';
import { PRICE_DISPLAY } from '@/lib/gumroad-config';

export const metadata = {
  title: 'Pricing — I Ching Hexagram & Yearly Fortune Reading',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a0b0e] text-[#e2d9c8] font-serif px-4 py-12 md:px-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-xs text-[#d4af37] hover:underline">&larr; Back to home</Link>
        <h1 className="text-3xl font-bold text-[#f3ece0] mt-4 mb-2">Pricing</h1>
        <p className="text-sm text-[#a39b8b] mb-10">
          Simple, one-time pricing. No subscription, no account required.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#12141a] border border-[#2a2d37] rounded-2xl p-6">
            <div className="text-xs text-[#8c8577] uppercase tracking-wide mb-2">Free Overview</div>
            <div className="text-3xl font-bold text-[#f3ece0] mb-4">$0</div>
            <ul className="space-y-2 text-sm text-[#c5bcac]">
              <li>&bull; Your primary and transformed hexagram</li>
              <li>&bull; Hexagram name and general luck rating</li>
              <li>&bull; Visual six-line chart</li>
              <li>&bull; One-line summary of your reading</li>
            </ul>
          </div>

          <div className="bg-[#12141a] border border-[#d4af37]/50 rounded-2xl p-6 relative">
            <div className="absolute top-4 right-4 text-[10px] px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#d4af37]">
              Most popular
            </div>
            <div className="text-xs text-[#d4af37] uppercase tracking-wide mb-2">Full Reading</div>
            <div className="text-3xl font-bold text-[#f3ece0] mb-4">{PRICE_DISPLAY}</div>
            <ul className="space-y-2 text-sm text-[#c5bcac]">
              <li>&bull; Everything in the free overview</li>
              <li>&bull; Complete classical hexagram &amp; moving line text</li>
              <li>&bull; Full Najia six-line chart with ruling/paired lines</li>
              <li>&bull; Month-by-month forecast for your chosen year</li>
              <li>&bull; One-time payment &mdash; no subscription</li>
            </ul>
          </div>
        </div>

        <p className="text-xs text-[#65605a] mt-8">
          Payments are securely processed by Gumroad, our Merchant of Record. See our{' '}
          <Link href="/terms" className="text-[#d4af37] underline">Terms of Service</Link>,{' '}
          <Link href="/privacy" className="text-[#d4af37] underline">Privacy Policy</Link>, and{' '}
          <Link href="/refund" className="text-[#d4af37] underline">Refund Policy</Link>.
        </p>

        <Link
          href="/"
          className="inline-block mt-8 bg-gradient-to-r from-[#9e2a2b] to-[#b83b27] hover:from-[#b83b27] hover:to-[#d4af37] text-white font-medium px-6 py-3 rounded-xl transition-all"
        >
          Start Your Reading &rarr;
        </Link>
      </div>
    </div>
  );
}
