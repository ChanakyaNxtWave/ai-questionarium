import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Concept {
  Topic: string;
  Concept: string[];
}

interface TopicsSelectionProps {
  topics: Concept[];
  selectedTopics: string[];
  onTopicSelect: (topic: string) => void;
}

export const TopicsSelection = ({
  topics,
  selectedTopics,
  onTopicSelect,
}: TopicsSelectionProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Select Topics</h2>
      <div className="grid gap-4">
        {topics.map((topicData, index) => (
          <div
            key={topicData.Topic}
            className={cn(
              "p-4 rounded-lg border transition-all duration-200",
              selectedTopics.includes(topicData.Topic)
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-primary/50"
            )}
          >
            <button
              onClick={() => onTopicSelect(topicData.Topic)}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full border flex items-center justify-center",
                      selectedTopics.includes(topicData.Topic)
                        ? "border-primary bg-primary text-white"
                        : "border-gray-300"
                    )}
                  >
                    {selectedTopics.includes(topicData.Topic) && (
                      <Check className="w-4 h-4" />
                    )}
                  </div>
                  <span className="font-medium">{topicData.Topic}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {topicData.Concept.length} concepts
                </span>
              </div>
              {selectedTopics.includes(topicData.Topic) && (
                <div className="mt-3 ml-9 text-sm text-gray-600">
                  <ul className="list-disc space-y-1 pl-4">
                    {topicData.Concept.map((concept) => (
                      <li key={concept}>{concept}</li>
                    ))}
                  </ul>
                </div>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};