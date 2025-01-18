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
    let userPrompt = '';
    
    if (type === 'topics') {
      systemPrompt = `You are a technical instructional designer.`;
      userPrompt = `I want you to act as a technical instructional designer.

    Your task is to generate a list of technical topics and their respective subtopics for a given session. Please ensure the following:

    1. Format the response in bullet points.
    2. Each main topic should be followed by its related subtopics.
    3. Subtopics should be grouped under the relevant main topic.
    4. Exclude non-technical content such as session summaries, reading materials, recap, key takeaways, or interview questions as topics or sub topics.
    5. Focus solely on technical aspects relevant to the session.
    6. Group similar topics and sub-topics together.
    7. The technical terminology of grouped topics and sub topics names should be from the session. Example, if 'Separation of concerns' is not in session, then topics and sub topics names shouldn't contain 'Separation of concerns'.

    Present the information as follows:

    * <Topic 1>
        * <Subtopic 1.1>
        * <Subtopic 1.2>
    * Topic 2
        * <Subtopic 2.1>
        * <Subtopic 2.2>

    End the list with '--END--' to indicate completion.

    **Session**: ${content}

    You have another task to create possible learning outcomes based on the given session summary and reading material.

    These learning outcomes will be tagged to coding practices and multiple choice questions to understand the effectiveness of the session through data gathered from the users.

    Given the learning outcomes as a list of strings:
    All the strings should be in snake case`;
    } else if (type === 'questions') {
      systemPrompt = `You are a technical instructional Designer tasked with developing multiple-choice questions.`;
      userPrompt = `**Objective:** You are a technical instructional Designer tasked with developing a set of multiple-choice questions covering all the learning outcomes listed based on the session summary and reading material.

**Input:**
${content}

**Guidelines:**

- **Question Guidelines:**
  1. Each question should present a single problem and should be clearly understandable.
  2. Use positive expressions in the question.
  3. Avoid tricky or misleading questions.
  4. Ensure grammatical and syntactical agreement in both the question and the options.
  5. The question and options should be strictly based on the session transcript summary and reading material content provided earlier.
  6. Include a code snippet in the question if it is code-related.
  7. Each question should be standalone and technically correct.
  8. The MCQs, options, and explanations should be universally technically correct and should not include terms related to "as per the interview," "according to the session," or "based on reading material."
  9. Ensure correct formatting in code-related questions by avoiding enclosing code in backticks and using plain text for quotes.

- **Options Guidelines:**
  1. Limit the options to four per question.
  2. Have only one correct and best answer among the options.
  3. Avoid absolutes like 'always', 'never', etc., in the options.
  4. Ensure all options are of similar length.
  5. Avoid terms in the options that are too closely related to the question or that give away the answer.
  6. Phrase all options similarly for consistency.

- **Wrong Options Guidelines:**
  1. Design wrong options to be believable, appealing, and plausible.
  2. Ensure wrong options are closely related to the content, requiring clear understanding for correct answer selection.
  3. The wrong options should represent actual incorrect results.

- **Correct Option Guidelines:**
  1. Randomize the placement of the correct option among the questions to avoid predictable patterns.
  2. The correct option for a question should be the most technically accurate answer.

- **Explanation Guidelines:**
  1. Give a strong reasoning for why the option is correct, focusing on the key information that is only mentioned in the provided content.
  2. Briefly indicate why other options are incorrect, highlighting the distinctions from the correct answer.
  3. Explanation shouldn't contain the terms "options", "option 2", etc.
  4. The technical terminology should be from the session.`;
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
            { role: 'user', content: userPrompt }
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