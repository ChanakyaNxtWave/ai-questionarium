import React from "react";

interface TopicsDisplayProps {
  topics: string;
}

export const TopicsDisplay = ({ topics }: TopicsDisplayProps) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Generated Topics</h2>
      <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
        {topics}
      </pre>
    </div>
  );
};