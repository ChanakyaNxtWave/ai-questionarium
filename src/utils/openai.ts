interface OpenAIResponse {
  topic: string;
  concept: string;
  questionKey: string;
  questionText: string;
  learningOutcome: string;
  contentType: string;
  questionType: string;
  code: string;
  codeLanguage: string;
  options: string[];
  correctOption: string;
  explanation: string;
  bloomLevel: string;
}

export const generateQuestions = async (content: string): Promise<OpenAIResponse[]> => {
  const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
  const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;

  if (!endpoint || !apiKey) {
    throw new Error('Azure OpenAI credentials not found');
  }

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

  try {
    const response = await fetch(`${endpoint}/openai/deployments/gpt-4/chat/completions?api-version=2023-05-15`, {
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
    });

    if (!response.ok) {
      throw new Error('Failed to generate questions');
    }

    const data = await response.json();
    const rawQuestions = data.choices[0].message.content;
    
    // Parse the response into structured questions
    const questions = parseOpenAIResponse(rawQuestions);
    return questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
};

const parseOpenAIResponse = (response: string): OpenAIResponse[] => {
  const questions: OpenAIResponse[] = [];
  const questionBlocks = response.split('-END-').filter(block => block.trim());

  for (const block of questionBlocks) {
    try {
      const lines = block.trim().split('\n');
      const question: any = {};

      for (const line of lines) {
        if (line.includes(':')) {
          const [key, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim();

          switch (key.trim()) {
            case 'TOPIC':
              question.topic = value;
              break;
            case 'CONCEPT':
              question.concept = value;
              break;
            case 'QUESTION_KEY':
              question.questionKey = value;
              break;
            case 'QUESTION_TEXT':
              question.questionText = value;
              break;
            case 'LEARNING_OUTCOME':
              question.learningOutcome = value;
              break;
            case 'CONTENT_TYPE':
              question.contentType = value;
              break;
            case 'QUESTION_TYPE':
              question.questionType = value;
              break;
            case 'CODE':
              question.code = value === 'NA' ? 'NA' : value;
              break;
            case 'CODE_LANGUAGE':
              question.codeLanguage = value;
              break;
            case 'OPTION_1':
            case 'OPTION_2':
            case 'OPTION_3':
            case 'OPTION_4':
              if (!question.options) question.options = [];
              question.options.push(value);
              break;
            case 'CORRECT_OPTION':
              question.correctOption = value;
              break;
            case 'EXPLANATION':
              question.explanation = value;
              break;
            case 'BLOOM_LEVEL':
              question.bloomLevel = value;
              break;
          }
        }
      }

      if (Object.keys(question).length > 0) {
        questions.push(question as OpenAIResponse);
      }
    } catch (error) {
      console.error('Error parsing question block:', error);
    }
  }

  return questions;
};