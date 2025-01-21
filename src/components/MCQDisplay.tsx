import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
}

interface MCQDisplayProps {
  questions: MCQ[];
}

export const MCQDisplay = ({ questions: initialQuestions }: MCQDisplayProps) => {
  const [questions, setQuestions] = useState<MCQ[]>(initialQuestions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<MCQ | null>(null);
  const { toast } = useToast();

  const handleEdit = (question: MCQ) => {
    if (!question.id) {
      console.error('Question ID is undefined');
      toast({
        title: "Error",
        description: "Cannot edit question: ID is missing",
        variant: "destructive",
      });
      return;
    }
    setEditingId(question.id);
    setEditedQuestion({ ...question });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedQuestion(null);
  };

  const handleSaveEdit = async (question: MCQ) => {
    if (!question.id || !editedQuestion) {
      console.error('Question ID or edited question is undefined');
      toast({
        title: "Error",
        description: "Cannot save question: Missing required data",
        variant: "destructive",
      });
      return;
    }

    try {
      // First, try to fetch the question to get its UUID
      const { data: questionData, error: fetchError } = await supabase
        .from('generated_questions')
        .select('id')
        .eq('question_key', question.questionKey)
        .single();

      if (fetchError) {
        console.error('Error fetching question:', fetchError);
        throw fetchError;
      }

      if (!questionData?.id) {
        throw new Error('Question not found in database');
      }

      const { error: updateError } = await supabase
        .from('generated_questions')
        .update({
          question_text: editedQuestion.questionText,
          explanation: editedQuestion.explanation,
          options: editedQuestion.options,
          correct_option: editedQuestion.correctOption,
        })
        .eq('id', questionData.id);

      if (updateError) throw updateError;

      setQuestions(questions.map(q => 
        q.id === question.id ? { ...q, ...editedQuestion } : q
      ));
      
      toast({
        title: "Success",
        description: "Question updated successfully",
      });
      
      setEditingId(null);
      setEditedQuestion(null);
    } catch (error) {
      console.error('Error updating question:', error);
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (question: MCQ) => {
    if (!question.id) {
      console.error('Question ID is undefined');
      toast({
        title: "Error",
        description: "Cannot delete question: ID is missing",
        variant: "destructive",
      });
      return;
    }

    try {
      // First, try to fetch the question to get its UUID
      const { data: questionData, error: fetchError } = await supabase
        .from('generated_questions')
        .select('id')
        .eq('question_key', question.questionKey)
        .single();

      if (fetchError) {
        console.error('Error fetching question:', fetchError);
        throw fetchError;
      }

      if (!questionData?.id) {
        throw new Error('Question not found in database');
      }

      const { error: deleteError } = await supabase
        .from('generated_questions')
        .delete()
        .eq('id', questionData.id);

      if (deleteError) throw deleteError;

      setQuestions(questions.filter(q => q.id !== question.id));
      
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
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
          key={question.id || question.questionKey}
          className="p-6 border rounded-lg space-y-4 bg-white shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-500">
                <span>{question.topic} - {question.concept}</span>
                <span>Learning Outcome: {question.learningOutcome}</span>
              </div>
              
              <div className="space-y-4 mt-4">
                {editingId === question.id ? (
                  <textarea
                    className="w-full p-2 border rounded"
                    value={editedQuestion?.questionText}
                    onChange={(e) => setEditedQuestion({
                      ...editedQuestion!,
                      questionText: e.target.value
                    })}
                  />
                ) : (
                  <p className="font-medium">{index + 1}. {question.questionText}</p>
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
                      {editingId === question.id ? (
                        <input
                          type="text"
                          className="flex-1 p-1 border rounded"
                          value={editedQuestion?.options[optIndex]}
                          onChange={(e) => {
                            const newOptions = [...editedQuestion!.options];
                            newOptions[optIndex] = e.target.value;
                            setEditedQuestion({
                              ...editedQuestion!,
                              options: newOptions
                            });
                          }}
                        />
                      ) : (
                        <div>{option}</div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-4 bg-primary/5 rounded-md">
                  <p className="font-medium text-primary">Explanation:</p>
                  {editingId === question.id ? (
                    <textarea
                      className="w-full mt-2 p-2 border rounded"
                      value={editedQuestion?.explanation}
                      onChange={(e) => setEditedQuestion({
                        ...editedQuestion!,
                        explanation: e.target.value
                      })}
                    />
                  ) : (
                    <p className="mt-1 text-gray-600">{question.explanation}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 ml-4">
              {editingId === question.id ? (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleSaveEdit(question)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(question)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(question)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};