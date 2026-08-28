import Link from 'next/link';

export const metadata = {
  title: 'Refund Policy — I Ching Hexagram & Yearly Fortune Reading',
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#0a0b0e] text-[#e2d9c8] font-serif px-4 py-12 md:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-xs text-[#d4af37] hover:underline">&larr; Back to home</Link>
        <h1 className="text-3xl font-bold text-[#f3ece0] mt-4 mb-2">Refund Policy</h1>
        <p className="text-xs text-[#8c8577] mb-10">Last updated: August 2026</p>

        <div className="space-y-8 text-sm text-[#c5bcac] leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-[#d4af37] mb-2">1. Digital product</h2>
            <p>
              The full reading you purchase is a digital product delivered instantly in your browser upon
              successful payment. Because the content is generated and unlocked immediately, please review the
              free overview carefully before purchasing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#d4af37] mb-2">2. Refund eligibility</h2>
            <p>
              We want you to be satisfied with your purchase. You may request a refund within{' '}
              <strong>14 days</strong> of your purchase date if:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-[#a39b8b]">
              <li>You were charged in error or charged more than once for the same order, or</li>
              <li>A technical fault on our end prevented the full reading from unlocking after successful payment.</li>
            </ul>
            <p className="mt-2">
              Because the reading is generated instantly and consumed immediately, refund requests based solely
              on dissatisfaction with the content of the reading itself are evaluated case by case and are not
              guaranteed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#d4af37] mb-2">3. How to request a refund</h2>
            <p>
              All payments are processed by our Merchant of Record, Gumroad, Inc. ("Gumroad"), San Francisco,
              California, USA. Refunds for eligible purchases are issued directly by us through our Gumroad seller
              account. You can request a refund by:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-[#a39b8b]">
              <li>Using the link in the receipt email Gumroad sent you at checkout, or</li>
              <li>Emailing us at <span className="text-[#d4af37]">[your-support-email@example.com]</span> with your
                order confirmation and the reason for your request.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#d4af37] mb-2">4. Processing time</h2>
            <p>
              Approved refunds are typically processed within 5–10 business days, though the exact timing for
              funds to appear back in your account depends on your card issuer or payment provider.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#d4af37] mb-2">5. Contact</h2>
            <p>
              For any questions about this policy, reach us at{' '}
              <span className="text-[#d4af37]">[your-support-email@example.com]</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
