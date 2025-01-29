import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { QuestionCard } from "./QuestionCard";
import { MCQ } from "@/types/mcq";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { generateVariants } from "@/utils/openai";

interface MCQDisplayProps {
  questions: MCQ[];
}

export const MCQDisplay = ({ questions: initialQuestions }: MCQDisplayProps) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<MCQ[]>(
    initialQuestions.map(q => ({
      ...q,
      id: q.id || uuidv4()
    }))
  );
  const [selectedQuestionKeys, setSelectedQuestionKeys] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<MCQ | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setQuestions(initialQuestions.map(q => ({
      ...q,
      id: q.id || uuidv4()
    })));
  }, [initialQuestions]);

  const handleGenerateVariants = async () => {
    if (selectedQuestionKeys.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one question to generate variants",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const selectedQuestions = questions.filter(q => selectedQuestionKeys.includes(q.questionKey));
      console.log("Frontend: Selected questions for variants:", selectedQuestions);
      
      // Generate variants for all selected questions
      const allVariants = [];
      for (const baseQuestion of selectedQuestions) {
        console.log("Frontend: Processing base question:", baseQuestion);
        const variants = await generateVariants(baseQuestion);
        console.log("Frontend: Generated variants for question:", variants);
        allVariants.push(...variants);
      }

      console.log("Frontend: All generated variants:", allVariants);
      
      navigate(`/generate/sql/${selectedQuestions[0].unitTitle}`);
    } catch (error) {
      console.error('Frontend: Error generating variants:', error);
      toast({
        title: "Error",
        description: "Failed to generate variants. Please try again.",
        variant: "destructive",
      });
    }
  };

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
      setSelectedQuestionKeys(prev => prev.filter(key => key !== question.questionKey));
      
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
      const isCurrentlySelected = selectedQuestionKeys.includes(question.questionKey);
      
      if (isCurrentlySelected) {
        setSelectedQuestionKeys(prev => prev.filter(key => key !== question.questionKey));
      } else {
        setSelectedQuestionKeys(prev => [...prev, question.questionKey]);
      }

      toast({
        title: "Success",
        description: `Question ${isCurrentlySelected ? 'unselected' : 'selected'} successfully`,
      });

      const { error: updateError } = await supabase
        .from('generated_questions')
        .update({
          is_selected: !isCurrentlySelected
        })
        .eq('question_key', question.questionKey);

      if (updateError) {
        console.error('Supabase update error:', updateError);
        if (isCurrentlySelected) {
          setSelectedQuestionKeys(prev => [...prev, question.questionKey]);
        } else {
          setSelectedQuestionKeys(prev => prev.filter(key => key !== question.questionKey));
        }
        toast({
          title: "Error",
          description: "Failed to update question selection",
          variant: "destructive",
        });
        throw updateError;
      }
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
          isSelected={selectedQuestionKeys.includes(question.questionKey)}
        />
      ))}
      
      <div className="mt-8 flex justify-center">
        <Button 
          onClick={handleGenerateVariants}
          className="w-full md:w-auto"
          disabled={selectedQuestionKeys.length === 0}
        >
          Generate Classroom Variants
        </Button>
      </div>
    </div>
  );
};