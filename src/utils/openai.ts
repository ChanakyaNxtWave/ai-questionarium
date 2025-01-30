import { supabase } from "@/integrations/supabase/client";
import { MCQ } from "@/types/mcq";

interface OpenAIResponse {
  id: string;
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
    console.log("Generating questions with content:", content, "and unitTitle:", unitTitle);
    
    const { data, error } = await supabase.functions.invoke('generate-questions', {
      body: { content, unitTitle },
    });

    if (error) {
      console.error('Error from Supabase function:', error);
      throw error;
    }

    console.log("Raw response from generate-questions:", data);
    const rawQuestions = data.questions;
    const questions = parseOpenAIResponse(rawQuestions, unitTitle);
    console.log("Parsed questions:", questions);
    
    return questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
};

export const generateVariants = async (baseQuestion: MCQ): Promise<OpenAIResponse[]> => {
  try {
    console.log("Generating variants for base question:", baseQuestion);
    
    const { data, error } = await supabase.functions.invoke('generate-variants', {
      body: { baseQuestion },
    });

    if (error) {
      console.error('Error from Supabase function:', error);
      throw error;
    }

    if (!data?.rawResponse) {
      console.error('No raw response in data:', data);
      throw new Error('Invalid response format from generate-variants function');
    }

    console.log("Raw variants response:", data.rawResponse);
    
    // Parse the variants response using the existing parseOpenAIResponse function
    const variants = parseOpenAIResponse(data.rawResponse, baseQuestion.unitTitle);

    console.log("Parsed variants:", variants);
    return variants;
  } catch (error) {
    console.error('Error generating variants:', error);
    throw error;
  }
};

const parseOpenAIResponse = (response: string, unitTitle: string): OpenAIResponse[] => {
  console.log("Parsing OpenAI response:", response);
  
  const questions: OpenAIResponse[] = [];
  if (!response) {
    console.error('Empty response received');
    return questions;
  }

  const questionBlocks = response.split('-END-').filter(block => block && block.trim());
  console.log("Question blocks:", questionBlocks);

  const fields = [
    'TOPIC', 'CONCEPT', 'NEW_CONCEPTS', 'QUESTION_ID', 'QUESTION_KEY',
    'BASE_QUESTION_KEYS', 'QUESTION_TEXT', 'QUESTION_TYPE', 'LEARNING_OUTCOME',
    'CODE', 'CONTENT_TYPE', 'CODE_LANGUAGE', 'CORRECT_OPTION', 'BLOOM_LEVEL',
    'EXPLANATION', 'TAG_NAMES', 'OPTION_\\d+', 'OPTION_\\d+_ID', 'INPUT',
    'OUTPUT', 'INPUT_\\d+', 'INPUT_\\d+_ID', 'OUTPUT_\\d+', 'OPT\\d+_ID',
    'OPT_\\d+_DSPLY_ORDER', 'OPT_\\d+_CRT_ORDER'
  ].join('|');

  const pattern = new RegExp(`(${fields}):[\\s\\S]*?(?=(${fields}):|$)`, 'g');

  for (const block of questionBlocks) {
    try {
      const matches = Array.from(block.matchAll(pattern));
      console.log("Matches for block:", matches);
      
      const question: any = {
        options: [],
        unitTitle: unitTitle
      };

      for (const match of matches) {
        if (!match || match.length < 2) {
          console.log('Invalid match found, skipping:', match);
          continue;
        }

        const key = match[1]?.trim();
        const value = match[0]?.substring(match[1].length + 1)?.trim();
        
        if (!key || !value) {
          console.log('Missing key or value, skipping match');
          continue;
        }
        
        switch (key) {
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
            question.code = value === 'NA' ? null : value;
            break;
          case 'CODE_LANGUAGE':
            question.codeLanguage = value;
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
          default:
            if (key.startsWith('OPTION_') && !key.endsWith('_ID')) {
              question.options.push(value);
            }
            break;
        }
      }

      console.log("Parsed question:", question);

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
      } else {
        console.log('Skipping invalid question - missing required fields:', {
          hasTopic: !!question.topic,
          hasConcept: !!question.concept,
          hasQuestionKey: !!question.questionKey,
          hasQuestionText: !!question.questionText,
          optionsLength: question.options.length,
          hasUnitTitle: !!question.unitTitle
        });
      }
    } catch (error) {
      console.error('Error parsing question block:', error);
    }
  }
  
  console.log("Final parsed questions:", questions);
  return questions;
};
