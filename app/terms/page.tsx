import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'Terms and Conditions for using BugReport.',
}

const EFFECTIVE_DATE = 'June 1, 2026'
const COMPANY = 'BugReport'
const EMAIL = 'support@bugreportmanager.vercel.app'
const GOVERNING_LAW = 'Republic of Indonesia'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="text-sm text-indigo-400 hover:text-indigo-300">← Back to home</Link>
          <h1 className="mt-4 text-3xl font-bold text-zinc-100">Terms and Conditions</h1>
          <p className="mt-2 text-sm text-zinc-500">Effective date: {EFFECTIVE_DATE}</p>
        </div>

        <div className="prose-legal space-y-10 text-zinc-300">

          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using {COMPANY} (&ldquo;the Service&rdquo;), you agree to be bound by these Terms and
              Conditions (&ldquo;Terms&rdquo;). If you do not agree, you may not use the Service. These Terms apply to
              all users, including free-tier users, paid subscribers, and team members invited to an account.
            </p>
            <p>
              By clicking &ldquo;I agree&rdquo; or by creating an account, you acknowledge that you have read,
              understood, and agree to be bound by these Terms, as well as our{' '}
              <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</Link>.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              {COMPANY} is a software-as-a-service (SaaS) platform that allows developers and teams to collect, manage,
              and triage bug reports and user feedback from mobile, web, and desktop applications via a REST API and
              dashboard.
            </p>
            <p>We reserve the right to modify, suspend, or discontinue any part of the Service at any time with reasonable notice.</p>
          </Section>

          <Section title="3. Account Registration">
            <ul>
              <li>You must provide accurate and complete information when creating an account.</li>
              <li>You are responsible for maintaining the confidentiality of your API keys and login credentials.</li>
              <li>You must be at least 13 years old (or the minimum legal age in your jurisdiction) to use the Service.</li>
              <li>One person or legal entity may not maintain more than one free account.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
            </ul>
          </Section>

          <Section title="4. Subscription Plans and Billing">
            <SubSection title="4.1 Plans">
              <p>
                {COMPANY} offers Free, Pro, and Business subscription plans. Features and limits for each plan are
                described on the pricing page and may be updated from time to time.
              </p>
            </SubSection>

            <SubSection title="4.2 Payment Processing">
              <p>
                All payments for paid plans are processed through <strong className="text-zinc-100">Midtrans</strong>,
                a licensed payment service provider in Indonesia operated by PT Midtrans (a Gojek company). By
                subscribing to a paid plan, you also agree to Midtrans&apos; Terms and Conditions as published on
                their official website.
              </p>
              <p>
                When you provide payment information, you authorize {COMPANY} and Midtrans to charge your selected
                payment method for the applicable subscription fee on a recurring basis (monthly or annually, as
                chosen).
              </p>
            </SubSection>

            <SubSection title="4.3 Recurring Billing">
              <p>
                Paid subscriptions renew automatically at the end of each billing cycle. You will be charged the
                then-current price for your plan unless you cancel before the renewal date.
              </p>
            </SubSection>

            <SubSection title="4.4 Price Changes">
              <p>
                We may change subscription prices with at least 30 days&apos; advance notice. Continued use of the
                Service after the effective date of a price change constitutes your acceptance of the new price.
              </p>
            </SubSection>

            <SubSection title="4.5 Refunds">
              <p>
                Subscription fees are non-refundable except where required by applicable law. If you cancel a paid
                plan, you will retain access until the end of the current billing period.
              </p>
            </SubSection>

            <SubSection title="4.6 Failed Payments">
              <p>
                If a payment fails, we will notify you and may suspend your account until the outstanding amount is
                settled. Repeated failed payments may result in account termination.
              </p>
            </SubSection>

            <SubSection title="4.7 Taxes">
              <p>
                Prices are exclusive of applicable taxes. You are responsible for all taxes, duties, or levies imposed
                by your local authority in connection with your use of the Service.
              </p>
            </SubSection>
          </Section>

          <Section title="5. Acceptable Use">
            <p>You agree not to use the Service to:</p>
            <ul>
              <li>Violate any applicable law or regulation.</li>
              <li>Transmit malware, viruses, or any other malicious code.</li>
              <li>Attempt to gain unauthorized access to any system or data.</li>
              <li>Harass, abuse, or harm any person.</li>
              <li>Send spam or unsolicited messages through any API integration.</li>
              <li>Reverse-engineer, decompile, or disassemble any part of the Service.</li>
              <li>Use the Service to build a competing product.</li>
              <li>Exceed rate limits or attempt to circumvent usage restrictions.</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate your account immediately if we determine, in our sole
              discretion, that you have violated these acceptable use standards.
            </p>
          </Section>

          <Section title="6. Intellectual Property">
            <p>
              All content, trademarks, logos, and software related to the Service are the intellectual property of
              {COMPANY} or its licensors. You are granted a limited, non-exclusive, non-transferable license to use
              the Service solely for its intended purpose.
            </p>
            <p>
              You retain ownership of all data and content you submit through the Service (&ldquo;User Data&rdquo;).
              By submitting User Data, you grant {COMPANY} a limited license to store and process it solely to provide
              the Service.
            </p>
          </Section>

          <Section title="7. Data and Privacy">
            <p>
              Your use of the Service is subject to our{' '}
              <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</Link>, which
              describes how we collect, use, and protect your data. By using the Service, you consent to those practices.
            </p>
          </Section>

          <Section title="8. Disclaimer of Warranties">
            <p>
              THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY
              KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR
              A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
              ERROR-FREE, OR COMPLETELY SECURE.
            </p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, {COMPANY.toUpperCase()} AND ITS AFFILIATES SHALL NOT BE LIABLE
              FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS,
              DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE, EVEN IF WE HAVE BEEN
              ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p>
              IN NO EVENT WILL OUR TOTAL LIABILITY TO YOU EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID US IN THE
              12 MONTHS PRECEDING THE CLAIM OR (B) USD 100.
            </p>
          </Section>

          <Section title="10. Termination">
            <p>
              You may terminate your account at any time by contacting us or using the account deletion feature in
              the dashboard. Upon termination, your right to use the Service ceases immediately. We may retain certain
              data as required by law or legitimate business purposes.
            </p>
            <p>
              We may suspend or terminate your account without notice if you violate these Terms, fail to pay
              applicable fees, or if we are required to do so by law.
            </p>
          </Section>

          <Section title="11. Governing Law and Dispute Resolution">
            <p>
              These Terms are governed by and construed in accordance with the laws of the {GOVERNING_LAW}, without
              regard to conflict-of-law principles. Any disputes arising under these Terms shall be resolved through
              binding arbitration or in the courts of the {GOVERNING_LAW}, and you consent to the exclusive
              jurisdiction of such courts.
            </p>
          </Section>

          <Section title="12. Changes to These Terms">
            <p>
              We may update these Terms at any time. If we make material changes, we will notify you by email or by
              displaying a prominent notice in the Service at least 14 days before the changes take effect. Your
              continued use of the Service after the effective date constitutes acceptance of the revised Terms.
            </p>
          </Section>

          <Section title="13. Contact Us">
            <p>
              If you have any questions about these Terms, please contact us at{' '}
              <a href={`mailto:${EMAIL}`} className="text-indigo-400 hover:text-indigo-300">{EMAIL}</a>.
            </p>
          </Section>

        </div>

        <div className="mt-12 border-t border-zinc-800 pt-6 flex flex-wrap gap-4 text-sm text-zinc-500">
          <Link href="/privacy" className="hover:text-zinc-300">Privacy Policy</Link>
          <Link href="/" className="hover:text-zinc-300">Back to home</Link>
        </div>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed">{children}</div>
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
      <div className="space-y-2 text-sm leading-relaxed">{children}</div>
    </div>
  )
}
