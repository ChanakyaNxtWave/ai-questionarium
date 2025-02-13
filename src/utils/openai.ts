
import { supabase } from "@/integrations/supabase/client";
import { MCQ } from "@/types/mcq";
import { OpenAIResponse } from "@/types/openai";
import { parseOpenAIResponse } from "./questionParser";
import { storeQuestion } from "./questionStorage";

export const generateQuestions = async (content: string, unitId: string): Promise<MCQ[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-questions', {
      body: { content, unitId },
    });

    if (error) {
      console.error('[generateQuestions] Error from Supabase function:', error);
      throw error;
    }

    const rawQuestions = data.questions;
    const parsedQuestions = await parseOpenAIResponse(rawQuestions, unitId);
    return parsedQuestions;
  } catch (error) {
    console.error('[generateQuestions] Error:', error);
    throw error;
  }
};

export const generateVariants = async (baseQuestion: MCQ): Promise<MCQ[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-variants', {
      body: { baseQuestion },
    });

    if (error) {
      console.error('[generateVariants] Error from Supabase function:', error);
      throw error;
    }

    const variants = data.variants.map((variant: any) => ({
      ...variant,
      id: crypto.randomUUID(),
      unitId: baseQuestion.unitId,
      category: 'VARIANT',
      isSelected: false
    }));

    return variants;
  } catch (error) {
    console.error('[generateVariants] Error:', error);
    throw error;
  }
};

export { storeQuestion };
