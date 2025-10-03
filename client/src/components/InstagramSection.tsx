import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const InstagramSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolledToStart, setIsScrolledToStart] = useState(true);
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);
  const [loadedReels, setLoadedReels] = useState<Set<number>>(new Set());

  const reels = [
    "https://www.instagram.com/reel/DKHh_yetuwg/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    "https://www.instagram.com/reel/DNYRyPhPcUV/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    "https://www.instagram.com/reel/DKMq4j8vZZr/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    "https://www.instagram.com/reel/DKCQJcJxFN2/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    "https://www.instagram.com/reel/DNakzDJPvaM/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    "https://www.instagram.com/reel/DNcpA1wxvh7/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
  ];

  useEffect(() => {
    // Load Instagram embed script
    if (!document.getElementById("instagram-embed-script")) {
      const script = document.createElement("script");
      script.src = "//www.instagram.com/embed.js";
      script.async = true;
      script.id = "instagram-embed-script";
      script.onload = () => {
        // @ts-ignore
        if (window.instgrm && window.instgrm.Embeds) {
          // @ts-ignore
          window.instgrm.Embeds.process();
        }
      };
      document.body.appendChild(script);
    } else {
      // Refresh embeds if script already loaded
      // @ts-ignore
      if (window.instgrm && window.instgrm.Embeds) {
        // @ts-ignore
        window.instgrm.Embeds.process();
      }
    }
  }, []);

  const handleReelLoad = (index: number) => {
    setLoadedReels(prev => new Set(prev).add(index));
  };

  useEffect(() => {
    // Load Instagram embed script
    if (!document.getElementById("instagram-embed-script")) {
      const script = document.createElement("script");
      script.src = "//www.instagram.com/embed.js";
      script.async = true;
      script.id = "instagram-embed-script";
      script.onload = () => {
        // @ts-ignore
        if (window.instgrm && window.instgrm.Embeds) {
          // @ts-ignore
          window.instgrm.Embeds.process();
        }
      };
      document.body.appendChild(script);
    } else {
      // Refresh embeds if script already loaded
      // @ts-ignore
      if (window.instgrm && window.instgrm.Embeds) {
        // @ts-ignore
        window.instgrm.Embeds.process();
      }
    }
  }, [reels]);

  const handleScroll = () => {
    if (scrollRef.current) {
      setIsScrolledToStart(scrollRef.current.scrollLeft === 0);
      setIsScrolledToEnd(
        scrollRef.current.scrollLeft + scrollRef.current.clientWidth >=
          scrollRef.current.scrollWidth
      );
    }
  };

  const scrollLeft = () => {
    const amount = window.innerWidth < 640 ? 240 : window.innerWidth < 1024 ? 300 : 350;
    scrollRef.current?.scrollBy({ left: -amount, behavior: "smooth" });
  };

  const scrollRight = () => {
    const amount = window.innerWidth < 640 ? 240 : window.innerWidth < 1024 ? 300 : 350;
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="mb-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-[#1e4323] text-center text-xl sm:text-2xl md:text-3xl font-headingOne mb-6 font-semibold leading-snug uppercase">
          INSTAGRAM
        </h2>

        <div className="relative w-full">
          {/* Left arrow */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-1/2 left-2 sm:left-4 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/80 rounded-full shadow-md text-[#835339] ${
              isScrolledToStart ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
            onClick={scrollLeft}
            disabled={isScrolledToStart}
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
          </Button>

          {/* Right arrow */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-1/2 right-2 sm:right-4 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/80 rounded-full shadow-md text-[#835339] ${
              isScrolledToEnd ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
            onClick={scrollRight}
            disabled={isScrolledToEnd}
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
          </Button>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto gap-4 sm:gap-5 lg:gap-6 px-1 sm:px-2 py-3 sm:py-4 scroll-smooth snap-x snap-mandatory scrollbar-hide"
          >
            {reels.map((url, i) => (
             <div
             key={i}
             className="flex-shrink-0 snap-center rounded-xl overflow-hidden shadow-lg bg-black aspect-[9/16] w-[240px] flex items-center justify-center"
           >
             <blockquote
               className="instagram-media"
               data-instgrm-permalink={`${url}?utm_source=ig_embed&amp;utm_campaign=loading`}
               data-instgrm-version="14"
               data-instgrm-captioned="false"
               style={{
                 background: "#000",
                 border: 0,
                 borderRadius: "12px",
                 margin: "0 auto",
                 padding: 0,
                 width: "100%",
                 height: "100%",
                 maxWidth: "100%",
               }}
             ></blockquote>
           </div>
           
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstagramSection;
