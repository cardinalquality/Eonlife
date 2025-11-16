import Link from 'next/link';

export default function RefundPolicy() {
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
        <h1 className="text-4xl font-bold mb-4">Return & Refund Policy</h1>
        <p className="text-gray-600 mb-8">Last Updated: November 15, 2025</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Our Commitment</h2>
            <p className="mb-4">
              At ReLuma, we stand behind the quality of our products. We want you to be completely satisfied
              with your purchase. If you're not satisfied for any reason, we offer a hassle-free return and
              refund process.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Return Window</h2>
            <p className="mb-4">
              You may return most new, unopened items within <strong>30 days of delivery</strong> for a full refund.
              We also accept returns of opened items under certain conditions (see below).
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Unopened Products:</strong> Full refund within 30 days</li>
              <li><strong>Opened Products:</strong> Refund or exchange within 30 days if product caused an adverse reaction or is defective</li>
              <li><strong>After 30 Days:</strong> Please contact us at support@reluma.com to discuss options</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Return Conditions</h2>
            <h3 className="text-xl font-semibold mb-3">3.1 Unopened Products</h3>
            <p className="mb-4">To be eligible for a return, unopened products must:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Be in original packaging</li>
              <li>Have all security seals intact</li>
              <li>Include all original components and documentation</li>
              <li>Be returned within 30 days of delivery</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">3.2 Opened Products</h3>
            <p className="mb-4">We accept returns of opened products in the following cases:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Adverse Reactions:</strong> If you experience an allergic reaction or skin irritation</li>
              <li><strong>Defective Products:</strong> If the product is damaged, expired, or otherwise defective</li>
              <li><strong>Wrong Item Sent:</strong> If we sent you the wrong product</li>
            </ul>
            <p className="mb-4">
              <em>Note: For health and safety reasons, we cannot accept returns of opened products that were
              simply unwanted or changed your mind about.</em>
            </p>

            <h3 className="text-xl font-semibold mb-3">3.3 Non-Returnable Items</h3>
            <p className="mb-4">The following items cannot be returned:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Gift cards</li>
              <li>Products purchased on final sale or clearance</li>
              <li>Opened products without a valid reason (as outlined above)</li>
              <li>Products returned after 60 days from delivery</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. How to Initiate a Return</h2>
            <p className="mb-4">To start a return:</p>
            <ol className="list-decimal pl-6 mb-4">
              <li className="mb-2">
                <strong>Contact Us:</strong> Email support@reluma.com or call 1-800-RELUMA-1 with your order
                number and reason for return
              </li>
              <li className="mb-2">
                <strong>Receive Authorization:</strong> We'll provide you with a Return Authorization Number (RAN)
                and return shipping instructions
              </li>
              <li className="mb-2">
                <strong>Package the Item:</strong> Securely pack the product in its original packaging if possible
              </li>
              <li className="mb-2">
                <strong>Include Documentation:</strong> Include your RAN and a copy of your order confirmation
              </li>
              <li className="mb-2">
                <strong>Ship the Item:</strong> Send the package to the address provided in your return authorization
              </li>
            </ol>
            <p className="mb-4">
              <strong>Important:</strong> Do not ship returns without first obtaining a Return Authorization Number.
              Unauthorized returns may not be processed.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Return Shipping Costs</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>
                <strong>Defective or Wrong Items:</strong> We'll provide a prepaid return shipping label at no cost to you
              </li>
              <li>
                <strong>Change of Mind (Unopened):</strong> You are responsible for return shipping costs
              </li>
              <li>
                <strong>International Returns:</strong> Customer is responsible for all return shipping costs and customs fees
              </li>
            </ul>
            <p className="mb-4">
              We recommend using a trackable shipping service or purchasing shipping insurance. We cannot
              guarantee that we will receive your returned item.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Refund Processing</h2>
            <h3 className="text-xl font-semibold mb-3">6.1 Timeline</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Inspection:</strong> 3-5 business days after we receive your return</li>
              <li><strong>Refund Issued:</strong> 5-7 business days after approval</li>
              <li><strong>Credit to Account:</strong> 3-10 business days depending on your bank/card issuer</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">6.2 Refund Method</h3>
            <p className="mb-4">
              Refunds will be issued to the original payment method used for the purchase. If the original
              payment method is no longer available, please contact us to arrange an alternative refund method.
            </p>

            <h3 className="text-xl font-semibold mb-3">6.3 Partial Refunds</h3>
            <p className="mb-4">Partial refunds may be granted in the following situations:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Products showing obvious signs of use beyond testing</li>
              <li>Products returned damaged due to improper packaging</li>
              <li>Products missing components or documentation</li>
              <li>Products returned outside the 30-day window (at our discretion)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Exchanges</h2>
            <p className="mb-4">
              We do not offer direct exchanges. If you need to exchange an item:
            </p>
            <ol className="list-decimal pl-6 mb-4">
              <li>Return the original item for a refund</li>
              <li>Place a new order for the desired product</li>
            </ol>
            <p className="mb-4">
              This ensures you receive your new item as quickly as possible while your return is being processed.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Damaged or Defective Items</h2>
            <p className="mb-4">
              If you receive a damaged or defective item:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Contact us immediately at support@reluma.com</li>
              <li>Provide photos of the damage/defect</li>
              <li>Keep all original packaging</li>
              <li>Do not use the product if it appears damaged or defective</li>
            </ul>
            <p className="mb-4">
              We will provide a replacement or full refund at no cost to you, including return shipping.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Wrong Item Received</h2>
            <p className="mb-4">
              If we sent you the wrong item:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Contact us within 7 days of delivery</li>
              <li>We'll send you the correct item at no additional charge</li>
              <li>We'll provide a prepaid return label for the wrong item</li>
              <li>You don't need to wait for us to receive the wrong item before we ship the correct one</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. Subscription Orders</h2>
            <p className="mb-4">
              For subscription orders:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>You can cancel your subscription at any time</li>
              <li>Cancellations must be made before the next billing cycle to avoid charges</li>
              <li>Already shipped subscription boxes follow the standard return policy</li>
              <li>Refunds for subscription charges follow the same timeline as regular orders</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">11. International Orders</h2>
            <p className="mb-4">
              For international orders:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Customers are responsible for all return shipping costs</li>
              <li>Customers are responsible for any customs fees or import duties on returns</li>
              <li>Refunds do not include original shipping costs or customs fees</li>
              <li>We recommend purchasing shipping insurance for high-value returns</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">12. Late or Missing Refunds</h2>
            <p className="mb-4">
              If you haven't received your refund yet:
            </p>
            <ol className="list-decimal pl-6 mb-4">
              <li>Check your bank account again</li>
              <li>Contact your credit card company (it may take time for refund to officially post)</li>
              <li>Contact your bank (processing time varies by institution)</li>
              <li>If you've done all of this and still haven't received your refund, contact us at support@reluma.com</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">13. Restocking Fees</h2>
            <p className="mb-4">
              We do not charge restocking fees for standard returns. However, we reserve the right to deduct
              reasonable costs from refunds in cases of:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Excessive or abusive returns</li>
              <li>Items returned significantly damaged due to customer negligence</li>
              <li>Returns that do not meet our stated conditions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">14. Fraudulent Returns</h2>
            <p className="mb-4">
              We reserve the right to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Refuse returns that appear fraudulent or abusive</li>
              <li>Limit or refuse future purchases from customers with excessive return rates</li>
              <li>Take legal action in cases of return fraud</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">15. Contact Us</h2>
            <p className="mb-4">
              If you have questions about our Return & Refund Policy or need assistance with a return:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Email: support@reluma.com</li>
              <li>Phone: 1-800-RELUMA-1 (Monday-Friday, 9 AM - 5 PM EST)</li>
              <li>Mail: ReLuma Returns Department, [Your Company Address]</li>
            </ul>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
            <Link href="/shipping-policy" className="hover:text-gray-900">Shipping Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
