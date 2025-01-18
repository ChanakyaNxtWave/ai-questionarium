import React from "react";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Question {
  topic: string;
  concept: string;
  prerequisites: string[];
  questionText: string;
  contentType: string;
  questionType: string;
  code: string | null;
  codeLanguage: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  bloomLevel: string;
}

interface QuestionsDisplayProps {
  questions: string;
}

export const QuestionsDisplay = ({ questions }: QuestionsDisplayProps) => {
  const parsedQuestions = React.useMemo(() => {
    try {
      const parsed = JSON.parse(questions);
      // Ensure we're working with an array of questions
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      console.error("Error parsing questions:", error);
      return [];
    }
  }, [questions]);

  const renderCode = (code: string | null, language: string) => {
    if (!code) return null;
    return (
      <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto my-2">
        <code className={`language-${language.toLowerCase()}`}>{code}</code>
      </pre>
    );
  };

  return (
    <Card className="mt-8 p-6">
      <h2 className="text-2xl font-bold mb-4">Generated Questions</h2>
      <Accordion type="single" collapsible className="space-y-4">
        {parsedQuestions.map((question, index) => (
          <AccordionItem key={index} value={`question-${index}`}>
            <AccordionTrigger className="text-left">
              Question {index + 1}: {question.concept}
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div>
                <h4 className="font-semibold mb-2">Question:</h4>
                <p>{question.questionText}</p>
                {question.questionType === "CODE_ANALYSIS_MULTIPLE_CHOICE" && 
                  renderCode(question.code, question.codeLanguage)}
              </div>
              <div>
                <h4 className="font-semibold mb-2">Options:</h4>
                <ul className="list-disc pl-6 space-y-2">
                  {question.options.map((option, optIndex) => (
                    <li
                      key={optIndex}
                      className={optIndex === question.correctAnswer ? "text-green-600 font-medium" : ""}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Explanation:</h4>
                <p>{question.explanation}</p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>Topic: {question.topic}</span>
                <span>Type: {question.questionType}</span>
                <span>Level: {question.bloomLevel}</span>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  );
};