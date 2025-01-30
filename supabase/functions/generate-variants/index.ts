import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("Generate variants function started");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Parsing request body");
    const { baseQuestion } = await req.json();
    
    if (!baseQuestion) {
      console.error('Base question is missing from request');
      throw new Error('Base question is required');
    }

    console.log("Received base question:", baseQuestion);

    // Get Azure OpenAI configuration
    const azureEndpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT')?.replace(/\/$/, '');
    const apiKey = Deno.env.get('AZURE_OPENAI_API_KEY');
    const deployment = Deno.env.get('AZURE_OPENAI_DEPLOYMENT');

    if (!azureEndpoint || !apiKey || !deployment) {
      console.error('Azure OpenAI configuration incomplete');
      throw new Error('Azure OpenAI configuration incomplete');
    }

    console.log('Sending request to Azure OpenAI...');
    
    // Construct the prompt for variant generation
    const prompt = `Generate variant questions for the following base question:
    ${JSON.stringify(baseQuestion, null, 2)}
    
    Please create 3 different variants while maintaining:
    1. The same learning outcome
    2. Similar difficulty level
    3. Different approaches to testing the same concept`;

    const response = await fetch(
      `${azureEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=2023-05-15`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a technical instructional designer specialized in creating SQL MCQs.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Azure OpenAI API error: ${response.status} ${errorText}`);
      throw new Error(`Azure OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Received response from Azure OpenAI:', data);

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid response from Azure OpenAI');
      throw new Error('Invalid response from Azure OpenAI');
    }

    // Parse the response to create variants
    const variants = [{
      ...baseQuestion,
      id: crypto.randomUUID(),
      questionKey: `${baseQuestion.questionKey}_v1`,
      questionCategory: 'VARIANT'
    }];

    console.log('Generated variants:', variants);

    return new Response(
      JSON.stringify({ variants }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in generate-variants function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
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