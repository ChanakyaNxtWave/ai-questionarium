import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function QuestionGeneration() {
  const { language, unitTitle } = useParams();
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateQuestions = async () => {
    try {
      setIsGenerating(true);
      
      // Call the Edge Function to generate questions
      const { data: response, error: functionError } = await supabase.functions.invoke('generate-questions', {
        body: { content: decodeURIComponent(unitTitle || '') },
      });

      if (functionError) throw functionError;

      const questions = response.questions;
      console.log('Generated questions:', questions);

      // Parse the questions from the response
      const questionBlocks = questions.split('-END-').filter((block: string) => block.trim());
      
      for (const block of questionBlocks) {
        const question: any = {};
        const lines = block.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          const [key, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim();
          
          switch (key.trim()) {
            case 'TOPIC':
              question.topic = value;
              break;
            case 'CONCEPT':
              question.concept = value;
              break;
            case 'QUESTION_KEY':
              question.question_key = value;
              break;
            case 'QUESTION_TEXT':
              question.question_text = value;
              break;
            case 'LEARNING_OUTCOME':
              question.learning_outcome = value;
              break;
            case 'CONTENT_TYPE':
              question.content_type = value;
              break;
            case 'QUESTION_TYPE':
              question.question_type = value;
              break;
            case 'CODE':
              question.code = value === 'NA' ? null : value;
              break;
            case 'CODE_LANGUAGE':
              question.code_language = value === 'NA' ? null : value;
              break;
            case 'CORRECT_OPTION':
              question.correct_option = value;
              break;
            case 'EXPLANATION':
              question.explanation = value;
              break;
            case 'BLOOM_LEVEL':
              question.bloom_level = value;
              break;
            default:
              if (key.trim().startsWith('OPTION_') && !key.trim().includes('_ID')) {
                if (!question.options) {
                  question.options = [];
                }
                const optionNumber = parseInt(key.trim().replace('OPTION_', '')) - 1;
                question.options[optionNumber] = value;
              }
              break;
          }
        }

        // Only insert if we have all required fields
        if (
          question.topic &&
          question.concept &&
          question.question_key &&
          question.question_text &&
          question.options?.length > 0
        ) {
          const { error: insertError } = await supabase
            .from('generated_questions')
            .insert([question]);

          if (insertError) {
            console.error('Error inserting question:', insertError);
            toast({
              title: "Error",
              description: "Failed to save question to database",
              variant: "destructive",
            });
          }
        }
      }

      toast({
        title: "Success",
        description: "Questions generated and saved successfully",
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate questions",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Generate Questions - {decodeURIComponent(unitTitle || '')}
      </h1>
      
      <Button 
        onClick={handleGenerateQuestions}
        disabled={isGenerating}
      >
        {isGenerating ? "Generating..." : "Generate Questions"}
      </Button>
    </div>
  );
}