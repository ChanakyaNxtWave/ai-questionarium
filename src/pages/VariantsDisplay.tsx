
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
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select(`
            *,
            units(name),
            options(*),
            fill_in_blank_answers(*),
            rearrangement_steps(*),
            code_analysis_expected_output(*),
            external_resources(*)
          `)
          .eq('units.name', unitTitle);

        if (questionsError) throw questionsError;

        // Map the database response to MCQ interface
        const mappedVariants: MCQ[] = (questionsData || []).map(item => ({
          id: item.id,
          unitId: item.unit_id,
          questionType: item.question_type,
          questionKey: item.question_key,
          baseQuestionKeys: item.base_question_keys,
          questionText: item.question_text,
          contentType: item.content_type,
          code: item.code,
          codeLanguage: item.code_language,
          learningOutcome: item.learning_outcome,
          explanation: item.explanation,
          bloomLevel: item.bloom_level,
          options: item.options?.map((opt: any) => ({
            id: opt.id,
            text: opt.option_text,
            order: opt.option_order,
            isCorrect: opt.is_correct
          })) || [],
          fibAnswers: item.fill_in_blank_answers?.map((fib: any) => ({
            position: fib.blank_position,
            correctAnswer: fib.correct_answer,
            expectedOutput: fib.expected_output
          })),
          rearrangeSteps: item.rearrangement_steps?.map((step: any) => ({
            text: step.step_text,
            displayOrder: step.display_order,
            correctOrder: step.correct_order
          })),
          codeAnalysis: item.code_analysis_expected_output?.map((analysis: any) => ({
            inputCase: analysis.input_case,
            expectedOutput: analysis.expected_output
          })),
          externalResources: item.external_resources?.[0] ? {
            dbUrl: item.external_resources[0].db_url,
            testUrl: item.external_resources[0].test_url,
            tablesUsed: item.external_resources[0].tables_used
          } : undefined,
          unitTitle: item.units?.name,
          isSelected: false
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
