import Link from 'next/link';

export default function TermsOfService() {
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
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last Updated: November 15, 2025</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
            <p className="mb-4">
              By accessing or using ReLuma's website and services, you agree to be bound by these Terms of Service
              and all applicable laws and regulations. If you do not agree with any of these terms, you are
              prohibited from using or accessing this site.
            </p>
            <p className="mb-4">
              <strong>IMPORTANT:</strong> These terms contain a mandatory arbitration provision that requires the
              use of arbitration on an individual basis to resolve disputes, rather than jury trials or class actions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Definitions</h2>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>"Company," "we," "us," or "our"</strong> refers to ReLuma</li>
              <li><strong>"User," "you," or "your"</strong> refers to the individual accessing or using our services</li>
              <li><strong>"Services"</strong> refers to our website, products, and all related services</li>
              <li><strong>"Products"</strong> refers to the skincare products sold by ReLuma</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Account Creation</h2>
            <h3 className="text-xl font-semibold mb-3">3.1 Account Requirements</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>You must be at least 18 years old to create an account</li>
              <li>You must provide accurate, current, and complete information</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You are responsible for all activities that occur under your account</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">3.2 Account Security</h3>
            <p className="mb-4">
              You must immediately notify us of any unauthorized use of your account or any other breach of
              security. We will not be liable for any loss or damage arising from your failure to comply with
              this security obligation.
            </p>

            <h3 className="text-xl font-semibold mb-3">3.3 Account Termination</h3>
            <p className="mb-4">
              We reserve the right to suspend or terminate your account at any time for any reason, including
              but not limited to violation of these Terms of Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Use Restrictions</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Use our services for any unlawful purpose or in violation of any applicable laws</li>
              <li>Attempt to gain unauthorized access to our systems or networks</li>
              <li>Interfere with or disrupt our services or servers</li>
              <li>Use any automated system to access our website without our permission</li>
              <li>Collect or harvest any personally identifiable information from our services</li>
              <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
              <li>Reproduce, duplicate, copy, sell, resell or exploit any portion of our services</li>
              <li>Use our services to transmit any viruses, worms, or malicious code</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Intellectual Property Rights</h2>
            <h3 className="text-xl font-semibold mb-3">5.1 Our Rights</h3>
            <p className="mb-4">
              The content, organization, graphics, design, compilation, and other matters related to our
              website and services are protected under applicable copyrights, trademarks, and other proprietary
              rights. All trademarks, service marks, and trade names are proprietary to ReLuma or other
              respective owners.
            </p>

            <h3 className="text-xl font-semibold mb-3">5.2 Limited License</h3>
            <p className="mb-4">
              We grant you a limited, non-exclusive, non-transferable license to access and use our services
              for personal, non-commercial purposes only. This license does not include:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Any resale or commercial use of our services or content</li>
              <li>Any derivative use of our services or content</li>
              <li>Any downloading or copying of account information for the benefit of another merchant</li>
              <li>Any use of data mining, robots, or similar data gathering and extraction tools</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Product Information and Orders</h2>
            <h3 className="text-xl font-semibold mb-3">6.1 Product Descriptions</h3>
            <p className="mb-4">
              We attempt to be as accurate as possible in our product descriptions. However, we do not warrant
              that product descriptions or other content is accurate, complete, reliable, current, or error-free.
            </p>

            <h3 className="text-xl font-semibold mb-3">6.2 Pricing</h3>
            <p className="mb-4">
              All prices are in USD unless otherwise stated and are subject to change without notice. We reserve
              the right to correct any pricing errors on our website or in orders.
            </p>

            <h3 className="text-xl font-semibold mb-3">6.3 Order Acceptance</h3>
            <p className="mb-4">
              We reserve the right to refuse or cancel any order for any reason, including but not limited to:
              product availability, errors in product or pricing information, or suspected fraud.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Payment Terms</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Payment is due at the time of purchase</li>
              <li>We accept major credit cards and other payment methods as displayed</li>
              <li>All payments are processed securely through our third-party payment processor (Stripe)</li>
              <li>You represent that you have the legal right to use any payment method provided</li>
              <li>You authorize us to charge your payment method for all fees incurred</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Disclaimer of Warranties</h2>
            <p className="mb-4">
              <strong>YOUR USE OF OUR SERVICES IS AT YOUR SOLE RISK. OUR SERVICES ARE PROVIDED "AS IS" AND
              "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.</strong>
            </p>
            <p className="mb-4">
              We do not warrant that:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Our services will be uninterrupted, timely, secure, or error-free</li>
              <li>The results obtained from using our services will be accurate or reliable</li>
              <li>The quality of any products or services purchased will meet your expectations</li>
              <li>Any errors in our services will be corrected</li>
            </ul>
            <p className="mb-4">
              <strong>Product Disclaimer:</strong> Results from using our products may vary. While we strive to
              provide high-quality skincare products, individual results may differ. Our products are cosmetic
              in nature and are not intended to diagnose, treat, cure, or prevent any disease.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
            <p className="mb-4">
              <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, RELUMA SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES,
              WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE
              LOSSES.</strong>
            </p>
            <p className="mb-4">
              Our total liability to you for all claims arising from or relating to our services shall not exceed
              the amount you paid to us in the twelve (12) months prior to the claim, or $100, whichever is greater.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. Indemnification</h2>
            <p className="mb-4">
              You agree to indemnify, defend, and hold harmless ReLuma, its officers, directors, employees, agents,
              and affiliates from any claims, liabilities, damages, losses, and expenses, including reasonable
              attorney's fees, arising out of or in any way connected with:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Your access to or use of our services</li>
              <li>Your violation of these Terms of Service</li>
              <li>Your violation of any third-party right, including any intellectual property or privacy right</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">11. Dispute Resolution</h2>
            <h3 className="text-xl font-semibold mb-3">11.1 Mandatory Arbitration</h3>
            <p className="mb-4">
              Any dispute, claim, or controversy arising out of or relating to these Terms of Service or your
              use of our services shall be settled by binding arbitration, except that either party may seek
              injunctive relief in court for infringement of intellectual property rights.
            </p>

            <h3 className="text-xl font-semibold mb-3">11.2 Class Action Waiver</h3>
            <p className="mb-4">
              <strong>YOU AND RELUMA AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS
              INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE
              PROCEEDING.</strong>
            </p>

            <h3 className="text-xl font-semibold mb-3">11.3 Informal Resolution</h3>
            <p className="mb-4">
              Before initiating arbitration, you agree to first contact us to attempt to resolve the dispute
              informally by sending a written notice to: legal@reluma.com
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">12. Governing Law</h2>
            <p className="mb-4">
              These Terms of Service shall be governed by and construed in accordance with the laws of
              [Your State/Country], without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">13. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these Terms of Service at any time. We will notify you of any
              material changes by posting the new Terms of Service on this page and updating the "Last Updated"
              date. Your continued use of our services after any such changes constitutes your acceptance of
              the new Terms of Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">14. Severability</h2>
            <p className="mb-4">
              If any provision of these Terms of Service is found to be unenforceable or invalid, that provision
              shall be limited or eliminated to the minimum extent necessary so that these Terms of Service shall
              otherwise remain in full force and effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">15. Entire Agreement</h2>
            <p className="mb-4">
              These Terms of Service, together with our Privacy Policy and any other legal notices published by
              us on our website, constitute the entire agreement between you and ReLuma concerning your use of
              our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">16. Contact Information</h2>
            <p className="mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Email: legal@reluma.com</li>
              <li>Phone: 1-800-RELUMA-1</li>
              <li>Address: [Your Company Address]</li>
            </ul>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
            <Link href="/refund-policy" className="hover:text-gray-900">Return & Refund Policy</Link>
            <Link href="/shipping-policy" className="hover:text-gray-900">Shipping Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
