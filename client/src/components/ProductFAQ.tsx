import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Demo data for the FAQ component (same as before)
const demoFaqs = [
  {
    category: "Ingredients & Claims",
    questions: [
      {
        question: "Can I use this with active ingredients like Vitamin C, Retinol, or AHAs/BHAs?",
        answer: "Yes! It's formulated to layer seamlessly with actives and helps reduce irritation from potent ingredients."
      },
      {
        question: "Does it contain any harsh chemicals?",
        answer: "No. It's free from soap, sulphates, parabens, and other irritants."
      }
    ]
  },
  {
    category: "Packaging & Storage",
    questions: [
      {
        question: "Does this essence contain fragrance?",
        answer: "This essence is formulated without synthetic fragrances, but may have a subtle natural scent from its active ingredients."
      }
    ]
  },
  {
    category: "Skin Compatibility",
    questions: [
      {
        question: "What skin types is this product suitable for?",
        answer: "This product is suitable for all skin types, including sensitive, oily, and dry skin. Its gentle formula ensures it won't cause breakouts or irritation."
      }
    ]
  },
  {
    category: "Usage & Application",
    questions: [
      {
        question: "How and when should I apply this product?",
        answer: "For best results, apply 2-3 drops to a clean face, pat gently until absorbed, and follow with your favorite moisturizer. Use twice daily, in the morning and at night."
      }
    ]
  }
];

// Reusable Accordion Item component (same as before)
const AccordionItem = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div className="border-b border-b-[#835339] last:border-b-0 py-4">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center text-left focus:outline-none"
      >
        <span className="w-full flex justify-between items-center text-left text-text-secondary font-headingTwo font-semibold text-lg hover:text-[#835339]">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-[#835339] transition-transform duration-300" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-300" />
        )}
      </button>
      {isOpen && (
        <div className="mt-3 text-text-secondary font-para text-base leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
};

const FAQComponent = ({ faqData = demoFaqs }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [openQuestionIndex, setOpenQuestionIndex] = useState(0);

  const handleCategoryClick = (index) => {
    setActiveTab(index);
    setOpenQuestionIndex(0);
  };

  const handleQuestionToggle = (index) => {
    setOpenQuestionIndex(openQuestionIndex === index ? -1 : index);
  };

  const currentFaqCategory = faqData[activeTab];

  return (
    <section className="bg-white rounded-2xl p-4 md:p-8 max-w-7xl mx-auto my-8">
      <h2 className="text-center text-2xl sm:text-3xl font-semibold font-headingOne text-[#1e4323] mb-8">
        FAQ
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <ul className="space-y-2">
            {faqData.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => handleCategoryClick(index)}
                  className={`flex-shrink-0 text-base font-semibold whitespace-nowrap py-2 px-4 rounded-lg transition text-left border-l-4 w-full
                    ${activeTab === index
                      ? 'border-[#835339] text-[#4A4A4A] bg-gray-200'
                      : 'border-l-4 border-transparent text-[#835339] hover:bg-gray-100'
                    }`}
                >
                  {item.category}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {/* FAQ Content */}
        <div className="md:col-span-2">
          {currentFaqCategory && (
            <div className="space-y-4">
              {currentFaqCategory.questions.map((faq, index) => (
                <AccordionItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openQuestionIndex === index}
                  onToggle={() => handleQuestionToggle(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FAQComponent;