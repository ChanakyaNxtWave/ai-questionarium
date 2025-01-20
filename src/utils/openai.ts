import { supabase } from "@/integrations/supabase/client";

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
  try {
    const { data, error } = await supabase.functions.invoke('generate-questions', {
      body: { content },
    });

    if (error) throw error;

    const rawQuestions = data.questions;
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