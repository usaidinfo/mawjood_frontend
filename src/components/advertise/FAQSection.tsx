'use client';

import { useState } from 'react';
import { ChevronDown, CheckCircle2, Shield } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: 'What benefits will I get from a paid listing on Mawjood?',
    answer: 'A paid listing on Mawjood gives you premium visibility, guaranteed leads, online catalogue, payment solutions, smart lead management, competitor analysis, and premium customer support. You also get access to verified seals and trust stamps to build credibility.',
  },
  {
    question: 'How can I choose the best paid plan for me?',
    answer: 'Consider your business goals and budget. The 1-year plan is great for testing, while longer plans offer better value with discounts. The Growth plan is recommended for maximum exposure and includes top 5 visibility guarantees.',
  },
  {
    question: 'How does Verified + Trust work?',
    answer: 'Verified Seal requires KYC verification and shows your business is legitimate. Trust Stamp is awarded to businesses with 3.8+ star ratings and indicates high trustworthiness. Both badges appear on your listing to build customer confidence.',
  },
  {
    question: 'What are the advantages of upgrading, and how do the different packages differ?',
    answer: 'Upgrading gives you higher search visibility, more leads, better placement, and access to premium features. Longer plans (2-3 years) offer better discounts and include Trust Stamp. The Growth plan guarantees top 5 visibility.',
  },
  {
    question: 'What payment methods are available?',
    answer: 'We accept all major credit cards, debit cards, and bank transfers. Payment can be made securely through our payment gateway with multiple options available.',
  },
  {
    question: 'Can I change my package later?',
    answer: 'Yes, you can upgrade your package at any time. Contact our support team to discuss upgrade options and prorated pricing.',
  },
  {
    question: 'Can I receive leads only from specific areas?',
    answer: 'Yes, you can target specific cities, regions, or areas. Our smart lead system allows you to filter and receive leads from your preferred locations.',
  },
  {
    question: 'Can I stop the campaign and start it later?',
    answer: 'Yes, you can pause your campaign and resume it later. However, please note that some plans may have specific terms regarding pauses. Contact support for details.',
  },
  {
    question: 'Will the monthly payment change during my contract?',
    answer: 'No, your payment amount is locked in for the duration of your contract. The price you agree to at signup remains the same throughout your subscription period.',
  },
  {
    question: 'What is the minimum tenure for plans available on Mawjood?',
    answer: 'The minimum tenure is 1 year. We offer 1-year, 2-year, and 3-year plans, with longer plans offering better discounts and additional features.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Got a Question?
          </h2>
          <p className="text-lg text-gray-600">
            Find answers to common questions about our advertising plans
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">
                  {faq.question.includes('Verified + Trust') ? (
                    <span className="flex items-center gap-2">
                      How does{' '}
                      <span className="flex items-center gap-1 text-blue-600">
                        <CheckCircle2 className="w-4 h-4" />
                        Verified
                      </span>
                      {' + '}
                      <span className="flex items-center gap-1 text-yellow-600">
                        <Shield className="w-4 h-4" />
                        Trust
                      </span>
                      {' '}work?
                    </span>
                  ) : (
                    faq.question
                  )}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

