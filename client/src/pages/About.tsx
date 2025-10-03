import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TopStrip from '@/components/TopStrip';

// Assets
// import heroVideo from '@/assets/about/hero.mp4';
// import heroVideoMob from '@/assets/about/heroMob.mp4';


import banner1 from '@/assets/about/banner1.jpg';
import banner2 from '@/assets/about/banner2.jpg';
import banner3 from '@/assets/about/banner3.jpg';
import banner4 from '@/assets/about/banner4.jpg';

import foundersImg from '@/assets/about/founders.png';

// import ingredientVideo from '@/assets/about/ingredient.mp4';
import ingredientVideoMob from '@/assets/about/ingredientMob.mp4';

import footerBannerDesktop from '@/assets/about/footerBannerNew.png';
import footerBannerMob from '@/assets/about/footerBannerMob.png';
import whiteLogo from '@/assets/melita logo white.png';

import { Instagram } from "lucide-react"; // ✅ lucide-react icon

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopStrip />
      <Header />

      <main className="w-full">
        {/* Desktop Hero Video */}
        <section className="hidden md:block relative min-h-screen overflow-hidden z-0">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            //src={heroVideo}
            poster="/hero-thumb.png"
            autoPlay
            muted
            loop
            playsInline
          />
        </section>

        {/* Mobile Hero Video */}
        <section className="md:hidden relative h-[500px] overflow-hidden">
          <video
            className="absolute inset-0 w-full h-full object-cover"
          //  src={heroVideoMob}
            autoPlay
            muted
            loop
            playsInline
          />
        </section>

        {/* About Grid Section (Banner 1) */}
        <section className="bg-white px-4 py-6 md:px-8 md:py-12 mt-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-8">
            <img src={banner1} alt="Diverse models" className="w-full h-auto rounded-2xl object-cover" />
            <div className="space-y-4 py-8 px-6 sm:px-12">
              <h2 className="text-2xl md:text-3xl font-headingOne font-medium text-heading">
                Beauty Rooted in Science, Made for You
              </h2>
              <p className="text-lg text-gray-700 text-justify leading-relaxed max-w-prose">
                At Melita, we believe skincare should be honest, simple, and effective. We
                built this brand with a clear purpose: to create products that genuinely
                improve your skin – and make it healthier from within – using science and
                natural ingredients your skin recognizes.
              </p>
            </div>
          </div>
        </section>

        {/* Banner 2 */}
        <section className="bg-white px-4 py-6 md:px-8 md:py-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-8">
            <div className="order-1 md:order-2">
              <img src={banner2} alt="Ingredients" className="w-full h-auto rounded-2xl object-cover" />
            </div>
            <div className="order-2 md:order-1 space-y-4 py-8 px-6 sm:px-12">
              <h2 className="text-2xl md:text-3xl font-headingOne font-medium text-heading">
                Ingredients Your Skin Recognizes
              </h2>
              <p className="text-lg text-gray-700 text-justify leading-relaxed max-w-prose">
                We choose ingredients like squalane, which mimics your skin&apos;s natural oils,
                in precise amounts for maximum benefit. No gimmicks, just thoughtfully
                selected, skin-friendly ingredients that support your skin&apos;s health over time.
              </p>
            </div>
          </div>
        </section>

        {/* Banner 3 */}
        <section className="bg-white px-4 py-6 md:px-8 md:py-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-8">
            <img src={banner3} alt="Climate care" className="w-full h-auto rounded-2xl object-cover" />
            <div className="space-y-4 py-8 px-6 sm:px-12">
              <h2 className="text-2xl md:text-3xl font-headingOne font-medium text-heading">
                Made for Our Climate
              </h2>
              <p className="text-lg text-gray-700 text-justify leading-relaxed max-w-prose">
                India&apos;s climate is diverse and demanding. Our formulations are designed
                to adapt – whether it&apos;s humid summers or dry winters – so your skin
                stays balanced and comfortable, all year round.
              </p>
            </div>
          </div>
        </section>

        {/* Banner 4 */}
        <section className="bg-white px-4 py-6 md:px-8 md:py-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-8">
            <div className="order-1 md:order-2">
              <img src={banner4} alt="Luxury skincare" className="w-full h-auto rounded-2xl object-cover" />
            </div>
            <div className="order-2 md:order-1 space-y-4 py-8 px-6 sm:px-12">
              <h2 className="text-2xl md:text-3xl font-headingOne font-medium text-heading">
                Luxury that Listens
              </h2>
              <p className="text-lg text-gray-700 text-justify leading-relaxed max-w-prose">
                At Melita, luxury is more than a product – it&apos;s the experience of being
                heard, cared for, and understood. Every formula is made to meet your
                everyday skincare needs with sophistication and authenticity.
              </p>
            </div>
          </div>
        </section>

        {/* Ingredient Video Section */}
        <section className="hidden md:block bg-gray-100 mt-6 mb-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="aspect-video max-w-7xl mx-auto overflow-hidden shadow-lg">
              <video
                //src={ingredientVideo}
                autoPlay
                muted
                loop
                playsInline
                preload="none"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="md:hidden bg-gray-100 mt-6 mb-8">
          <div className="w-full h-[500px] mx-auto text-center">
            <div className="aspect-video w-full h-full mx-auto overflow-hidden shadow-lg">
              <video
                src="/ingredientMob.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="none"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Founders Section */}
        <section className="bg-white px-4 py-6 md:px-8 md:py-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-8">
            <img src={foundersImg} alt="Founders" className="w-full h-auto rounded-2xl object-cover" />
            <div className="space-y-6 text-left">
              <h2 className="text-2xl md:text-3xl sm:text-4xl font-headingOne font-medium text-heading leading-snug">
                A Note from Our Founders
              </h2>
              <p className="text-lg text-gray-700 text-justify leading-relaxed max-w-prose">
                We started Melita because we believe skincare should be about trust,
                transparency, and community. Our goal isn&apos;t just to sell products but to
                build a space where people care for themselves and each other. We&apos;re
                dedicated to creating a brand that listens, learns, and grows with you,
                because real change begins with caring.
              </p>
            </div>
          </div>
        </section>

        {/* Footer Banner (Desktop) */}
        <section className="hidden md:block w-full mt-12 text-center">
          <div
            className="relative max-w-7xl h-[300px] mx-auto px-4 py-12 overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: `url(${footerBannerDesktop})` }}
          >
            <img src={whiteLogo} className="w-[180px] mt-6 mb-14 mx-auto" alt="Melita Logo" />
            <p className="text-base md:text-2xl text-white font-medium leading-relaxed">
              Honest Skincare for the modern Indian, helping your
              <br />
              skin feel healthier and cared for every day.
            </p>
          </div>
        </section>

        {/* Footer Banner (Mobile) */}
        <section className="md:hidden w-full h-[400px] mt-12">
          <div
            className="relative w-full h-full mx-auto px-4 py-12 overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: `url(${footerBannerMob})` }}
          ></div>
        </section>

        {/* Join Our Journey Section */}
        <section className="bg-white py-12 px-4 text-center mt-4 md:mt-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl md:text-4xl font-bold text-[#26452D] tracking-wide">
              JOIN OUR JOURNEY
            </h2>
            <p className="text-base md:text-xl text-gray-800 font-medium leading-relaxed">
              We&apos;re just getting started, and we want you to be a part of it. Follow us
              on Instagram{" "}
              <a
                href="https://instagram.com/melita.luxuryskincare"
                target="_blank"
                rel="noreferrer"
                className="text-[#8B5D2E] underline font-semibold"
              >
                @melita.luxuryskincare
              </a>
              , and come along as we build a community rooted in trust, care, and the
              celebration of real, healthy skin.
            </p>

            <div className="flex justify-center">
              <a
                href="https://instagram.com/melita.luxuryskincare"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-[#8B5D2E] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#744921] transition"
              >
                <Instagram className="w-5 h-5" /> {/* ✅ lucide-react icon */}
                @melita.luxuryskincare
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
