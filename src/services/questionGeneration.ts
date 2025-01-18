import { supabase } from "@/integrations/supabase/client";

export const generateContent = async (content: string, type: "topics" | "questions", language?: string) => {
  try {
    // First, try to get a language-specific prompt
    let promptQuery = supabase
      .from("prompts")
      .select("*")
      .eq("type", type);

    if (language) {
      promptQuery = promptQuery.eq("language_id", language);
    } else {
      promptQuery = promptQuery.is("language_id", null);
    }

    const { data: prompts, error: promptError } = await promptQuery;
    
    if (promptError) throw promptError;

    // If no language-specific prompt found, get the default prompt
    if (prompts.length === 0) {
      const { data: defaultPrompts, error: defaultError } = await supabase
        .from("prompts")
        .select("*")
        .eq("type", type)
        .eq("is_default", true)
        .limit(1);

      if (defaultError) throw defaultError;
      if (defaultPrompts.length === 0) {
        throw new Error(`No ${type} prompt found`);
      }

      prompts[0] = defaultPrompts[0];
    }

    const response = await fetch("/functions/v1/generate-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        type,
        prompt: prompts[0].content,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to generate content");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw new Error(error.message || "Failed to generate content");
  }
};

export const generateTopics = async (content: string) => {
  return generateContent(content, "topics");
};

export const generateQuestions = async (content: string, topics: string) => {
  return generateContent(content, "questions");
};