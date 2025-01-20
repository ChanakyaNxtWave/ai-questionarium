import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface MCQ {
  id: string;
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
  is_selected?: boolean;
}

interface MCQDisplayProps {
  questions: MCQ[];
  onQuestionDelete?: (id: string) => void;
  onQuestionSelect?: (id: string, isSelected: boolean) => void;
  onQuestionsUpdate?: () => void;
}

export const MCQDisplay = ({ 
  questions,
  onQuestionDelete,
  onQuestionSelect,
  onQuestionsUpdate
}: MCQDisplayProps) => {
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('generated_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      onQuestionDelete?.(id);
      toast({
        title: "Question deleted",
        description: "The question has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete the question. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelect = async (id: string, isSelected: boolean) => {
    try {
      const { error } = await supabase
        .from('generated_questions')
        .update({ is_selected: isSelected })
        .eq('id', id);

      if (error) throw error;

      onQuestionSelect?.(id, isSelected);
      toast({
        title: isSelected ? "Question selected" : "Question unselected",
        description: `The question has been ${isSelected ? 'selected' : 'unselected'}.`,
      });
    } catch (error) {
      console.error('Error updating question selection:', error);
      toast({
        title: "Error",
        description: "Failed to update question selection. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold mb-6">Generated Questions</h2>
      {questions.map((question, index) => (
        <div
          key={question.id}
          className="p-6 border rounded-lg space-y-4 bg-white shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <Checkbox
                id={`select-${question.id}`}
                checked={question.is_selected}
                onCheckedChange={(checked) => handleSelect(question.id, checked as boolean)}
              />
              <div className="text-sm text-gray-500">
                <span>{question.topic} - {question.concept}</span>
                <div>Learning Outcome: {question.learningOutcome}</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700"
              onClick={() => handleDelete(question.id)}
            >
              Delete
            </Button>
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