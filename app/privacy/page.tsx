import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-900 text-white py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-white hover:text-gray-300 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last Updated: November 15, 2025</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to ReLuma. We respect your privacy and are committed to protecting your personal data.
              This privacy policy will inform you about how we look after your personal data when you visit
              our website and tell you about your privacy rights and how the law protects you.
            </p>
            <p className="mb-4">
              ReLuma is committed to complying with the General Data Protection Regulation (GDPR),
              California Consumer Privacy Act (CCPA), and other applicable privacy laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Contact Information</h2>
            <p className="mb-4">
              If you have any questions about this privacy policy or our privacy practices, please contact us:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Email: privacy@reluma.com</li>
              <li>Phone: 1-800-RELUMA-1</li>
              <li>Address: [Your Company Address]</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Data We Collect</h2>
            <p className="mb-4">We may collect, use, store and transfer different kinds of personal data about you:</p>

            <h3 className="text-xl font-semibold mb-3">3.1 Information You Provide</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Identity Data:</strong> First name, last name, username or similar identifier</li>
              <li><strong>Contact Data:</strong> Email address, telephone number, billing and shipping addresses</li>
              <li><strong>Financial Data:</strong> Payment card details (processed securely by our payment processor)</li>
              <li><strong>Transaction Data:</strong> Details about payments to and from you and other details of products purchased</li>
              <li><strong>Marketing Data:</strong> Your preferences in receiving marketing from us and your communication preferences</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">3.2 Information We Collect Automatically</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Technical Data:</strong> IP address, browser type and version, time zone setting, browser plug-in types and versions, operating system and platform</li>
              <li><strong>Usage Data:</strong> Information about how you use our website, products and services</li>
              <li><strong>Cookie Data:</strong> Information collected through cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. How We Use Your Data</h2>
            <p className="mb-4">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Order Fulfillment:</strong> To process and deliver your orders, manage payments, and communicate with you about your orders</li>
              <li><strong>Customer Service:</strong> To provide customer support and respond to your inquiries</li>
              <li><strong>Marketing:</strong> To send you promotional materials and special offers (with your consent)</li>
              <li><strong>Analytics:</strong> To understand how customers use our website and improve our services</li>
              <li><strong>Legal Compliance:</strong> To comply with legal obligations and protect our rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Third-Party Services</h2>
            <p className="mb-4">We use the following third-party services that may collect your data:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Stripe:</strong> Payment processing (see Stripe's privacy policy at stripe.com/privacy)</li>
              <li><strong>SendGrid:</strong> Email delivery and marketing campaigns</li>
              <li><strong>Google Analytics:</strong> Website analytics and performance tracking</li>
              <li><strong>Hosting Provider:</strong> Website hosting and data storage</li>
            </ul>
            <p className="mb-4">
              These third parties have their own privacy policies and we encourage you to review them.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Cookies</h2>
            <p className="mb-4">
              Our website uses cookies to distinguish you from other users and provide you with a good
              experience. Cookies are small text files that are placed on your device when you visit our website.
            </p>
            <h3 className="text-xl font-semibold mb-3">Types of Cookies We Use:</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Strictly Necessary Cookies:</strong> Required for the operation of our website</li>
              <li><strong>Analytical/Performance Cookies:</strong> Allow us to recognize and count visitors and see how visitors move around our website</li>
              <li><strong>Functionality Cookies:</strong> Used to recognize you when you return to our website</li>
              <li><strong>Targeting Cookies:</strong> Record your visit to our website and the pages you visit</li>
            </ul>
            <p className="mb-4">
              You can manage your cookie preferences through our cookie consent banner or your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Data Retention</h2>
            <p className="mb-4">
              We will only retain your personal data for as long as necessary to fulfill the purposes we collected
              it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Account Data:</strong> Retained while your account is active and for 7 years after account closure for legal and tax purposes</li>
              <li><strong>Transaction Data:</strong> Retained for 7 years for legal and tax purposes</li>
              <li><strong>Marketing Data:</strong> Retained until you unsubscribe or withdraw consent</li>
              <li><strong>Analytics Data:</strong> Anonymized after 26 months</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Your Rights (GDPR)</h2>
            <p className="mb-4">Under GDPR, you have the following rights:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate personal data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Right to Restrict Processing:</strong> Request restriction of processing your personal data</li>
              <li><strong>Right to Data Portability:</strong> Request transfer of your personal data to another party</li>
              <li><strong>Right to Object:</strong> Object to processing of your personal data</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
            </ul>
            <p className="mb-4">
              To exercise any of these rights, please contact us at privacy@reluma.com or use the data management
              tools in your account settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. California Privacy Rights (CCPA)</h2>
            <p className="mb-4">If you are a California resident, you have additional rights:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Right to Know:</strong> Request information about the personal data we collect and how we use it</li>
              <li><strong>Right to Delete:</strong> Request deletion of your personal data</li>
              <li><strong>Right to Opt-Out:</strong> Opt-out of the sale of your personal data (we do not sell personal data)</li>
              <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. Data Export</h2>
            <p className="mb-4">
              You have the right to request a copy of all personal data we hold about you. This will be provided
              in a structured, commonly used and machine-readable format (JSON). You can request a data export
              from your account settings or by contacting privacy@reluma.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">11. Account Deletion</h2>
            <p className="mb-4">
              You have the right to request deletion of your account and personal data at any time. Please note:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>You cannot delete your account if you have pending orders</li>
              <li>Some data may be retained for legal and tax purposes (anonymized)</li>
              <li>Deletion is permanent and cannot be undone</li>
            </ul>
            <p className="mb-4">
              To delete your account, visit your account settings or contact us at privacy@reluma.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">12. Data Security</h2>
            <p className="mb-4">
              We have put in place appropriate security measures to prevent your personal data from being
              accidentally lost, used or accessed in an unauthorized way, altered or disclosed. We use:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Encrypted data storage</li>
              <li>Access controls and authentication</li>
              <li>Regular security audits and updates</li>
              <li>Employee training on data protection</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">13. International Data Transfers</h2>
            <p className="mb-4">
              Your personal data may be transferred to and processed in countries outside of your country of
              residence. We ensure that such transfers are conducted in accordance with applicable laws and
              provide adequate protection for your personal data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">14. Children's Privacy</h2>
            <p className="mb-4">
              Our services are not intended for children under 16 years of age. We do not knowingly collect
              personal data from children under 16. If you are a parent or guardian and believe your child has
              provided us with personal data, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">15. Changes to This Policy</h2>
            <p className="mb-4">
              We may update this privacy policy from time to time. We will notify you of any changes by posting
              the new privacy policy on this page and updating the "Last Updated" date. We encourage you to review
              this privacy policy periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">16. Complaints</h2>
            <p className="mb-4">
              If you have any concerns about our use of your personal data, you can make a complaint to us at
              privacy@reluma.com. You also have the right to lodge a complaint with your local data protection
              authority.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
            <Link href="/refund-policy" className="hover:text-gray-900">Return & Refund Policy</Link>
            <Link href="/shipping-policy" className="hover:text-gray-900">Shipping Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
