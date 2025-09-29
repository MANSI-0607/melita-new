import { Star } from "lucide-react";
import { useState, useEffect } from "react";
import reviewimg from "@/assets/review.jpg";
const ReviewsSection = () => {
  const reviews = [
    {
      id: 1,
      rating: 5,
      text: "It’s a very light essence that makes your skin soft and glowy……it also give good hydration to your skin I am using it in my night care and so far it’s amazing….so yes you can go for it🫶🏻✨",
      author: "Rowanco Tikhak",
    },
    {
      id: 2,
      rating: 5,
      text: "Being a dry and sensitive skin person, things don't suit me easily, but I found Melita Gem products. I've been using serum and cream for more than one month, and I love it",
      author: "Ruchi Desai",
    },
    {
      id: 3,
      rating: 5,
      text: "I have used quite a lot of products but this essence is one of my favorites😍. I love everything about it. I love the feeling after applying, it’s so hydrating. It softens my skin and feels so good",
      author: "Judith Renthlei",
    },
    {
      id: 4,
      rating: 5,
      text: "This product keeps my skin supple and plump the whole day. It just gets absorbed into my skin .",
      author: "The Boho Singer",
    },
    {
      id: 5,
      rating: 5,
      text: "My skin is so used to this essence now and can't live without it. I can't explain how good this is. The hydration is insane. My textures feels smoother now and my skin just loves this. 🫰🫰",
      author: "Imnasenla Aier",
    },
  ];

  const productImage = reviewimg;

  const [current, setCurrent] = useState(0);

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % reviews.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <h2 className="text-[#1e4323] text-center text-xl sm:text-2xl md:text-3xl font-headingOne mb-6 font-semibold leading-snug uppercase">
          REVIEWS
        </h2>

        {/* Outer scroll container */}
        <div className="overflow-x-auto flex snap-x snap-mandatory scroll-smooth gap-8 no-scrollbar h-full min-h-[350px]">
          {/* Grid wrapper with equal columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch min-w-full snap-center">
            {/* Review Box */}
            <div className="h-full flex flex-col justify-center items-center border border-gray-200 rounded-lg p-6 text-center shadow-sm bg-white">
              {/* Content */}
              <div className="flex-grow flex flex-col justify-center">
                {/* Stars */}
                <div className="flex space-x-1 text-yellow-400 mb-4 justify-center">
                  {Array.from({ length: reviews[current].rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                {/* Review Text */}
                <p className="text-gray-600 italic text-center mb-6">
                  "{reviews[current].text}"
                </p>
                {/* Author */}
                <p className=" text-[#835339] font-medium">
                  {reviews[current].author}
                </p>
              </div>

              {/* Dots below content */}
              <div className="flex justify-center mt-6 space-x-2">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrent(index)}
                    className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                      index === current ? "bg-[#835339]" : "bg-[#c1a88c]"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Image Box */}
            <div className="flex justify-center items-center bg-white rounded-lg shadow-md w-full h-full">
              <img
                src={productImage}
                alt="Melita Products"
                className="object-cover w-full h-full rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
