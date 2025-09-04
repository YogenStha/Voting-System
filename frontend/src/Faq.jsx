import React, { useState } from 'react';
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: 'Is ChunabE truly secure?',
    answer:
      'Yes, VoteSecure employs advanced end-to-end encryption, robust authentication methods, and transparent audit trails to ensure the highest level of security and integrity for every election.',
  },
  {
    question: 'How does ChunabE ensure voter anonymity?',
    answer:
      'Our system is designed to separate voter identity from their ballot, ensuring complete anonymity while maintaining the ability to verify that only eligible voters participate.',
  },
  {
    question: 'Can we customize the voting process?',
    answer:
      'Absolutely! VoteSecure offers extensive customization options for ballot design, voter eligibility, election timelines, and reporting to fit your specific needs.',
  },
  {
    question: 'Is technical expertise required to use ChunabE?',
    answer:
      'No, VoteSecure is designed with user-friendliness in mind. Our intuitive interface makes it easy for anyone to set up and manage elections, with minimal technical expertise required.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 bg-gray-100 rounded-t-3xl rounded-b-3xl shadow-inner">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md cursor-pointer transition duration-300 hover:shadow-lg"
              onClick={() => toggleFAQ(index)}
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-2">
                <HelpCircle className="w-5 h-5 mr-2 text-indigo-600" />
                {faq.question}
              </h3>
              {openIndex === index && (
                <p className="text-gray-700 mt-2">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}