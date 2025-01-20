import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  content: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content } = await req.json() as RequestBody;

    const prompt = `I want you to act as a technical instructional designer with 10 years of experience in technical curriculum design and development.

Given the following content:

${content}

Generate 5 multiple choice questions (MCQs) that test understanding of the content. For each question:

1. Identify the specific topic and concept being tested
2. Create a clear question with 4 options
3. Provide the correct answer and a detailed explanation
4. Assign an appropriate Bloom's taxonomy level

Format each question as follows:

TOPIC: [Topic name]
CONCEPT: [Specific concept]
QUESTION_KEY: [Unique identifier]
QUESTION_TEXT: [The actual question]
LEARNING_OUTCOME: [What the question tests]
CONTENT_TYPE: [text/code]
QUESTION_TYPE: [conceptual/analytical/application]
CODE: [Any code snippet, or NA if none]
CODE_LANGUAGE: [Programming language of code, or NA]
OPTION_1: [First option]
OPTION_2: [Second option]
OPTION_3: [Third option]
OPTION_4: [Fourth option]
CORRECT_OPTION: [The correct option text]
EXPLANATION: [Detailed explanation of the correct answer]
BLOOM_LEVEL: [Bloom's taxonomy level]
-END-`;

    const azureEndpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT');
    const apiKey = Deno.env.get('AZURE_OPENAI_API_KEY');

    if (!azureEndpoint || !apiKey) {
      throw new Error('Azure OpenAI credentials not configured');
    }

    const response = await fetch(
      `${azureEndpoint}/openai/deployments/gpt-4/chat/completions?api-version=2023-05-15`,
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
      throw new Error('Failed to generate questions');
    }

    const data = await response.json();
    const rawQuestions = data.choices[0].message.content;
    
    return new Response(
      JSON.stringify({ questions: rawQuestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})