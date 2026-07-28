import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "How does the ATS check actually work?",
    answer:
      "We parse the text of your resume the same way an applicant tracking system would, then run it through a rules engine that checks formatting, section structure, contact info, action verbs, and quantifiable results — combined with an AI review for deeper, qualitative feedback.",
  },
  {
    question: "What's the difference between the general check and targeted check?",
    answer:
      "The general check scores your resume on its own merits — formatting, clarity, impact. The targeted check compares your resume against a specific job description and gives you a match score plus the exact keywords and skills you're missing for that role.",
  },
  {
    question: "Will the AI resume generator make things up?",
    answer:
      "No. It's instructed to only reorganize, rephrase, and emphasize your real, existing experience to better match a job description — it will not invent employers, titles, dates, or metrics that aren't implied by your original resume.",
  },
  {
    question: "What file formats can I upload?",
    answer: "PDF, DOCX, and plain text (.txt) are all supported.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Paid plans are billed monthly with no long-term commitment, and you can cancel or change plans anytime from your billing dashboard.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Frequently asked questions
        </h2>
      </div>

      <Accordion className="mt-10">
        {FAQS.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left text-base font-medium">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
