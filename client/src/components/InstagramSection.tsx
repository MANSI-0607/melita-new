import { useState,useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InstagramSection = () => {
  const [isScrolledToStart, setIsScrolledToStart] = useState(true);
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);

  const instagramPosts = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop",
      likes: "2.5k",
      comments: "45",
      type: "image"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1556228578-dd1d6e0e45e3?w=300&h=300&fit=crop",
      likes: "1.8k",
      comments: "32",
      type: "video"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1556228578-f9f3ffe8e1d0?w=300&h=300&fit=crop",
      likes: "3.2k",
      comments: "67",
      type: "image"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1556228578-0fd88b7ac9f7?w=300&h=300&fit=crop",
      likes: "2.1k",
      comments: "28",
      type: "video"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1556228578-626eabea5beb?w=300&h=300&fit=crop",
      likes: "1.9k",
      comments: "39",
      type: "image"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1556228578-b1c1b1c1b1c1?w=300&h=300&fit=crop",
      likes: "4.1k",
      comments: "98",
      type: "video"
    }
  ];

  const scrollRef = useRef(null);

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
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' }); // Adjust scroll amount
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' }); // Adjust scroll amount
    }
  };

  return (
    <section className="mb-8 mt-12"> 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-[#1e4323] text-center text-xl sm:text-2xl md:text-3xl font-headingOne mb-6 font-semibold leading-snug uppercase">
            INSTAGRAM
          </h2>
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4">
          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-1/2 left-4 -translate-y-1/2 z-10 flex items-center justify-center w-12 h-12 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-[#835339] border border-transparent hover:bg-white hover:border-[#835339] focus:outline-none focus:ring-2 focus:ring-[#835339] transition-all duration-300 ${
              isScrolledToStart ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
            onClick={scrollLeft}
            disabled={isScrolledToStart}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-1/2 right-4 -translate-y-1/2 z-10 flex items-center justify-center w-12 h-12 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-[#835339] border border-transparent hover:bg-white hover:border-[#835339] focus:outline-none focus:ring-2 focus:ring-[#835339] transition-all duration-300 ${
              isScrolledToEnd ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
            onClick={scrollRight}
            disabled={isScrolledToEnd}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Posts Carousel Container */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 px-2 md:px-8 py-2 scroll-smooth snap-x snap-mandatory cursor-grab active:cursor-grabbing scrollbar-hide"
            onScroll={handleScroll}
          >
            {instagramPosts.map((post) => (
              <div
                key={post.id}
                className="flex-shrink-0 w-[250px] h-[360px] relative rounded-2xl overflow-hidden shadow-lg snap-center"
              >
                {post.type === "video" ? (
                  <video
                    controls
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover rounded-2xl"
                    poster={post.image}
                    preload="metadata"
                  >
                    <source src={`/reels/reel${post.id}.mp4`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={post.image}
                    alt={`Instagram post ${post.id}`}
                    className="w-full h-full object-cover"
                  />
                )}
                {/* Overlay with stats */}
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-white text-center text-xs">
                    <p>♥ {post.likes}</p>
                    <p>💬 {post.comments}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstagramSection;