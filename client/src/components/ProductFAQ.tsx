import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';



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

type FaqItem = { category: string; questions: { question: string; answer: string }[] };

interface FAQComponentProps {
  slug?: string;

}

const FAQComponent: React.FC<FAQComponentProps> = ({ slug }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [openQuestionIndex, setOpenQuestionIndex] = useState(0);
  const [fetchedFaqs, setFetchedFaqs] = useState<FaqItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch FAQs by slug when provided
  useEffect(() => {
    let isMounted = true;
    const fetchFaqs = async () => {
      if (!slug) {
        setFetchedFaqs(null);
        setLoading(false);
        setError(null);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/products/slug/${slug}/faq`);
        if (!res.ok) {
          throw new Error(`Failed to load FAQ (${res.status})`);
        }
        const data = await res.json();
        const apiFaq = Array.isArray(data?.data) ? data.data : [];
        // Map backend { title, questions } -> UI { category, questions }
        const mapped: FaqItem[] = apiFaq.map((grp: any) => ({
          category: grp.title ?? 'FAQ',
          questions: Array.isArray(grp.questions) ? grp.questions : []
        }));
        if (isMounted) {
          setFetchedFaqs(mapped);
          setActiveTab(0);
          setOpenQuestionIndex(0);
        }
      } catch (e: any) {
        if (isMounted) setError(e?.message || 'Failed to load FAQ');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchFaqs();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const dataToUse: FaqItem[] = fetchedFaqs ?? [];
  const hasData = dataToUse.length > 0;

  const handleCategoryClick = (index) => {
    setActiveTab(index);
    setOpenQuestionIndex(0);
  };

  const handleQuestionToggle = (index) => {
    setOpenQuestionIndex(openQuestionIndex === index ? -1 : index);
  };

  const currentFaqCategory = hasData ? dataToUse[activeTab] : undefined;

  return (
    <section className="bg-white rounded-2xl p-4 md:p-8 max-w-7xl mx-auto my-8">
      <h2 className="text-center text-2xl sm:text-3xl font-semibold font-headingOne text-[#1e4323] mb-8">
        FAQ
      </h2>
      {loading && (
        <div className="text-center text-sm text-gray-500 mb-4">Loading FAQs...</div>
      )}
      {error && (
        <div className="text-center text-sm text-red-600 mb-4">{error}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <ul className="space-y-2">
            {hasData && dataToUse.map((item, index) => (
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
          {!loading && !error && !hasData && (
            <div className="text-sm text-gray-500">No FAQs available for this product.</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FAQComponent;