// import { useEffect, useRef, useState } from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { Button } from "@/components/ui/button";

// const InstagramSection = () => {
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const [isScrolledToStart, setIsScrolledToStart] = useState(true);
//   const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);

//   const reels = [
//     "https://www.instagram.com/reel/DKHh_yetuwg/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
//     "https://www.instagram.com/reel/DNYRyPhPcUV/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
//     "https://www.instagram.com/reel/DKMq4j8vZZr/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
//     "https://www.instagram.com/reel/DKCQJcJxFN2/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
//     "https://www.instagram.com/reel/DNakzDJPvaM/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
//     "https://www.instagram.com/reel/DNcpA1wxvh7/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
//   ];

//   const applyIframeCropping = () => {
//     const containers = document.querySelectorAll<HTMLDivElement>(".reel-container");
    
//     containers.forEach((container) => {
//       const iframe = container.querySelector<HTMLIFrameElement>("iframe");
//       if (iframe) {
//         iframe.style.position = "absolute";
//         iframe.style.top = "0";
//         iframe.style.left = "0";
//         iframe.style.width = "100%";
//         iframe.style.height = "100%";
//         iframe.style.border = "0";
//         iframe.style.borderRadius = "12px";
//         iframe.style.objectFit = "cover";
        
//         const parent = iframe.parentElement as HTMLElement;
//         if (parent) {
//           parent.style.overflow = "hidden";
//           parent.style.position = "relative";
//           parent.style.borderRadius = "12px";
//         }
//       }
//     });
//   };

//   useEffect(() => {
//     const loadAndProcess = () => {
//       // @ts-ignore
//       if (window.instgrm && window.instgrm.Embeds) {
//         // @ts-ignore
//         window.instgrm.Embeds.process();
//         setTimeout(applyIframeCropping, 500);
//       }
//     };

//     if (!document.getElementById("instagram-embed-script")) {
//       const script = document.createElement("script");
//       script.src = "//www.instagram.com/embed.js";
//       script.async = true;
//       script.id = "instagram-embed-script";
//       script.onload = loadAndProcess;
//       document.body.appendChild(script);
//     } else {
//       loadAndProcess();
//     }

//     const interval = setInterval(applyIframeCropping, 600);
//     setTimeout(() => clearInterval(interval), 6000);

//     window.addEventListener("resize", applyIframeCropping);
//     return () => {
//       window.removeEventListener("resize", applyIframeCropping);
//       clearInterval(interval);
//     };
//   }, []);

//   useEffect(() => {
//     // @ts-ignore
//     if (window.instgrm && window.instgrm.Embeds) {
//       // @ts-ignore
//       window.instgrm.Embeds.process();
//       setTimeout(applyIframeCropping, 500);
//     }
//   }, [reels]);

//   const handleScroll = () => {
//     if (scrollRef.current) {
//       setIsScrolledToStart(scrollRef.current.scrollLeft === 0);
//       setIsScrolledToEnd(
//         scrollRef.current.scrollLeft + scrollRef.current.clientWidth >=
//           scrollRef.current.scrollWidth - 1
//       );
//     }
//   };

//   const scrollLeft = () => {
//     const amount = window.innerWidth < 640 ? 200 : window.innerWidth < 1024 ? 250 : 300;
//     scrollRef.current?.scrollBy({ left: -amount, behavior: "smooth" });
//   };

//   const scrollRight = () => {
//     const amount = window.innerWidth < 640 ? 200 : window.innerWidth < 1024 ? 250 : 300;
//     scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
//   };

//   return (
//     <section className="mb-8 mt-12">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <h2 className="text-[#1e4323] text-center text-xl sm:text-2xl md:text-3xl font-headingOne mb-6 font-semibold leading-snug uppercase">
//           INSTAGRAM
//         </h2>

//         <div className="relative w-full">
//           <Button
//             variant="ghost"
//             size="icon"
//             className={`absolute top-1/2 left-2 sm:left-4 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/80 rounded-full shadow-md text-[#835339] transition-opacity duration-300 ${
//               isScrolledToStart ? "opacity-0 pointer-events-none" : "opacity-100"
//             }`}
//             onClick={scrollLeft}
//             disabled={isScrolledToStart}
//           >
//             <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
//           </Button>

//           <Button
//             variant="ghost"
//             size="icon"
//             className={`absolute top-1/2 right-2 sm:right-4 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/80 rounded-full shadow-md text-[#835339] transition-opacity duration-300 ${
//               isScrolledToEnd ? "opacity-0 pointer-events-none" : "opacity-100"
//             }`}
//             onClick={scrollRight}
//             disabled={isScrolledToEnd}
//           >
//             <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
//           </Button>

//           <div
//             ref={scrollRef}
//             onScroll={handleScroll}
//             className="flex overflow-x-auto gap-3 sm:gap-4 lg:gap-5 px-1 sm:px-2 py-3 sm:py-4 scroll-smooth snap-x snap-mandatory scrollbar-hide"
//           >
//             {reels.map((url, i) => (
//               <div
//                 key={i}
//                 className="reel-container relative flex-shrink-0 snap-center rounded-xl overflow-hidden shadow-lg aspect-[9/16] w-[180px] sm:w-[220px] lg:w-[260px]"
//                 style={{ 
//                   background: "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)",
//                   minHeight: "320px"
//                 }}
//               >
//                 <blockquote
//                   className="instagram-media"
//                   data-instgrm-permalink={`${url}?utm_source=ig_embed&amp;utm_campaign=loading`}
//                   data-instgrm-version="14"
//                   data-instgrm-captioned="false"
//                   style={{
//                     background: "transparent",
//                     border: 0,
//                     borderRadius: "12px",
//                     margin: "0",
//                     padding: 0,
//                     width: "100%",
//                     height: "100%",
//                     minWidth: "100%",
//                     maxWidth: "100%",
//                   }}
//                 ></blockquote>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <style>{`
//         .scrollbar-hide::-webkit-scrollbar {
//           display: none;
//         }
//         .scrollbar-hide {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//       `}</style>
//     </section>
//   );
// };

// export default InstagramSection;
import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InstagramSection = () => {
  const [isScrolledToStart, setIsScrolledToStart] = useState(true);
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);

  const instagramReels = [
    {
      id: 1,
      video: "/reels/reel1.mp4",
      poster: "/reels/reel1_img.png",
      caption: "Have you tried the viral Melita duo yet? 💦",
    },
    {
      id: 2,
      video: "/reels/reel2.mp4",
      poster: "/reels/reel2_img.png",
      caption: "Give your skin the respect it deserves — cleanse the Melita way ✨",
    },
    {
      id: 3,
      video: "/reels/reel3.mp4",
      poster: "/reels/reel3_img.png",
      caption: "Oily, acne-prone, sensitive skin?",
    },
    {
      id: 4,
      video: "/reels/reel4.mp4",
      poster: "/reels/reel4_img.png",
      caption: "You've seen the glow. Now let's decode the science 🔬",
    },
    {
      id: 5,
      video: "/reels/reel5.mp4",
      poster: "/reels/reel5_img.png",
      caption: "This is your official invite to get in, before teh crowd.",
    },
    {
      id: 6,
      video: "/reels/reel6.mp4",
      poster: "/reels/reel6_img.png",
      caption: "I'm officially a Melita Girl, what about you?",
    },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      setIsScrolledToStart(scrollRef.current.scrollLeft === 0);
      setIsScrolledToEnd(
        scrollRef.current.scrollLeft + scrollRef.current.clientWidth >=
          scrollRef.current.scrollWidth - 1
      );
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      const amount = window.innerWidth < 640 ? 200 : window.innerWidth < 1024 ? 250 : 280;
      scrollRef.current.scrollBy({ left: -amount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const amount = window.innerWidth < 640 ? 200 : window.innerWidth < 1024 ? 250 : 280;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <section className="mb-8 mt-12"> 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-[#1e4323] text-center text-xl sm:text-2xl md:text-3xl font-headingOne mb-6 font-semibold leading-snug uppercase">
          INSTAGRAM
        </h2>

        <div className="relative w-full">
          {/* Left button */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-1/2 left-2 sm:left-4 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-[#835339] border border-transparent hover:bg-white hover:border-[#835339] transition-all duration-300 ${
              isScrolledToStart ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
            onClick={scrollLeft}
            disabled={isScrolledToStart}
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
          </Button>
          
          {/* Right button */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-1/2 right-2 sm:right-4 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-[#835339] border border-transparent hover:bg-white hover:border-[#835339] transition-all duration-300 ${
              isScrolledToEnd ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
            onClick={scrollRight}
            disabled={isScrolledToEnd}
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
          </Button>

          {/* Scrollable reels */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-3 sm:gap-4 lg:gap-5 px-1 sm:px-2 py-3 sm:py-4 scroll-smooth snap-x snap-mandatory scrollbar-hide"
            onScroll={handleScroll}
          >
            {instagramReels.map((reel) => (
              <div
                key={reel.id}
                className="flex-shrink-0 snap-center w-[180px] sm:w-[220px] lg:w-[260px] aspect-[9/16] relative rounded-xl overflow-hidden shadow-lg group"
              >
                <video
                  controls
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  poster={reel.poster}
                  preload="metadata"
                >
                  <source src={reel.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Caption at bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                  <p className="text-white text-xs sm:text-sm font-medium">
                    {reel.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default InstagramSection;
