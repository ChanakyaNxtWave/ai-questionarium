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
  const pattern = /(TOPIC|CONCEPT|NEW_CONCEPTS|QUESTION_ID|QUESTION_KEY|BASE_QUESTION_KEYS|QUESTION_TEXT|QUESTION_TYPE|LEARNING_OUTCOME|CODE|CONTENT_TYPE|CODE_LANGUAGE|CORRECT_OPTION|BLOOM_LEVEL|EXPLANATION|TAG_NAMES|OPTION_\d+|OPTION_\d+_ID|INPUT|OUTPUT|INPUT_\d+|INPUT_\d+_ID|OUTPUT_\d+|OPT\d+_ID|OPT_\d+_DSPLY_ORDER|OPT_\d+_CRT_ORDER):([\s\S]*?)(?=(TOPIC|CONCEPT|NEW_CONCEPTS|QUESTION_ID|QUESTION_KEY|BASE_QUESTION_KEYS|QUESTION_TEXT|QUESTION_TYPE|LEARNING_OUTCOME|CODE|CONTENT_TYPE|CODE_LANGUAGE|CORRECT_OPTION|BLOOM_LEVEL|EXPLANATION|TAG_NAMES|OPTION_\d+|OPTION_\d+_ID|INPUT|OUTPUT|INPUT_\d+|INPUT_\d+_ID|OUTPUT_\d+|OPT\d+_ID|OPT_\d+_DSPLY_ORDER|OPT_\d+_CRT_ORDER):|$)/g;
  
  const questionBlocks = response.split('-END-').filter(block => block.trim());

  for (const block of questionBlocks) {
    try {
      const matches = [...block.matchAll(pattern)];
      const question: any = {
        options: []
      };

      for (const match of matches) {
        const [_, key, value] = match;
        const trimmedValue = value.trim();

        switch (key) {
          case 'TOPIC':
            question.topic = trimmedValue;
            break;
          case 'CONCEPT':
            question.concept = trimmedValue;
            break;
          case 'QUESTION_KEY':
            question.questionKey = trimmedValue;
            break;
          case 'QUESTION_TEXT':
            question.questionText = trimmedValue;
            break;
          case 'LEARNING_OUTCOME':
            question.learningOutcome = trimmedValue;
            break;
          case 'CONTENT_TYPE':
            question.contentType = trimmedValue;
            break;
          case 'QUESTION_TYPE':
            question.questionType = trimmedValue;
            break;
          case 'CODE':
            question.code = trimmedValue === 'NA' ? 'NA' : trimmedValue;
            break;
          case 'CODE_LANGUAGE':
            question.codeLanguage = trimmedValue;
            break;
          case 'CORRECT_OPTION':
            question.correctOption = trimmedValue;
            break;
          case 'EXPLANATION':
            question.explanation = trimmedValue;
            break;
          case 'BLOOM_LEVEL':
            question.bloomLevel = trimmedValue;
            break;
          default:
            if (key.startsWith('OPTION_') && !key.endsWith('_ID')) {
              question.options.push(trimmedValue);
            }
            break;
        }
      }

      if (Object.keys(question).length > 0 && 
          question.topic && 
          question.questionText && 
          question.options.length > 0) {
        questions.push(question as OpenAIResponse);
      }
    } catch (error) {
      console.error('Error parsing question block:', error);
    }
  }

  return questions;
};