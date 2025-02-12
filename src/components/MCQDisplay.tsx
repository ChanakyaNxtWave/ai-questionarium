
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
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setQuestions(initialQuestions.map(q => ({
      ...q,
      id: q.id || uuidv4()
    })));
  }, [initialQuestions]);

  const handleGenerateVariants = async () => {
    console.log("Starting handleGenerateVariants");
    console.log("Selected question keys:", selectedQuestionKeys);
    
    if (selectedQuestionKeys.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one question to generate variants",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const selectedQuestions = questions.filter(q => selectedQuestionKeys.includes(q.questionKey));
      console.log("Selected questions for variants:", selectedQuestions);
      
      // Generate variants for each selected question individually
      for (const baseQuestion of selectedQuestions) {
        try {
          const variants = await generateVariants(baseQuestion);
          console.log("Generated variants:", variants);
        } catch (error) {
          console.error('Error generating variants for question:', baseQuestion, error);
          toast({
            title: "Error",
            description: `Failed to generate variants for a question: ${error.message}`,
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Success",
        description: "Variants generated and stored successfully",
      });
      
      navigate(`/variants/${selectedQuestions[0].unitTitle}`);
    } catch (error) {
      console.error('Error in handleGenerateVariants:', error);
      toast({
        title: "Error",
        description: "Failed to generate variants. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
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
        .from('questions')
        .update({
          question_text: editedQuestion.questionText,
          explanation: editedQuestion.explanation,
        })
        .eq('id', question.id);

      if (updateError) throw updateError;

      // Update options
      if (editedQuestion.options) {
        for (const option of editedQuestion.options) {
          const { error: optionError } = await supabase
            .from('options')
            .upsert({
              question_id: question.id,
              option_text: option.text,
              option_order: option.order,
              is_correct: option.isCorrect,
            });

          if (optionError) throw optionError;
        }
      }

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
        .from('questions')
        .delete()
        .eq('id', question.id);

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

      setQuestions(questions.map(q => 
        q.questionKey === question.questionKey 
          ? { ...q, isSelected: !isCurrentlySelected }
          : q
      ));

      toast({
        title: "Success",
        description: `Question ${isCurrentlySelected ? 'unselected' : 'selected'} successfully`,
      });
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
          disabled={selectedQuestionKeys.length === 0 || isGenerating}
        >
          {isGenerating ? "Generating Variants..." : "Generate Classroom Variants"}
        </Button>
      </div>
    </div>
  );
};
