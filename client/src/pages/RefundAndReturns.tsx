import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TopStrip from '@/components/TopStrip';

const RefundAndReturns = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopStrip />
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 mt-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headingOne text-center text-heading mb-6">
          Refund and Return Policy
        </h1>

        <p className="mb-4 text-md md:text-xl text-gray-600">
          At Melita, we stand behind the quality and efficacy of our skincare products. 
          We believe in the power of natural ingredients and the positive impact they 
          can have on your skin. However, we understand that every skin type is unique, 
          and what works for one person may not work for another.
        </p>

        <div className="prose max-w-none">
          {/* 1. 14-Day Return Policy */}
          <h2 className="text-xl md:text-2xl font-semibold text-heading mt-8 mb-2">
            1. 14-Day Return Policy
          </h2>
          <p className="mb-4 text-md md:text-xl text-gray-600">
            If for any reason you are not completely satisfied with your Melita purchase, 
            you may return it within 14 days of receipt for a full refund or exchange. 
            To be eligible for a return, please ensure that:
          </p>
          <ul className="list-disc pl-6 text-md md:text-xl text-gray-600 mb-4">
            <li>The product is returned within 14 days of the invoice date.</li>
            <li>You have the original invoice or proof of purchase.</li>
          </ul>

          {/* 2. Return Process */}
          <h2 className="text-xl md:text-2xl font-semibold text-heading mt-8 mb-2">
            2. Return Process
          </h2>
          <ol className="list-decimal pl-6 text-md md:text-xl text-gray-600 mb-4">
            <li>
              <strong>Contact Your Melita Community Seller:</strong> Initiate the return 
              by contacting the seller you purchased from. They will guide you through 
              the process.
            </li>
            <li>
              <strong>Submit a Return Request:</strong> Fill out a return request form 
              provided by your seller, including your order details and reason for return.
            </li>
            <li>
              <strong>Return the Product:</strong> Pack the product securely and send it 
              back using the address provided by your seller. Use a trackable method to 
              avoid lost shipments.
            </li>
            <li>
              <strong>Receive Your Refund or Exchange:</strong> Once we receive and verify 
              the returned product, refunds will be issued to your original payment method 
              within 10 days. You will also receive a confirmation email.
            </li>
          </ol>

          {/* 3. Questions or Concerns */}
          <h2 className="text-xl md:text-2xl font-semibold text-heading mt-8 mb-2">
            3. Questions or Concerns?
          </h2>
          <p className="mb-4 text-md md:text-xl text-gray-600">
            Our Melita Support team is here to help. If you have any questions or concerns 
            about your return or this policy, please reach out to your community seller or 
            email us at <a href="mailto:support@melita.in" className="text-primary underline">support@melita.in</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundAndReturns;
