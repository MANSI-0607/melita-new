import { Button } from '@/components/ui/button';
import journeyHero from '@/assets/journey-hero.jpg';
import { useNavigate } from 'react-router-dom';
const JourneyPhilosophy = () => {
  const navigate = useNavigate();
  return (
    <section id="journeyphilosophy" className="pb-2 md:pb-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 shadow-lg">
        {/* Left Side - Image */}
        <div className="w-full h-64 sm:h-96 md:h-auto">
          <img
            src={journeyHero}
            alt="Melita Essence Bottle"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Right Side - Content */}
        <div className="bg-[#f0e4d4] flex flex-col justify-center p-8 sm:p-16">
          <h2 className="text-3xl sm:text-4xl font-headingOne font-bold text-green-800 mb-8">
            OUR JOURNEY 
            <br />
            AND PHILOSOPHY
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            " At Melita, we believe in keeping skincare simple and effective. Our products use powerful ingredients to make your skin healthier with each use. We believe in providing an experience that enhances your natural beauty, leaving your skin glowing, hydrating and refreshed every day. "
          </p>
          <Button
            onClick={() => navigate('/about')}
            className="inline-block w-max px-6 py-3 bg-[#835339] text-white font-semibold rounded-lg hover:bg-white hover:text-[#835339] hover:border hover:border-[#835339] transition"
          >
            READ MORE
          </Button>
        </div>
      </div>
    </section>
  );
};

export default JourneyPhilosophy;