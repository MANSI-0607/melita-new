import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TopStrip from '@/components/TopStrip';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopStrip />
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 mt-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headingOne text-center text-heading mb-6">
          Terms & Conditions
        </h1>

        <p className="mb-4 text-md md:text-xl text-gray-600">
          Welcome to Melita’s website, an online platform for beauty and cosmetic products operated by 
          E&L Beauty Solutions Private Limited. Use of our website is subject to your acceptance of these 
          Terms & Conditions without modification. We reserve the right to update these terms at our discretion 
          and to refuse service to anyone for any reason.
        </p>

        <div className="prose max-w-none">
          {/* 1. Introduction */}
          <h2 className="text-xl md:text-2xl font-semibold text-heading mt-8 mb-2">1. Introduction</h2>
          <p className="mb-4 text-md md:text-xl text-gray-600">
            Welcome to Melita. These Terms & Conditions govern your use of our website and services. 
            By accessing or using our site, you agree to be bound by these terms.
          </p>

          {/* 2. Products and Pricing */}
          <h2 className="text-xl md:text-2xl font-semibold text-heading mt-8 mb-2">2. Products and Pricing</h2>
          <p className="mb-4 text-md md:text-xl text-gray-600">
            We reserve the right to modify or discontinue any product at any time. Prices are subject to change without notice.
          </p>

          {/* 3. Orders and Payment */}
          <h2 className="text-xl md:text-2xl font-semibold text-heading mt-8 mb-2">3. Orders and Payment</h2>
          <p className="mb-4 text-md md:text-xl text-gray-600">
            All orders are subject to availability. We reserve the right to refuse service to anyone for any reason at any time.
          </p>

          {/* 4. Account Registration and Security */}
          <h2 className="text-xl md:text-2xl font-semibold text-heading mt-8 mb-2">4. Account Registration and Security</h2>
          <p className="mb-4 text-md md:text-xl text-gray-600">
            To use certain features of the site, you must register for an account, providing accurate and complete information. 
            You are responsible for maintaining the confidentiality of your account details and for all activities under your account. 
            Notify us immediately of any unauthorized use or security breach.
          </p>

          {/* 5. Privacy and Information Sharing */}
          <h2 className="text-xl md:text-2xl font-semibold text-heading mt-8 mb-2">5. Privacy and Information Sharing</h2>
          <p className="mb-4 text-md md:text-xl text-gray-600">
            Your privacy is important to us. We share your information only with your consent, to comply with laws, or to protect 
            rights and safety. Our Privacy Policy, available on our website, outlines how we handle personal information.
          </p>

          {/* 6. Pricing and Payment */}
          <h2 className="text-xl md:text-2xl font-semibold text-heading mt-8 mb-2">6. Pricing and Payment</h2>
          <p className="mb-4 text-md md:text-xl text-gray-600">
            We strive to provide accurate product and pricing information. Prices and product availability are subject to change. 
            Payments can be made through various modes as specified on our website.
          </p>

          {/* 7. Order Cancellation and Refunds */}
          <h2 className="text-xl md:text-2xl font-semibold text-heading mt-8 mb-2">7. Order Cancellation and Refunds</h2>
          <p className="mb-4 text-md md:text-xl text-gray-600">
            We reserve the right to cancel orders due to pricing errors, fraud prevention, or other reasons. 
            In such cases, a full refund will be processed.
          </p>

          {/* 8. Copyright and Intellectual Property */}
          <h2 className="text-xl md:text-2xl font-semibold text-heading mt-8 mb-2">8. Copyright and Intellectual Property</h2>
          <p className="mb-8 text-md md:text-xl text-gray-600">
            All content on Melita's website is protected by copyright and intellectual property laws. 
            Unauthorized use of website content is strictly prohibited.
          </p>

          {/* 9. Limitation of Liability */}
          <h2 className="text-xl md:text-2xl font-semibold text-heading mt-8 mb-2">9. Limitation of Liability</h2>
          <p className="mb-4 text-md md:text-xl text-gray-600">
            Melita shall not be liable for any indirect, incidental, special, or consequential damages resulting from 
            the use or inability to use our products or services.
          </p>

          {/* 10. Changes to Terms */}
          <h2 className="text-xl md:text-2xl font-semibold text-heading mt-8 mb-2">10. Changes to Terms</h2>
          <p className="mb-4 text-md md:text-xl text-gray-600">
            We reserve the right to update, change, or replace any part of these Terms & Conditions by posting updates to our website.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsAndConditions;
