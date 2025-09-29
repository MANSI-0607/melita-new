import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

// Desktop images
import scienceCard from '@/assets/whymelita/science (1).jpg';
import ingredientsCard from '@/assets/whymelita/ingredients (1).png';
import climateCard from '@/assets/whymelita/climate (1).jpg';
import routineCard from '@/assets/whymelita/small (1).jpg';

// Mobile images
import mobilescience from '@/assets/whymelita/why 4.jpg';
import mobileingredients from '@/assets/whymelita/why 3.jpg';
import mobileclimate from '@/assets/whymelita/why 2.jpg';
import mobileroutine from '@/assets/whymelita/why 1.jpg';

const WhyMelita = () => {
  const navigate = useNavigate();
  const benefitsDesktop = [
    { title: "Backed by Science", image: scienceCard },
    { title: "Ingredients Your Skin Recognizes", image: ingredientsCard },
    { title: "Made for Our Climate", image: climateCard },
    { title: "Small Routine, Big Impact", image: routineCard },
  ];

  const benefitsMobile = [
    { image: mobilescience },
    { image: mobileingredients },
    { image: mobileclimate },
    { image: mobileroutine },
  ];

  return (
    <section id="whyMelita" className="bg-white py-12 md:py-16 px-4 md:px-6">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto text-center mb-6">
        <h2 className="text-[#1e4323] text-xl sm:text-2xl md:text-3xl font-headingOne font-semibold leading-snug uppercase">
          WHY MELITA
        </h2>
      </div>

      {/* ✅ Mobile Swiper Carousel */}
      <div className="md:hidden">
  <style>{`
    .swiper-pagination-bullet {
      width: 10px !important;
      height: 10px !important;
      background-color: #835339 !important;
      opacity: 0.6 !important;
      margin: 0 4px !important;
      border-radius: 50% !important;
    }
    .swiper-pagination-bullet-active {
      background-color: #835339 !important;
      opacity: 1 !important;
      width: 12px !important;
      height: 12px !important;
    }
  `}</style>
 <Swiper
  modules={[Pagination, Autoplay]}
  pagination={{ clickable: true }}
  autoplay={{ delay: 3000, disableOnInteraction: false }} // ✅ auto-slide every 3s
  loop={true}
  speed={500}  // ✅ smooth transition
  className="w-full"
>
    {benefitsMobile.map((benefit, index) => (
      <SwiperSlide key={index} className="relative overflow-hidden">
        <img
          src={benefit.image}
          alt="Why Melita"
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <Button
        onClick={() => navigate('/about')}
          className="absolute top-[55%] left-[4%] font-headingTwo text-gray-800 bg-white border border-[#333333] hover:bg-[#835339] hover:text-white text-[12px] py-1 w-[100px] rounded-none"
        >
          READ MORE
        </Button>
      </SwiperSlide>
    ))}
  </Swiper>
</div>


      {/* ✅ Desktop Grid */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
        {benefitsDesktop.map((benefit, index) => (
          <div key={index} className="overflow-hidden shadow-md relative">
            <img
              src={benefit.image}
              alt={benefit.title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10 flex flex-col justify-between p-4">
              <h3 className="text-gray-800 text-lg font-headingTwo font-semibold mt-4">
                {benefit.title}
              </h3>
              <Button
                onClick={() => navigate('/about')}
                className="text-gray-800 bg-white border border-[#333333] hover:bg-[#835339] hover:text-white text-sm py-2 mb-4 w-full rounded-none"
              >
                READ MORE
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyMelita;
