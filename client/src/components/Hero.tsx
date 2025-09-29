import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import heroDesktop1 from "../assets/hero/hero_banner_1.jpg";
import heroDesktop2 from "../assets/hero/hero_banner_2.jpg";
import heroDesktop3 from "../assets/hero/hero_banner_3.jpg";
import heroMobile1 from "../assets/hero/mob_hero_banner_1.jpg";
import heroMobile2 from "../assets/hero/mob_hero_banner_2.jpg";
import heroMobile3 from "../assets/hero/mob_hero_banner_3.jpg";

const Hero = () => {
  const slides = [
    { desktop: heroDesktop1, mobile: heroMobile1, alt: "Hero Banner 1" },
    { desktop: heroDesktop2, mobile: heroMobile2, alt: "Hero Banner 2" },
    { desktop: heroDesktop3, mobile: heroMobile3, alt: "Hero Banner 3" },
  ];

  return (
    <section className="hero relative w-full">
      {/* Desktop Swiper */}
      <div className="hidden md:block h-[550px]">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation={{
            nextEl: ".desktop-next",
            prevEl: ".desktop-prev",
          }}
          pagination={{
            clickable: true,
            el: ".desktop-pagination",
            bulletClass:
              "swiper-pagination-bullet w-3 h-3 bg-white/70 rounded-full mx-1 transition-all duration-300",
            bulletActiveClass:
              "swiper-pagination-bullet-active bg-[#8b5134] w-4 h-4",
          }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop={true}
          className="w-full h-full"
        >
          {slides.map((slide, idx) => (
            <SwiperSlide key={idx} className="flex justify-center items-center">
              <img
                src={slide.desktop}
                alt={slide.alt}
                className="w-full h-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Desktop Controls */}
        <button className="desktop-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-white rounded-full p-3 shadow-lg">
          <ChevronLeft className="w-6 h-6 text-[#8b5134]" />
        </button>
        <button className="desktop-next absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-white rounded-full p-3 shadow-lg">
          <ChevronRight className="w-6 h-6 text-[#8b5134]" />
        </button>
        <div className="desktop-pagination absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2"></div>
      </div>

      {/* Mobile Swiper */}
      <div className="md:hidden h-[550px]">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          pagination={{
            clickable: true,
            el: ".mobile-pagination",
            bulletClass:
              "swiper-pagination-bullet w-2.5 h-2.5 bg-white/70 rounded-full mx-1 transition-all duration-300",
            bulletActiveClass:
              "swiper-pagination-bullet-active bg-[#8b5134] w-3.5 h-3.5",
          }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop={true}
          className="w-full h-full"
        >
          {slides.map((slide, idx) => (
            <SwiperSlide key={idx} className="flex justify-center items-center">
              <img
                src={slide.mobile}
                alt={slide.alt}
                className="w-full h-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="mobile-pagination absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2"></div>
      </div>
    </section>
  );
};

export default Hero;
