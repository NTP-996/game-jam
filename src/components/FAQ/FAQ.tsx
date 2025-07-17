"use client";

import { useState } from "react";
import Image from "next/image";
import "./FAQ.css";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "HOW DO I REGISTER FOR THIS HACKATHON?",
    answer: "Please click the register button at the top of the website and fill out the form.",
  },
  {
    question: "WHO CAN PARTICIPATE IN THIS HACKATHON?",
    answer: "This hackathon is eligible for teams from Vietnam, Japan, South Korea, Indonesia, Pakistan, Singapore, China, Malaysia, Thailand, Philippines, India, Nigeria, Hong Kong.",
  },
  {
    question: "HOW ARE THE PRIZES DISTRIBUTED?",
    answer: "The prizes will be distributed in two milestones: during post-hack and fully distributed at the end of the second milestone.",
  },
  {
    question: "CAN I USE PRE-EXISTING CODE?",
    answer: "If pre-existing material is used, judging will focus on the new Web3 functionalities that are built or added. For open-source assets or 3rd party assets, clearly state the library and code snippets used and properly license and credit sources.",
  },
  {
    question: "INTELLECTUAL PROPERTY RIGHTS",
    answer: "All participants retain IP rights but grant organizers the right to showcase or feature the game.",
  },
];

export default function FAQ() {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleItem(index);
    }
  };

  return (
    <section id="faq" className="faq">
      <div className="faq__wrapper">
        <h2 className="section__title">
          <Image src="/assets/text/faq.svg" alt="FAQ" width={400} height={100} />
        </h2>
        <div className="faq__container">
          {faqData.map((item, index) => (
            <div key={index} className="faq__item">
              <button 
                className="faq__question" 
                aria-expanded={expandedItems.includes(index)}
                onClick={() => toggleItem(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              >
                <span className="faq__arrow"></span>
                <span className="faq__question-text">{item.question}</span>
              </button>
              <div className={`faq__answer ${expandedItems.includes(index) ? 'expanded' : ''}`}>
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 