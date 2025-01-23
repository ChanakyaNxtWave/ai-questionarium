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
  unitTitle: string;
}

export const generateQuestions = async (content: string, unitTitle: string): Promise<OpenAIResponse[]> => {
  try {
    console.log('Sending content to generate questions:', content);
    
    const { data, error } = await supabase.functions.invoke('generate-questions', {
      body: { content, unitTitle },
    });

    if (error) {
      console.error('Error from Supabase function:', error);
      throw error;
    }

    console.log('Raw response from OpenAI:', data);
    console.log('Questions from response:', data.questions);

    const rawQuestions = data.questions;
    const questions = parseOpenAIResponse(rawQuestions, unitTitle);
    
    console.log('Parsed questions:', questions);
    return questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
};

const parseOpenAIResponse = (response: string, unitTitle: string): OpenAIResponse[] => {
  console.log('Starting to parse response:', response);
  
  const questions: OpenAIResponse[] = [];
  const questionBlocks = response.split('-END-').filter(block => block.trim());
  
  console.log('Question blocks after splitting:', questionBlocks);

  const pattern = /(TOPIC|CONCEPT|NEW_CONCEPTS|QUESTION_ID|QUESTION_KEY|BASE_QUESTION_KEYS|QUESTION_TEXT|QUESTION_TYPE|LEARNING_OUTCOME|CODE|CONTENT_TYPE|CODE_LANGUAGE|CORRECT_OPTION|BLOOM_LEVEL|EXPLANATION|TAG_NAMES|OPTION_\d+|OPTION_\d+_ID|INPUT|OUTPUT|INPUT_\d+|INPUT_\d+_ID|OUTPUT_\d+|OPT\d+_ID|OPT_\d+_DSPLY_ORDER|OPT_\d+_CRT_ORDER):([\s\S]*?)(?=(TOPIC|CONCEPT|NEW_CONCEPTS|QUESTION_ID|QUESTION_KEY|BASE_QUESTION_KEYS|QUESTION_TEXT|QUESTION_TYPE|LEARNING_OUTCOME|CODE|CONTENT_TYPE|CODE_LANGUAGE|CORRECT_OPTION|BLOOM_LEVEL|EXPLANATION|TAG_NAMES|OPTION_\d+|OPTION_\d+_ID|INPUT|OUTPUT|INPUT_\d+|INPUT_\d+_ID|OUTPUT_\d+|OPT\d+_ID|OPT_\d+_DSPLY_ORDER|OPT_\d+_CRT_ORDER):|$)/g);

  for (const block of questionBlocks) {
    try {
      console.log('Processing block:', block);
      
      const matches = Array.from(block.matchAll(pattern));
      console.log('Regex matches:', matches);
      
      const question: any = {
        options: [],
        unitTitle: unitTitle // Add unit title to each question
      };

      for (const match of matches) {
        const [, key, value] = match;
        const trimmedValue = value.trim();
        
        console.log('Processing match - Key:', key, 'Value:', trimmedValue);

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
              console.log('Added option:', trimmedValue);
            }
            break;
        }
      }

      console.log('Constructed question object:', question);

      // Only add questions that have all required fields
      if (
        question.topic &&
        question.concept &&
        question.questionKey &&
        question.questionText &&
        question.options.length > 0 &&
        question.unitTitle
      ) {
        questions.push(question as OpenAIResponse);
        console.log('Added valid question to results');
      } else {
        console.log('Skipping invalid question - missing required fields');
      }
    } catch (error) {
      console.error('Error parsing question block:', error);
    }
  }

  console.log('Final parsed questions:', questions);
  return questions;
};