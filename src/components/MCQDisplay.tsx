import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { QuestionCard } from "./QuestionCard";
import { MCQ } from "@/types/mcq";

interface MCQDisplayProps {
  questions: MCQ[];
}

export const MCQDisplay = ({ questions: initialQuestions }: MCQDisplayProps) => {
  const [questions, setQuestions] = useState<MCQ[]>(
    initialQuestions.map(q => ({
      ...q,
      id: q.id || uuidv4()
    }))
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<MCQ | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setQuestions(initialQuestions.map(q => ({
      ...q,
      id: q.id || uuidv4()
    })));
  }, [initialQuestions]);

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
      const { error: updateError } = await supabase
        .from('generated_questions')
        .update({
          question_text: editedQuestion.questionText,
          explanation: editedQuestion.explanation,
          options: editedQuestion.options,
          correct_option: editedQuestion.correctOption,
        })
        .eq('question_key', question.questionKey);

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
      const { error: deleteError } = await supabase
        .from('generated_questions')
        .delete()
        .eq('question_key', question.questionKey);

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

  const handleSelect = async (question: MCQ) => {
    try {
      console.log('Updating selection for question:', question.questionKey);
      const newIsSelected = !question.isSelected;
      
      // Update local state first for immediate UI feedback
      setQuestions(prevQuestions => 
        prevQuestions.map(q => 
          q.id === question.id ? { ...q, isSelected: newIsSelected } : q
        )
      );

      // Show toast immediately
      toast({
        title: "Success",
        description: `Question ${newIsSelected ? 'selected' : 'unselected'} successfully`,
      });

      // Then update in database
      const { error: updateError } = await supabase
        .from('generated_questions')
        .update({
          is_selected: newIsSelected
        })
        .eq('question_key', question.questionKey);

      if (updateError) {
        console.error('Supabase update error:', updateError);
        // Revert local state if database update fails
        setQuestions(prevQuestions => 
          prevQuestions.map(q => 
            q.id === question.id ? { ...q, isSelected: !newIsSelected } : q
          )
        );
        toast({
          title: "Error",
          description: "Failed to update question selection",
          variant: "destructive",
        });
        throw updateError;
      }

      console.log('Selection updated successfully');
    } catch (error) {
      console.error('Error updating question selection:', error);
    }
  };

  const handleEditQuestionChange = (field: keyof MCQ, value: any) => {
    if (editedQuestion) {
      setEditedQuestion({
        ...editedQuestion,
        [field]: value
      });
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold mb-6">Generated Questions</h2>
      {questions.map((question, index) => (
        <QuestionCard
          key={question.id}
          question={question}
          index={index}
          isEditing={editingId === question.id}
          editedQuestion={editedQuestion}
          onEdit={handleEdit}
          onCancelEdit={handleCancelEdit}
          onSaveEdit={handleSaveEdit}
          onDelete={handleDelete}
          onSelect={handleSelect}
          onEditQuestionChange={handleEditQuestionChange}
        />
      ))}
    </div>
  );
};