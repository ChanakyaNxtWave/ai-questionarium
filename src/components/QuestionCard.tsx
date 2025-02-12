
import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
  const isMultipleAnswer = question.questionType === 'MORE_THAN_ONE_MULTIPLE_CHOICE' || 
                          question.questionType === 'CODE_ANALYSIS_MORE_THAN_ONE_MULTIPLE_CHOICE';
  const isCodeQuestion = question.questionType === 'CODE_ANALYSIS_MULTIPLE_CHOICE' || 
                        question.questionType === 'CODE_ANALYSIS_MORE_THAN_ONE_MULTIPLE_CHOICE';

  const correctOptions = question.options.filter(opt => opt.isCorrect).map(opt => opt.id);

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

          {question.learningOutcome && (
            <div className="text-sm text-sky-500 mb-4">
              LEARNING_OUTCOME: {question.learningOutcome}
            </div>
          )}
          
          <div className="space-y-4">
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
            
            {isCodeQuestion && question.code && question.code !== "NA" && (
              <div className="relative">
                <pre className="p-4 bg-gray-50 rounded-md overflow-x-auto">
                  <code className="language-sql">{question.code}</code>
                </pre>
                <div className="absolute top-2 right-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                  {question.codeLanguage || 'SQL'}
                </div>
              </div>
            )}

            <div className="mt-4">
              {isEditing ? (
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      <input
                        type="text"
                        className="flex-1 p-2 border rounded"
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
                    </div>
                  ))}
                </div>
              ) : isMultipleAnswer ? (
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-start gap-3 p-3 rounded border">
                      <Checkbox
                        id={`option-${question.id}-${optIndex}`}
                        checked={option.isCorrect}
                        disabled
                      />
                      <Label
                        htmlFor={`option-${question.id}-${optIndex}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{option.text}</ReactMarkdown>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <RadioGroup defaultValue={correctOptions[0]} className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-start gap-3 p-3 rounded border">
                      <RadioGroupItem
                        value={option.id}
                        id={`option-${question.id}-${optIndex}`}
                        disabled
                        checked={option.isCorrect}
                      />
                      <Label
                        htmlFor={`option-${question.id}-${optIndex}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{option.text}</ReactMarkdown>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
            
            {question.explanation && (
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
                    <ReactMarkdown>{question.explanation}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}
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
                variant="destructive"
                size="sm"
                onClick={() => onDelete(question)}
              >
                Delete
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => onEdit(question)}
              >
                Edit
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
