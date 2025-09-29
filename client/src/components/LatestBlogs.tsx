import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import blog1 from "@/assets/blog-1.jpg";
import blog2 from "@/assets/blog-2.jpg";
import blog3 from "@/assets/blog-3.jpg";
import blog4 from "@/assets/blog-4.jpg";
import { Button } from "@/components/ui/button";

const LatestBlogs = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const blogs = [
    { title: "HOW TO BUILD SKINCARE ROUTINE", image: blog1 },
    { title: "THE SECRETS TO GLOWING SKIN", image: blog2 },
    { title: "THE SECRETS TO GLOWING SKIN", image: blog3 },
    { title: "ANCIENT REMEDIES FOR MODERN SKIN", image: blog4 },
  ];

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -350, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 350, behavior: "smooth" });
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  return (
    <section id="latest-blogs-slider" className="relative py-2 md:py-8 bg-white">
      <div className="max-w-7xl mx-auto px-2">
        <h2 className="text-[#1e4323] text-center text-xl sm:text-2xl md:text-3xl font-headingOne mb-6 font-semibold leading-snug uppercase">
          LATEST BLOGS
        </h2>

        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`absolute top-1/2 left-4 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full shadow-lg border transition-all duration-300 backdrop-blur-md ${
              canScrollLeft
                ? 'bg-white/80 text-[#835339] border-transparent hover:bg-white hover:border-[#835339]'
                : 'bg-white/50 text-[#835339]/40 border-transparent opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`absolute top-1/2 right-4 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full shadow-lg border transition-all duration-300 backdrop-blur-md ${
              canScrollRight
                ? 'bg-white/80 text-[#835339] border-transparent hover:bg-white hover:border-[#835339]'
                : 'bg-white/50 text-[#835339]/40 border-transparent opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Blog Cards Carousel */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="relative min-h-[260px] flex overflow-x-auto snap-x snap-mandatory gap-6 scroll-smooth px-8 pb-4 scrollbar-hide"
          >
            {blogs.map((blog, index) => (
              <div
                key={index}
                className="flex-none w-full sm:w-1/2 lg:w-1/3 snap-center"
              >
               <div className="bg-white shadow-product overflow-hidden">
  {/* Blog Image */}
  <div className="overflow-hidden">
    <img
      src={blog.image}
      alt={blog.title}
      className="w-full h-56 object-cover shadow-lg"
    />
  </div>

  {/* Blog Content */}
  <h3 className="mt-4 text-base font-bold uppercase text-[#835339] text-center">
    {blog.title}
  </h3>

  <Button
    variant="melita"
    onClick={() => navigate('/blog')}
    className="mt-2 block w-max mx-auto px-6 py-2 bg-[#835339] text-white font-semibold uppercase hover:bg-white hover:text-[#835339] hover:border hover:border-[#835339] transition"
  >
    READ MORE
  </Button>
</div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LatestBlogs;
