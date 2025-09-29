import { useState } from "react";
import { Button } from "@/components/ui/button";
import quizbanner from "@/assets/quiz_banner.jpg";
import mobilequizbanner from "@/assets/quiz_mobile.png";
import cleanser1 from "@/assets/product_img/cleanser/cleanser1.jpg";
import moisturizer1 from "@/assets/product_img/moisturizer/moisturizer1.jpg";
import essence1 from "@/assets/product_img/essence/essence1.jpg";
import sunscreen1 from "@/assets/product_img/sunscreen/sunscreen1.jpg";
import { X } from "lucide-react";

const questions = [
  {
    question: "How does your skin most often feel?",
    options: [
      { label: "A. Tight, dry, or flaky", value: "A" },
      { label: "B. Comfortable but dull-looking", value: "B" },
      { label: "C. Soft, hydrated, and glowing", value: "C" },
    ],
  },
  {
    question: "Do you notice redness, sensitivity, or irritation?",
    options: [
      { label: "A. Frequently, especially after using new products", value: "A" },
      { label: "B. Sometimes, but manageable", value: "B" },
      { label: "C. Rarely or never", value: "C" },
    ],
  },
  {
    question: "How does your skin respond to active ingredients like acids or retinoids?",
    options: [
      { label: "A. I get irritation or flakiness", value: "A" },
      { label: "B. Sometimes sensitive, but okay with gentle use", value: "B" },
      { label: "C. No issues; I tolerate actives well", value: "C" },
    ],
  },
  {
    question: "How often does your skin feel dehydrated or dull?",
    options: [
      { label: "A. Very often", value: "A" },
      { label: "B. Occasionally", value: "B" },
      { label: "C. Rarely or never", value: "C" },
    ],
  },
  {
    question: "How does your skin handle environmental factors like pollution or cold weather?",
    options: [
      { label: "A. Gets irritated or flakes easily", value: "A" },
      { label: "B. Sometimes reactive", value: "B" },
      { label: "C. Mostly unaffected", value: "C" },
    ],
  },
];

const productRecommendations = {
  dry: [
    {
      name: "Melita Renewing Gel Cleanser",
      image: cleanser1,
      link: "/products/hydrating-gentle-cleanser",
    },
    {
      name: "Melita Balancing Moisturizer",
      image: moisturizer1,
      link: "/product_img/moisturizer/moisturizer1.jpg",
    },
    {
      name: "Melita Ultra Hydrating Essence",
      image: essence1,
      link: "/product_img/essence/essence1.jpg",
    },
    {
      name: "Melita Ultra Protecting Sunscreen",
      image: sunscreen1,
      link: "/product_img/sunscreen/sunscreen1.jpg",
    },
  ],
  balanced: [
    {
      name: "Gentle Purifying Cleanser",
      image: cleanser1,
      link: "/product_img/cleanser/cleanser1.jpg",
    },
    {
      name: "Balancing Skin Essence",
      image: essence1,
      link: "/product_img/essence/essence1.jpg",
    },
    {
      name: "Lightweight Moisturizer",
      image: moisturizer1,
      link: "/product_img/moisturizer/moisturizer1.jpg",
    },
    {
      name: "Everyday Broad-Spectrum SPF",
      image: sunscreen1,
      link: "/products/spf2",
    },
  ],
  resilient: [
    {
      name: "Gentle Daily Cleanser",
      image: cleanser1,
      link: "/products/cleanser3",
    },
    {
      name: "Hydra-Boost Essence",
      image: essence1,
      link: "/products/essence3",
    },
    {
      name: "Light Moisturizing Gel",
      image: moisturizer1,
      link: "/products/moisturizer3",
    },
    {
      name: "Broad-Spectrum SPF 30",
      image: sunscreen1,
      link: "/products/spf3",
    },
  ],
};

const recommendationText = {
  dry: `Your skin shows signs of dryness or sensitivity.
✨ Recommended Routine: Gentle cleanser + hydrating essence + nourishing moisturizer + SPF.`,
  balanced: `Your skin is balanced but benefits from support.
✨ Recommended Routine: Gentle cleanser + essence + moisturizer (optional) + SPF.`,
  resilient: `Your skin is resilient and healthy.
✨ Recommended Routine: Maintain routine with cleanser, essence, moisturizer (optional), and SPF.`,
};

const SkinQuiz = () => {
  const [step, setStep] = useState("intro"); // intro | quiz | result
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState<string | null>(null);

  const handleStart = () => {
    setStep("quiz");
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
  };

  const handleNext = () => {
    if (!selected) return;
    setAnswers([...answers, selected]);
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setSelected(null);
    } else {
      setStep("result");
    }
  };

  const handleRestart = () => {
    setStep("intro");
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
  };

  const handleClose = () => {
    setStep("intro");
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
  };

  const getResult = () => {
    const counts = { A: 0, B: 0, C: 0 };
    answers.forEach((v) => counts[v]++);
    let majority = "A";
    if (counts.B > counts.A && counts.B >= counts.C) majority = "B";
    else if (counts.C > counts.A && counts.C > counts.B) majority = "C";
    const key = { A: "dry", B: "balanced", C: "resilient" }[majority];
    return { key, recs: productRecommendations[key], text: recommendationText[key] };
  };

  return (
    <section id="skin-quiz" className="bg-white flex items-center justify-center mt-10 px-4 sm:px-8">
      <div className="w-full space-y-8">
        <h2 className="text-[#1e4323] text-xl sm:text-2xl md:text-3xl font-headingOne font-semibold leading-snug uppercase max-w-7xl mx-auto text-center mb-6">
          Discover your skin barrier's health in 2 minutes
        </h2>

        {/* Intro */}
        {step === "intro" && (
          <section id="intro-section" className="relative overflow-hidden shadow-2xl">
            <img
              src={mobilequizbanner}
              alt="Quiz banner"
              className="md:hidden w-full h-[300px] object-cover"
            />
            <img
              src={quizbanner}
              alt="Quiz banner"
              className="hidden md:block w-full h-[380px] object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-start px-6 md:px-12">
              <div className="flex flex-col items-start ">
                <h3 className="hidden md:block text-[#835339] text-xl md:text-3xl font-headingOne font-medium uppercase">
                  Take the quiz to know more
                </h3>
                <Button
                  onClick={handleStart}
                  className="mt-28 md:mt-6 px-6 py-2 bg-[#835339] text-white font-semibold rounded-sm hover:bg-white hover:text-[#835339] hover:border border-[#835339] transition uppercase rounded-none"
                >
                  Find out now
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-slateGray/20">
                <div className="h-1 bg-[#835339] w-1/4"></div>
              </div>
            </div>
          </section>
        )}

        {/* Quiz */}
        {step === "quiz" && (
          <section
            id="quiz-section"
            className="bg-white rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-10 space-y-8 transition-all"
          >
            <div className="flex justify-end">
              <button
                id="closeQuiz"
                onClick={handleClose}
                className="flex items-center gap-2 text-[#835339] hover:text-red-600 font-semibold uppercase text-sm lg:text-base transition"
              >
                <X className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>
            </div>
            <div className="space-y-6 text-center">
              <h3 className="text-2xl sm:text-3xl font-bold text-midnightBlue">
                {questions[current].question}
              </h3>
              <div className="space-y-4">
                {questions[current].options.map((opt) => (
                  <label
                    key={opt.value}
                    className={`block bg-slate-100 rounded-xl p-1 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                      selected === opt.value ? "ring-2 ring-[#835339]" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name={`option-${current}`}
                      value={opt.value}
                      className="hidden"
                      checked={selected === opt.value}
                      onChange={() => setSelected(opt.value)}
                    />
                    <div
                      className={`rounded-lg px-5 py-3 text-charcoalGray transition ${
                        selected === opt.value
                          ? "bg-[#835339] text-white font-bold"
                          : "hover:bg-[#f4e8e2]"
                      }`}
                    >
                      {opt.label}
                    </div>
                  </label>
                ))}
              </div>
              <Button
                onClick={handleNext}
                disabled={!selected}
                className={`px-6 py-2 font-semibold rounded-md transition uppercase ${
                  selected
                    ? "bg-[#835339] text-white hover:bg-white hover:text-[#835339] hover:border border-[#835339] transform hover:scale-105"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {current + 1 === questions.length ? "See Results" : "Next"}
              </Button>
            </div>
          </section>
        )}

        {/* Result */}
        {step === "result" && (() => {
          const { recs, text } = getResult();
          return (
            <section
              id="result-section"
              className="bg-white rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-10 space-y-8 text-center transition-all"
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-midnightBlue mb-6">
                Your Melita Match
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recs.map((prod) => (
                  <a
                    key={prod.name}
                    href={prod.link}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center p-3 bg-white rounded-xl shadow hover:shadow-lg transition hover:scale-[1.02]"
                  >
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-30 md:h-52 object-contain rounded-lg mb-3"
                    />
                    <div className="text-sm font-medium text-midnightBlue">{prod.name}</div>
                  </a>
                ))}
              </div>
              <p className="text-base sm:text-lg text-charcoalGray whitespace-pre-line">{text}</p>
              <button
                id="restartQuiz"
                onClick={handleRestart}
                className="mt-6 bg-[#835339] hover:bg-white text-white hover:text-[#835339] hover:border border-[#835339] font-semibold py-3 px-6 rounded-md transition transform hover:scale-105"
              >
                Retake Quiz
              </button>
            </section>
          );
        })()}
      </div>
    </section>
  );
};

export default SkinQuiz;
