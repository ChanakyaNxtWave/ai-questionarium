import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const azureEndpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT');
const azureDeployment = Deno.env.get('AZURE_OPENAI_DEPLOYMENT');
const apiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, type } = await req.json();

    if (!azureEndpoint || !azureDeployment || !apiKey) {
      console.error('Missing Azure OpenAI configuration:', {
        hasEndpoint: !!azureEndpoint,
        hasDeployment: !!azureDeployment,
        hasApiKey: !!apiKey
      });
      throw new Error('Azure OpenAI configuration is incomplete');
    }

    let systemPrompt = '';
    if (type === 'topics') {
      systemPrompt = `You are an expert curriculum designer. Analyze the following content and extract key topics, subtopics, and learning outcomes. Format your response as a structured list with bullet points. Focus on the most important concepts that students should understand.`;
    } else if (type === 'questions') {
      systemPrompt = `You are an expert question designer. Create multiple-choice questions based on the following content. For each question, include:
      - The topic and concept being tested
      - Prerequisites
      - Question text
      - 4 options (with one correct answer)
      - Explanation of the correct answer
      - Bloom's taxonomy level
      Format as JSON with these fields: topic, concept, prerequisites, questionText, options (array), correctAnswer, explanation, bloomLevel`;
    }

    console.log('Making request to Azure OpenAI with:', {
      endpoint: azureEndpoint,
      deployment: azureDeployment,
      type: type
    });

    const apiVersion = '2023-05-15';
    const response = await fetch(
      `${azureEndpoint}/openai/deployments/${azureDeployment}/chat/completions?api-version=${apiVersion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Azure OpenAI API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to generate content');
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('Successfully generated content for type:', type);

    return new Response(
      JSON.stringify({ success: true, data: generatedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});