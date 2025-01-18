import { supabase } from "@/integrations/supabase/client";

interface GenerateResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export const generateTopics = async (content: string): Promise<GenerateResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-content', {
      body: { content, type: 'topics' }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error generating topics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate topics"
    };
  }
};

export const generateQuestions = async (content: string, topics: string): Promise<GenerateResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-content', {
      body: { 
        content: `${content}\n\nGenerate questions based on these topics:\n${topics}`, 
        type: 'questions' 
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error generating questions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate questions"
    };
  }
};