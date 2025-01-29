import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { baseQuestion } = await req.json();
    console.log("Edge Function: Received base question:", JSON.stringify(baseQuestion, null, 2));
    
    if (!baseQuestion) {
      throw new Error('Base question is required');
    }

    const prompt = `
**Objective**: As a technical instructional designer with over 10 years of experience, your task is to generate variant questions from a given base question.
  - Each base question includes Question text, Options, Correct Option, and Explanation text. Also optionally there can be an SQL query and database table or schema.
  - For these questions students require to analyze the question text, query and table/schema to answer the question correctly.
  - These questions assess the students' ability to understand and interpret query and table. Create variants by asking the same question in different ways.

## Input

### Base Question

${JSON.stringify(baseQuestion, null, 2)}

## Steps for Variant Creation:

1. **Identify the Concept**: Determine the precise concept being assessed in the base question by closely examining the question text and the correct answer.
2. **Pick Specific Variant Types**: Choose different types of question variants that meaningfully test the same concept.
3. **Independent Questions**: Each variant should be self-contained with all information needed to answer correctly.
4. **Different Examples**: Use different examples while maintaining the base concept and learning outcome.
5. **Concept-Focused**: Create variants strictly aligned with the base question's specific concept.
6. **Cognitive Level**: Match the base question's Bloom's taxonomy level.
7. **Follow Guidelines**: Adhere to all guidelines for questions, options, and explanations.

Please generate 3 variants in the following format for each:

TOPIC:<topic>
CONCEPT:<concept>
QUESTION_KEY:<question_key>_v<number>
BASE_QUESTION_KEYS:<original_question_key>
QUESTION_TEXT:<question_text>
CONTENT_TYPE:MARKDOWN
QUESTION_TYPE:MULTIPLE_CHOICE
LEARNING_OUTCOME:<learning_outcome>
CODE:<code>
CODE_LANGUAGE:<code_language>
OPTION_1:<option_1>
OPTION_2:<option_2>
OPTION_3:<option_3>
OPTION_4:<option_4>
CORRECT_OPTION:<correct_option>
EXPLANATION:<explanation>
BLOOM_LEVEL:<bloom_level>
-END-`;

    console.log("Edge Function: Sending prompt to OpenAI:", prompt);

    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert technical instructor who creates SQL practice questions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.text();
      console.error("Edge Function: OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const openAIData = await openAIResponse.json();
    console.log("Edge Function: Raw OpenAI response:", JSON.stringify(openAIData, null, 2));

    const generatedQuestions = openAIData.choices[0].message.content;
    console.log("Edge Function: Generated questions content:", generatedQuestions);

    return new Response(
      JSON.stringify({ questions: generatedQuestions }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json"
        } 
      }
    );

  } catch (error) {
    console.error("Edge Function: Error generating variants:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});