import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TopStrip from '@/components/TopStrip';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopStrip />
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 mt-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headingOne text-center text-heading mb-6">
          Privacy Policy
        </h1>

        <p className="mb-4 text-md md:text-xl text-gray-600">
          This Privacy Policy outlines how Melita collects, uses, and protects personal data from our
          website visitors, customers, and Brand Partners. It reflects our commitment to safeguarding
          personal information and ensuring transparency about the data we collect and its usage.
        </p>

        <div className="prose max-w-none">
          {/* Information We Collect */}
          <h2 className="text-xl md:text-2xl font-semibold text-heading mt-8 mb-2">1. Information We Collect</h2>
          <p className="mb-4 text-md md:text-xl text-gray-600">
            Melita collects data to provide and improve our services, including:
          </p>
          <ul className="list-disc list-inside mb-4 text-md md:text-xl text-gray-600">
            <li>Personal identification information (Name, email address, phone number, etc.).</li>
            <li>Details of your visits to our website and the resources you access (including technical data such as IP address, browser type, and version).</li>
            <li>Information related to transactions and website interactions.</li>
          </ul>

          {/* Use of Your Personal Data */}
          <h2 className="text-xl md:text-2xl font-semibold text-heading mt-8 mb-2">2. Use of Your Personal Data</h2>
          <p className="mb-4 text-md md:text-xl text-gray-600">We use your data to:</p>
          <ul className="list-disc list-inside mb-4 text-md md:text-xl text-gray-600">
            <li>Fulfill our contract with you (e.g., processing orders).</li>
            <li>Enhance your website experience.</li>
            <li>Communicate with you about products, services, and offers that might interest you.</li>
            <li>Analyze the effectiveness of our marketing campaigns.</li>
          </ul>

          {/* Sharing Your Data */}
          <h2 className="text-xl md:text-2xl font-semibold text-heading mt-8 mb-2">3. Sharing Your Data</h2>
          <p className="mb-4 text-md md:text-xl text-gray-600">
            We may share your information within the Melita group for business purposes and with third parties for service provision (e.g., delivery services). 
            We ensure all third parties respect the security of your personal data and comply with the law.
          </p>

          {/* Data Security */}
          <h2 className="text-xl md:text-2xl font-semibold text-heading mt-8 mb-2">4. Data Security</h2>
          <p className="mb-4 text-md md:text-xl text-gray-600">
            We have implemented measures to secure your personal data from accidental loss and unauthorized access, use, alteration, and disclosure.
          </p>

          {/* Your Rights */}
          <h2 className="text-xl md:text-2xl font-semibold text-heading mt-8 mb-2">5. Your Rights</h2>
          <p className="mb-4 text-md md:text-xl text-gray-600">
            You have rights under data protection laws regarding your personal data, including access, correction, erasure, and restriction of processing.
          </p>

          {/* Marketing Preferences */}
          <h2 className="text-xl md:text-2xl font-semibold text-heading mt-8 mb-2">6. Marketing Preferences</h2>
          <p className="mb-4 text-md md:text-xl text-gray-600">
            You can adjust your marketing preferences at any time by contacting us or using the unsubscribe links in emails.
          </p>

          {/* Changes to This Policy */}
          <h2 className="text-xl md:text-2xl font-semibold text-heading mt-8 mb-2">7. Changes to This Policy</h2>
          <p className="mb-4 text-md md:text-xl text-gray-600">
            Melita may update this policy from time to time. We encourage you to review it regularly.
          </p>

          {/* Contact Us */}
          <h2 className="text-xl md:text-2xl font-semibold text-heading mt-8 mb-2">8. Contact Us</h2>
          <p className="mb-4 text-md md:text-xl text-gray-600">
            For more information about our privacy practices or if you have questions, please contact us at:
          </p>
          <address className="not-italic mb-8 text-md md:text-xl text-gray-600">
            V211, Building No. 154/20, Royal Space,<br />
            5th Main, HSR Layout, 7th Sector, Madina Nagar,<br />
            Bommanahalli, Bengaluru Urban,<br />
            Karnataka, 560102
          </address>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
