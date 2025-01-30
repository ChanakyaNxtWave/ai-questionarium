import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { baseQuestion } = await req.json();
    console.log('[generate-variants] Received base question:', baseQuestion);
    
    if (!baseQuestion) {
      console.error('[generate-variants] Base question is missing');
      throw new Error('Base question is required');
    }

    const azureEndpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT')?.replace(/\/$/, '');
    const apiKey = Deno.env.get('AZURE_OPENAI_API_KEY');
    const deployment = Deno.env.get('AZURE_OPENAI_DEPLOYMENT');

    if (!azureEndpoint || !apiKey || !deployment) {
      console.error('[generate-variants] Missing Azure OpenAI configuration:', {
        hasEndpoint: !!azureEndpoint,
        hasApiKey: !!apiKey,
        hasDeployment: !!deployment
      });
      throw new Error('Azure OpenAI configuration incomplete');
    }

    console.log('[generate-variants] Generating variants for question:', baseQuestion.questionKey);

    const prompt = `Generate 3 variant questions for the following base question. Follow this format strictly for each variant:

TOPIC: [topic]
CONCEPT: [concept]
QUESTION_KEY: [base_question_key]_v[number]
QUESTION_TEXT: [question text]
LEARNING_OUTCOME: [learning outcome]
CONTENT_TYPE: [content type]
QUESTION_TYPE: [question type]
CODE: [code if any, or NA]
CODE_LANGUAGE: [language if any, or NA]
OPTION_1: [option 1]
OPTION_2: [option 2]
OPTION_3: [option 3]
OPTION_4: [option 4]
CORRECT_OPTION: [correct option number]
EXPLANATION: [explanation]
BLOOM_LEVEL: [bloom level]

Base question:
${JSON.stringify(baseQuestion, null, 2)}

Important:
1. Maintain similar difficulty level
2. Test the same concept in different ways
3. Add -END- after each variant
4. Keep the learning outcome consistent
5. Ensure QUESTION_KEY follows pattern: original_key_v1, original_key_v2, etc.`;

    console.log('[generate-variants] Making request to Azure OpenAI');
    
    const response = await fetch(
      `${azureEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=2023-05-15`,
      {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a technical instructional designer specialized in creating SQL MCQs.',
            },
            {
              role: 'user',
              content: prompt
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generate-variants] Azure OpenAI API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Azure OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('[generate-variants] Azure OpenAI API response:', data);

    if (!data.choices?.[0]?.message?.content) {
      console.error('[generate-variants] Invalid response from Azure OpenAI:', data);
      throw new Error('Invalid response from Azure OpenAI');
    }

    const rawResponse = data.choices[0].message.content;
    console.log('[generate-variants] Successfully generated variants for question:', baseQuestion.questionKey);

    return new Response(
      JSON.stringify({ rawResponse }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('[generate-variants] Error:', error.message, '\nStack:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});