import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for BugReport — how we collect, use, and protect your data.',
}

const EFFECTIVE_DATE = 'June 1, 2026'
const COMPANY = 'BugReport'
const EMAIL = 'support@bugreportmanager.vercel.app'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="text-sm text-indigo-400 hover:text-indigo-300">← Back to home</Link>
          <h1 className="mt-4 text-3xl font-bold text-zinc-100">Privacy Policy</h1>
          <p className="mt-2 text-sm text-zinc-500">Effective date: {EFFECTIVE_DATE}</p>
        </div>

        <div className="prose-legal space-y-10 text-zinc-300">

          <Section title="1. Introduction">
            <p>
              {COMPANY} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed to protecting your
              personal information. This Privacy Policy explains what data we collect, how we use it, and your rights
              regarding that data when you use our Service.
            </p>
            <p>
              By using the Service, you agree to the collection and use of information in accordance with this policy.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <SubSection title="2.1 Account Information">
              <p>When you register, we collect:</p>
              <ul>
                <li>Name and email address</li>
                <li>Password (stored as a bcrypt hash — we never store plain-text passwords)</li>
                <li>Profile picture (from OAuth providers, if applicable)</li>
                <li>User role / occupation (e.g., student, developer) — provided during onboarding</li>
                <li>How you heard about us — provided during onboarding</li>
                <li>Date and time of Terms acceptance</li>
              </ul>
            </SubSection>

            <SubSection title="2.2 Usage Data">
              <p>We automatically collect:</p>
              <ul>
                <li>IP address and approximate location (country/city level)</li>
                <li>Browser type and operating system</li>
                <li>Pages visited and features used within the dashboard</li>
                <li>Last seen timestamp</li>
              </ul>
            </SubSection>

            <SubSection title="2.3 Application and Bug Report Data">
              <p>
                When you use the API, we store the bug reports, feedback, and application metadata you submit. This
                data may contain personal information about your end-users (e.g., reporter email addresses). You are
                responsible for ensuring your end-users are informed and have consented to such data being processed.
              </p>
            </SubSection>

            <SubSection title="2.4 Payment Data">
              <p>
                Payment information (card numbers, bank account details) is processed directly by{' '}
                <strong className="text-zinc-100">Midtrans</strong> and is never stored on our servers. We only
                store your subscription status, plan type, and a Midtrans subscription reference ID.
              </p>
              <p>
                Midtrans&apos; handling of your payment data is governed by the{' '}
                <a href="/midtrans-tnc.pdf" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
                  Midtrans Terms and Conditions
                </a>{' '}
                and their own privacy policy.
              </p>
            </SubSection>

            <SubSection title="2.5 OAuth Data">
              <p>
                If you sign in with Google or GitHub, we receive your name, email address, profile picture, and a
                provider-specific user ID. We do not receive or store your OAuth access tokens after the sign-in
                process is complete.
              </p>
            </SubSection>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use the data we collect to:</p>
            <ul>
              <li>Create and manage your account</li>
              <li>Provide, maintain, and improve the Service</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send transactional emails (account confirmations, password resets, subscription receipts)</li>
              <li>Respond to support requests</li>
              <li>Detect and prevent fraud, abuse, and security incidents</li>
              <li>Comply with legal obligations</li>
              <li>Analyze aggregate usage trends to improve the product (anonymized)</li>
            </ul>
            <p>We do not sell your personal data to third parties.</p>
          </Section>

          <Section title="4. Data Sharing and Third-Party Services">
            <p>We share data with the following third parties only as necessary to provide the Service:</p>
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Purpose</th>
                  <th>Data Shared</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Midtrans (PT Midtrans)</td>
                  <td>Payment processing</td>
                  <td>Name, email, billing amount</td>
                </tr>
                <tr>
                  <td>Google OAuth</td>
                  <td>Social login</td>
                  <td>OAuth token (transient)</td>
                </tr>
                <tr>
                  <td>GitHub OAuth</td>
                  <td>Social login</td>
                  <td>OAuth token (transient)</td>
                </tr>
                <tr>
                  <td>Vercel</td>
                  <td>Hosting &amp; infrastructure</td>
                  <td>Request logs, IP addresses</td>
                </tr>
                <tr>
                  <td>Trello (Atlassian)</td>
                  <td>Bug-to-card integration (optional)</td>
                  <td>Bug title, description (only when enabled by you)</td>
                </tr>
              </tbody>
            </table>
            <p>
              We require all third-party service providers to maintain adequate privacy and security standards
              consistent with applicable law.
            </p>
          </Section>

          <Section title="5. Cookies and Tracking">
            <p>We use the following cookies:</p>
            <ul>
              <li>
                <strong className="text-zinc-200">Session cookie</strong> (<code>brm_session</code>) — an httpOnly,
                secure JWT cookie that keeps you logged in for 7 days. No tracking; strictly necessary.
              </li>
              <li>
                <strong className="text-zinc-200">OAuth state cookie</strong> (<code>oauth_state</code>) — a
                short-lived (10-minute) cookie used to prevent CSRF during social login. Deleted after use.
              </li>
            </ul>
            <p>We do not use advertising cookies or third-party tracking pixels.</p>
          </Section>

          <Section title="6. Data Retention">
            <p>
              We retain your account data for as long as your account is active. If you delete your account, we will
              delete your personal data within 30 days, except where we are required to retain it for legal or
              compliance purposes (e.g., transaction records for tax purposes, which may be retained for up to 5 years).
            </p>
            <p>
              Bug reports and feedback submitted through your API key are deleted immediately when you delete the
              associated application.
            </p>
          </Section>

          <Section title="7. Data Security">
            <p>
              We implement industry-standard security measures including:
            </p>
            <ul>
              <li>HTTPS/TLS encryption for all data in transit</li>
              <li>Passwords hashed with bcrypt (12 rounds)</li>
              <li>API keys stored as randomly generated 48-character hex strings</li>
              <li>HttpOnly, Secure session cookies to prevent XSS-based session theft</li>
              <li>Rate limiting on authentication endpoints to prevent brute-force attacks</li>
            </ul>
            <p>
              No method of transmission over the internet or electronic storage is 100% secure. While we strive to
              protect your data, we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="8. Your Rights">
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li><strong className="text-zinc-200">Access</strong> — request a copy of the personal data we hold about you</li>
              <li><strong className="text-zinc-200">Rectification</strong> — request correction of inaccurate data</li>
              <li><strong className="text-zinc-200">Erasure</strong> — request deletion of your account and associated data</li>
              <li><strong className="text-zinc-200">Portability</strong> — request an export of your data in a machine-readable format (CSV export available in the dashboard)</li>
              <li><strong className="text-zinc-200">Objection</strong> — object to certain types of processing</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{' '}
              <a href={`mailto:${EMAIL}`} className="text-indigo-400 hover:text-indigo-300">{EMAIL}</a>. We will
              respond within 30 days.
            </p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>
              The Service is not directed to children under the age of 13. We do not knowingly collect personal
              information from children under 13. If you believe a child has provided us with personal data, please
              contact us immediately.
            </p>
          </Section>

          <Section title="10. International Data Transfers">
            <p>
              Our servers are hosted on Vercel infrastructure. By using the Service, you acknowledge that your data
              may be transferred to and processed in countries outside your own, which may have different data
              protection laws. We take appropriate measures to ensure such transfers comply with applicable law.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by email
              or by displaying a notice in the Service. The &ldquo;Effective date&rdquo; at the top of this page
              will always reflect the most recent revision.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>
              For privacy-related questions or requests, contact us at:{' '}
              <a href={`mailto:${EMAIL}`} className="text-indigo-400 hover:text-indigo-300">{EMAIL}</a>
            </p>
          </Section>

        </div>

        <div className="mt-12 border-t border-zinc-800 pt-6 flex flex-wrap gap-4 text-sm text-zinc-500">
          <Link href="/terms" className="hover:text-zinc-300">Terms and Conditions</Link>
          <a href="/midtrans-tnc.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300">Midtrans T&amp;C (PDF)</a>
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
