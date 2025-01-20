import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MCQ {
  id?: string;
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
  onQuestionsUpdate?: (questions: MCQ[]) => void;
}

export const MCQDisplay = ({ questions, onQuestionsUpdate }: MCQDisplayProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<MCQ | null>(null);
  const { toast } = useToast();

  const handleEdit = (question: MCQ) => {
    setEditingId(question.id || null);
    setEditedQuestion({ ...question });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedQuestion(null);
  };

  const handleSaveEdit = async (question: MCQ) => {
    if (!question.id || !editedQuestion) return;

    try {
      const { error } = await supabase
        .from('generated_questions')
        .update({
          question_text: editedQuestion.questionText,
          explanation: editedQuestion.explanation,
          options: editedQuestion.options,
          correct_option: editedQuestion.correctOption
        })
        .eq('id', question.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question updated successfully",
      });

      // Update local state
      const updatedQuestions = questions.map(q => 
        q.id === question.id ? editedQuestion : q
      );
      if (onQuestionsUpdate) {
        onQuestionsUpdate(updatedQuestions);
      }
    } catch (error) {
      console.error('Error updating question:', error);
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive",
      });
    }

    setEditingId(null);
    setEditedQuestion(null);
  };

  const handleDelete = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('generated_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question deleted successfully",
      });

      // Update local state
      const updatedQuestions = questions.filter(q => q.id !== questionId);
      if (onQuestionsUpdate) {
        onQuestionsUpdate(updatedQuestions);
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

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
            {editingId === question.id ? (
              <>
                <textarea
                  className="w-full p-2 border rounded"
                  value={editedQuestion?.questionText}
                  onChange={(e) => setEditedQuestion(prev => prev ? {
                    ...prev,
                    questionText: e.target.value
                  } : null)}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSaveEdit(question)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-start">
                <p className="font-medium">{index + 1}. {question.questionText}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(question)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => question.id && handleDelete(question.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
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