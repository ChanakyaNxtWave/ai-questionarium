import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

interface RequestBody {
  content: string;
  unitTitle: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { content, unitTitle } = await req.json() as RequestBody;
    console.log('Received content:', content);
    console.log('Received unitTitle:', unitTitle);

    const prompt = `I want you to act as a technical instructional designer with 10 years of experience in technical curriculum design and development.

You have two tasks

### Task - 1:

${content}

Your task is to generate a list of learning outcomes based on the given content.

These learning outcomes will be tagged to the questions to understand the effectiveness of the content through data gathered from the users.

**Note**: The length of the Learning Outcome should be less than 40 characters

### Task - 2:

**Objective:** Develop a set of multiple-choice questions covering all the learning outcomes listed based on the provided Content.

**Input:**
{LEARNING_OUTCOMES generated in Task: 1 and content provided in the previous chat}

**Guidelines:**

- **Question Guidelines:**
  1. Each question should present a single problem and should be clearly understandable.
  2. Use positive expressions in the question.
  3. Avoid tricky or misleading questions.
  4. Ensure grammatical and syntactical agreement in both the question and the options.
  5. The question and options should be strictly based on the content provided earlier.
  6. Include a code snippet in the question if it is code-related.
  7. Each question should be standalone and technically correct.
  8. The MCQs, options, and explanations should be universally technically correct and should not include terms related to "as per the interview," "according to the session," or "based on the provided content."
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
  4. The technical terminology should be from the session.

**Output Format:**

TOPIC:<topic from the provided list>
CONCEPT:<concept related to the topic provided in the list>
QUESTION_KEY:<5 Alpha Numeric characters>
BASE_QUESTION_KEYS: NA
QUESTION_TEXT:<The content of the question and shouldn't contain code. The content should be in plain text until and unless it requires markdown syntax>
LEARNING_OUTCOME: <Pick any of the most suitable learning outcomes from the listed learning outcomes. Ensure learning outcomes should be in snake case>
CONTENT_TYPE:HTML/MARKDOWN
QUESTION_TYPE:MULTIPLE_CHOICE(If the code is not "NA")/CODE_ANALYSIS_MULTIPLE_CHOICE
CODE:<NA/Code of the question text. Don't give away the answer or correct option in CODE. The code should be formatted and shouldn't be enclosed in backticks.>
CODE_LANGUAGE:NA/HTML/CSS/SQL/PYTHON/SHELL/JSON
OPTION_1:<Option Text without enclosing in quotes unless required/Code in Backticks, if required>
OPTION_2:<Option Text without enclosing in quotes unless required/Code in Backticks, if required>
OPTION_3:<Option Text without enclosing in quotes unless required/Code in Backticks, if required>
OPTION_4:<Option Text without enclosing in quotes unless required/Code in Backticks, if required>
CORRECT_OPTION: <OPTION_1/OPTION_2/OPTION_3/OPTION_4>
EXPLANATION: <explanation. Use Text. Don't use Markdown until and unless the explanation requires markdown syntax>
BLOOM_LEVEL:
-END-

**Important Note**:
* Each generated Question must end with '-END-', as this will be used as a delimiter to separate the questions.
* Each question will be associated with the Unit Title: "${unitTitle}"

`;

    const azureEndpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT')?.replace(/\/$/, ''); // Remove trailing slash if present
    const apiKey = Deno.env.get('AZURE_OPENAI_API_KEY');
    const deployment = Deno.env.get('AZURE_OPENAI_DEPLOYMENT');

    if (!azureEndpoint || !apiKey || !deployment) {
      console.error('Missing Azure OpenAI credentials or deployment name');
      throw new Error('Azure OpenAI configuration incomplete');
    }

    console.log('Making request to Azure OpenAI API...');
    console.log('Using deployment:', deployment);
    
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
      console.error('Azure OpenAI API error:', errorText);
      throw new Error(`Azure OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Received response from Azure OpenAI');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid response format from Azure OpenAI:', data);
      throw new Error('Invalid response format from Azure OpenAI');
    }

    const rawQuestions = data.choices[0].message.content;
    console.log('Generated questions:', rawQuestions);
    
    return new Response(
      JSON.stringify({ questions: rawQuestions }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in generate-questions function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while generating questions',
        details: error.toString()
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