import React from "react";

interface QuestionsDisplayProps {
  questions: string;
}

export const QuestionsDisplay = ({ questions }: QuestionsDisplayProps) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Generated Questions</h2>
      <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
        {questions}
      </pre>
    </div>
  );
};