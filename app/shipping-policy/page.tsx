import Link from 'next/link';

export default function ShippingPolicy() {
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
        <h1 className="text-4xl font-bold mb-4">Shipping Policy</h1>
        <p className="text-gray-600 mb-8">Last Updated: November 15, 2025</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Overview</h2>
            <p className="mb-4">
              At ReLuma, we're committed to getting your skincare products to you quickly and safely. This
              shipping policy outlines our shipping methods, costs, delivery times, and procedures.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Processing Time</h2>
            <p className="mb-4">
              All orders are processed within <strong>1-2 business days</strong> (Monday-Friday, excluding holidays).
              Orders placed on weekends or holidays will be processed the next business day.
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Order Received:</strong> You'll receive an order confirmation email immediately</li>
              <li><strong>Processing:</strong> 1-2 business days</li>
              <li><strong>Shipment:</strong> You'll receive a shipping confirmation email with tracking information</li>
            </ul>
            <p className="mb-4">
              <em>Note: Processing times may be longer during promotional periods or holidays. We'll notify
              you of any expected delays.</em>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Shipping Methods & Costs</h2>

            <h3 className="text-xl font-semibold mb-3">3.1 Domestic Shipping (United States)</h3>
            <div className="mb-4">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">Method</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Delivery Time</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Standard Shipping</td>
                    <td className="border border-gray-300 px-4 py-2">5-7 business days</td>
                    <td className="border border-gray-300 px-4 py-2">$5.95</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Express Shipping</td>
                    <td className="border border-gray-300 px-4 py-2">2-3 business days</td>
                    <td className="border border-gray-300 px-4 py-2">$12.95</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Overnight Shipping</td>
                    <td className="border border-gray-300 px-4 py-2">1 business day</td>
                    <td className="border border-gray-300 px-4 py-2">$24.95</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mb-4">
              <strong>FREE Standard Shipping on orders over $75!</strong>
            </p>

            <h3 className="text-xl font-semibold mb-3">3.2 International Shipping</h3>
            <p className="mb-4">
              We currently ship to select international destinations. International shipping rates are calculated
              at checkout based on destination and package weight.
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Delivery Time:</strong> 7-21 business days depending on destination</li>
              <li><strong>Cost:</strong> Calculated at checkout (typically $15-$45)</li>
              <li><strong>Customs & Duties:</strong> Customer is responsible for all customs fees and import duties</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Delivery Estimates</h2>
            <p className="mb-4">
              Delivery estimates are calculated from the date of shipment, not the date of order placement.
              Our shipping partners are:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>USPS (United States Postal Service)</li>
              <li>UPS (United Parcel Service)</li>
              <li>FedEx</li>
            </ul>
            <p className="mb-4">
              <strong>Important:</strong> Delivery times are estimates and not guaranteed. We are not responsible
              for delays caused by shipping carriers, customs, weather conditions, or other factors beyond our control.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Order Tracking</h2>
            <p className="mb-4">
              Once your order ships, you'll receive:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>A shipping confirmation email</li>
              <li>A tracking number</li>
              <li>A link to track your package</li>
            </ul>
            <p className="mb-4">
              You can also track your order by:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Logging into your ReLuma account</li>
              <li>Visiting the carrier's website directly with your tracking number</li>
              <li>Contacting our customer service team</li>
            </ul>
            <p className="mb-4">
              <em>Note: Tracking information may take 24-48 hours to become active after shipment.</em>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Shipping Address</h2>
            <h3 className="text-xl font-semibold mb-3">6.1 Address Accuracy</h3>
            <p className="mb-4">
              Please ensure your shipping address is complete and accurate. We are not responsible for orders
              shipped to incorrect addresses provided by the customer.
            </p>

            <h3 className="text-xl font-semibold mb-3">6.2 Address Changes</h3>
            <p className="mb-4">
              If you need to change your shipping address:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Before Shipment:</strong> Contact us immediately at support@reluma.com and we'll update your address</li>
              <li><strong>After Shipment:</strong> Contact the carrier directly to request an address change (fees may apply)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">6.3 P.O. Boxes</h3>
            <p className="mb-4">
              We can ship to P.O. Boxes via USPS only. Express and overnight shipping options are not available
              for P.O. Box addresses.
            </p>

            <h3 className="text-xl font-semibold mb-3">6.4 Military Addresses (APO/FPO/DPO)</h3>
            <p className="mb-4">
              We ship to APO/FPO/DPO addresses via USPS. Delivery times may vary depending on location.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Lost or Stolen Packages</h2>
            <p className="mb-4">
              If your package is marked as delivered but you haven't received it:
            </p>
            <ol className="list-decimal pl-6 mb-4">
              <li className="mb-2">Check with neighbors or building management</li>
              <li className="mb-2">Look for a delivery notice from the carrier</li>
              <li className="mb-2">Check all possible delivery locations around your address</li>
              <li className="mb-2">Wait 24-48 hours (sometimes packages are marked delivered early)</li>
              <li className="mb-2">Contact the shipping carrier to file a claim</li>
              <li className="mb-2">Contact us at support@reluma.com within 7 days of the delivery date</li>
            </ol>
            <p className="mb-4">
              We'll work with you and the carrier to resolve the issue. In most cases, we'll send a replacement
              or issue a refund once the carrier confirms the package is lost.
            </p>
            <p className="mb-4">
              <strong>Important:</strong> We are not responsible for packages stolen after confirmed delivery.
              We recommend using a secure delivery location or requiring a signature for delivery.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Damaged Packages</h2>
            <p className="mb-4">
              If your package arrives damaged:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Take photos of the damaged packaging and product</li>
              <li>Keep all packaging materials</li>
              <li>Contact us immediately at support@reluma.com</li>
              <li>Include your order number and photos in your email</li>
            </ul>
            <p className="mb-4">
              We'll send a replacement or issue a full refund at no cost to you.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Undeliverable Packages</h2>
            <p className="mb-4">
              Packages that are returned to us as undeliverable due to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Incorrect address provided by customer</li>
              <li>Multiple failed delivery attempts</li>
              <li>Refused delivery</li>
              <li>Unclaimed package</li>
            </ul>
            <p className="mb-4">
              Will be refunded minus the original shipping costs and a 15% restocking fee. If you'd like us to
              reship the order, you'll need to pay for shipping again.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. International Shipping Details</h2>
            <h3 className="text-xl font-semibold mb-3">10.1 Customs & Import Duties</h3>
            <p className="mb-4">
              International customers are responsible for:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>All customs fees and import duties</li>
              <li>Any taxes required by their country</li>
              <li>Compliance with local import regulations</li>
            </ul>
            <p className="mb-4">
              We cannot predict or control these charges, and we cannot mark packages as gifts or reduce the
              declared value to avoid customs fees.
            </p>

            <h3 className="text-xl font-semibold mb-3">10.2 Customs Delays</h3>
            <p className="mb-4">
              International shipments may be subject to customs inspections, which can cause delays beyond our
              delivery estimates. We are not responsible for customs delays.
            </p>

            <h3 className="text-xl font-semibold mb-3">10.3 Restricted Countries</h3>
            <p className="mb-4">
              We cannot ship to countries subject to U.S. trade embargoes or restrictions. Please check if your
              country is eligible for shipping before placing an order.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">11. Multiple Item Orders</h2>
            <p className="mb-4">
              Orders containing multiple items may be shipped in separate packages to ensure faster delivery.
              You'll receive separate tracking numbers for each package.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">12. Shipping During Extreme Weather</h2>
            <p className="mb-4">
              While our products are formulated to withstand various temperatures, we may delay shipments during
              extreme weather conditions to protect product quality. We'll notify you of any weather-related delays.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">13. Subscription Orders</h2>
            <p className="mb-4">
              For subscription orders:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Shipments are automatically sent based on your subscription frequency</li>
              <li>You'll receive tracking information for each shipment</li>
              <li>You can modify your shipping address in your account settings</li>
              <li>Subscriptions qualify for free shipping (where applicable)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">14. Contact Us</h2>
            <p className="mb-4">
              If you have questions about shipping or need assistance with your order:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Email: support@reluma.com</li>
              <li>Phone: 1-800-RELUMA-1 (Monday-Friday, 9 AM - 5 PM EST)</li>
              <li>Live Chat: Available on our website during business hours</li>
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
            <Link href="/refund-policy" className="hover:text-gray-900">Return & Refund Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
