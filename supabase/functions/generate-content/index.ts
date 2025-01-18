import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    const endpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT');
    const deployment = Deno.env.get('AZURE_OPENAI_DEPLOYMENT');

    console.log('Checking Azure OpenAI configuration...');
    console.log('Endpoint:', endpoint ? 'Set' : 'Missing');
    console.log('Deployment:', deployment ? 'Set' : 'Missing');
    console.log('API Key:', apiKey ? 'Set' : 'Missing');

    if (!apiKey || !endpoint || !deployment) {
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

    const apiVersion = '2023-05-15';
    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    console.log('Making request to Azure OpenAI:', url);
    console.log('System prompt:', systemPrompt);
    console.log('User content length:', content.length);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Azure OpenAI API error:', error);
      throw new Error(
        `Azure OpenAI API error (${response.status}): ${error.error?.message || error.message || 'Unknown error'}`
      );
    }

    const data = await response.json();
    console.log('Azure OpenAI API response status:', response.status);
    console.log('Azure OpenAI API response:', data);

    const generatedContent = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ success: true, data: generatedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});