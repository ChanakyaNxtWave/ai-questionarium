import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MCQDisplay } from "@/components/MCQDisplay";
import { MCQ } from "@/types/mcq";
import { useToast } from "@/hooks/use-toast";

export const VariantsDisplay = () => {
  const { unitTitle } = useParams();
  const [variants, setVariants] = useState<MCQ[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const { data, error } = await supabase
          .from('generated_questions')
          .select('*')
          .eq('unit_title', unitTitle)
          .eq('question_category', 'VARIANT');

        if (error) throw error;

        // Map the Supabase response to match MCQ interface
        const mappedVariants: MCQ[] = (data || []).map(item => ({
          id: item.id,
          topic: item.topic,
          concept: item.concept,
          questionKey: item.question_key,
          questionText: item.question_text,
          learningOutcome: item.learning_outcome,
          contentType: item.content_type,
          questionType: item.question_type,
          code: item.code || '',
          codeLanguage: item.code_language || '',
          options: item.options,
          correctOption: item.correct_option,
          explanation: item.explanation,
          bloomLevel: item.bloom_level,
          unitTitle: item.unit_title,
          isSelected: item.is_selected || false
        }));

        setVariants(mappedVariants);
      } catch (error) {
        console.error('Error fetching variants:', error);
        toast({
          title: "Error",
          description: "Failed to fetch variants",
          variant: "destructive",
        });
      }
    };

    fetchVariants();
  }, [unitTitle, toast]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Question Variants - {unitTitle}
      </h1>
      <MCQDisplay questions={variants} />
    </div>
  );
};