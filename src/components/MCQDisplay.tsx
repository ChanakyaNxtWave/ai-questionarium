import React from "react";

interface MCQ {
  topic: string;
  concept: string;
  questionKey: string;
  questionText: string;
  learningOutcome: string;
  contentType: string;
  questionType: string;
  code: string;
  codeLanguage: string;
  options: string[];
  correctOption: string;
  explanation: string;
  bloomLevel: string;
}

interface MCQDisplayProps {
  questions: MCQ[];
}

export const MCQDisplay = ({ questions }: MCQDisplayProps) => {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold mb-6">Generated Questions</h2>
      {questions.map((question, index) => (
        <div
          key={question.questionKey}
          className="p-6 border rounded-lg space-y-4 bg-white shadow-sm"
        >
          <div className="flex justify-between text-sm text-gray-500">
            <span>{question.topic} - {question.concept}</span>
            <span>Learning Outcome: {question.learningOutcome}</span>
          </div>
          
          <div className="space-y-4">
            <p className="font-medium">{index + 1}. {question.questionText}</p>
            
            {question.code !== "NA" && (
              <pre className="p-4 bg-gray-50 rounded-md overflow-x-auto">
                <code>{question.code}</code>
              </pre>
            )}
            
            <div className="space-y-2">
              {question.options.map((option, optIndex) => (
                <div
                  key={optIndex}
                  className="flex items-start gap-3 p-3 rounded border hover:bg-gray-50"
                >
                  <div className="w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0">
                    {String.fromCharCode(65 + optIndex)}
                  </div>
                  <div>{option}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-primary/5 rounded-md">
              <p className="font-medium text-primary">Explanation:</p>
              <p className="mt-1 text-gray-600">{question.explanation}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};