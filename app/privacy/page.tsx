import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — I Ching Hexagram & Yearly Fortune Reading',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0b0e] text-[#e2d9c8] font-serif px-4 py-12 md:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-xs text-[#d4af37] hover:underline">&larr; Back to home</Link>
        <h1 className="text-3xl font-bold text-[#f3ece0] mt-4 mb-2">Privacy Policy</h1>
        <p className="text-xs text-[#8c8577] mb-10">Last updated: August 2026</p>

        <div className="space-y-8 text-sm text-[#c5bcac] leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-[#d4af37] mb-2">1. What information we collect</h2>
            <p>
              To generate your reading, you provide: birth date, birth time, birth location (city or longitude),
              gender, and the year you want forecast. This information is used solely to calculate your hexagram
              and is processed entirely in your browser session — it is <strong>not transmitted to or stored on
              our servers</strong>, and no database of user submissions is kept.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#d4af37] mb-2">2. Payment information</h2>
            <p>
              If you purchase the full reading, payment is handled entirely by our Merchant of Record, Paddle.com
              Market Limited ("Paddle"). We do not receive, process, or store your card details, PayPal information,
              or other payment credentials. Paddle collects your email address and billing details as part of the
              checkout process, in accordance with{' '}
              <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-[#d4af37] underline">
                Paddle's own Privacy Policy
              </a>. Paddle may share limited order information (such as your email and purchase confirmation) with
              us for customer support and dispute-handling purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#d4af37] mb-2">3. Cookies and analytics</h2>
            <p>
              This site may use minimal technical cookies required for the checkout process (provided by Paddle)
              and standard hosting/analytics tools provided by our infrastructure provider (Vercel) to monitor
              site performance and detect abuse. These do not identify you personally beyond standard web server
              logs (e.g. IP address, browser type).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#d4af37] mb-2">4. Data retention</h2>
            <p>
              Because birth data you enter is never stored by us, there is nothing for us to retain or delete on
              our end — it exists only in your browser's memory for the duration of your visit. Any billing data
              retained by Paddle is governed by Paddle's own retention policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#d4af37] mb-2">5. Your rights</h2>
            <p>
              Depending on your location, you may have rights under data protection laws (such as the EU/UK GDPR)
              regarding personal data held about you. Since we do not retain your birth data, most such requests
              would need to be directed to Paddle regarding your billing information — see their privacy policy
              linked above for how to exercise those rights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#d4af37] mb-2">6. Children's privacy</h2>
            <p>
              The Service is not directed at children under 18 and we do not knowingly collect information from
              them.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#d4af37] mb-2">7. Changes to this policy</h2>
            <p>
              We may update this Privacy Policy from time to time. The "Last updated" date above will reflect the
              most recent revision.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#d4af37] mb-2">8. Contact</h2>
            <p>
              Questions about this Privacy Policy can be sent to{' '}
              <span className="text-[#d4af37]">[your-support-email@example.com]</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
