
import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { MCQ } from "@/types/mcq";
import ReactMarkdown from "react-markdown";

interface QuestionCardProps {
  question: MCQ;
  index: number;
  isEditing: boolean;
  editedQuestion: MCQ | null;
  onEdit: (question: MCQ) => void;
  onCancelEdit: () => void;
  onSaveEdit: (question: MCQ) => void;
  onDelete: (question: MCQ) => void;
  onSelect: (question: MCQ) => void;
  onEditQuestionChange: (field: keyof MCQ, value: any) => void;
  isSelected: boolean;
}

export const QuestionCard = ({
  question,
  index,
  isEditing,
  editedQuestion,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onSelect,
  onEditQuestionChange,
  isSelected,
}: QuestionCardProps) => {
  return (
    <div className="p-6 border rounded-lg space-y-4 bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
            <div className="flex items-center gap-4">
              <Checkbox
                id={`select-${question.id}`}
                checked={isSelected}
                onCheckedChange={() => onSelect(question)}
              />
              <span className="font-medium text-primary">{question.unitTitle}</span>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>{question.topic} - {question.concept}</span>
            <span>Learning Outcome: {question.learningOutcome}</span>
          </div>
          
          <div className="space-y-4 mt-4">
            {isEditing ? (
              <textarea
                className="w-full p-2 border rounded"
                value={editedQuestion?.questionText || ''}
                onChange={(e) => onEditQuestionChange('questionText', e.target.value)}
              />
            ) : (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{`${index + 1}. ${question.questionText}`}</ReactMarkdown>
              </div>
            )}
            
            {question.code && question.code !== "NA" && (
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
                  {isEditing ? (
                    <input
                      type="text"
                      className="flex-1 p-1 border rounded"
                      value={editedQuestion?.options[optIndex]?.text || ''}
                      onChange={(e) => {
                        if (editedQuestion) {
                          const newOptions = [...editedQuestion.options];
                          newOptions[optIndex] = {
                            ...newOptions[optIndex],
                            text: e.target.value
                          };
                          onEditQuestionChange('options', newOptions);
                        }
                      }}
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none flex-1">
                      <ReactMarkdown>{option.text}</ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-primary/5 rounded-md">
              <p className="font-medium text-primary">Explanation:</p>
              {isEditing ? (
                <textarea
                  className="w-full mt-2 p-2 border rounded"
                  value={editedQuestion?.explanation || ''}
                  onChange={(e) => onEditQuestionChange('explanation', e.target.value)}
                />
              ) : (
                <div className="prose prose-sm max-w-none mt-1 text-gray-600">
                  <ReactMarkdown>{question.explanation || ''}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 ml-4">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onSaveEdit(question)}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={onCancelEdit}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit(question)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onDelete(question)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
