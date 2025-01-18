import React from "react";
import { Card } from "@/components/ui/card";

interface TopicsDisplayProps {
  topics: string;
}

export const TopicsDisplay = ({ topics }: TopicsDisplayProps) => {
  return (
    <Card className="mt-8 p-6">
      <h2 className="text-2xl font-bold mb-4">Generated Topics</h2>
      <div className="prose prose-sm max-w-none">
        {topics.split('\n').map((line, index) => (
          <p key={index} className="mb-2">
            {line}
          </p>
        ))}
      </div>
    </Card>
  );
};