import { supabase } from "@/integrations/supabase/client";
import { MCQ } from "@/types/mcq";

export interface OpenAIResponse extends Omit<MCQ, 'id' | 'isSelected'> {
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

export const generateQuestions = async (content: string, unitTitle: string): Promise<MCQ[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-questions', {
      body: { content, unitTitle },
    });

    if (error) {
      console.error('[generateQuestions] Error from Supabase function:', error);
      throw error;
    }

    const rawQuestions = data.questions;
    const parsedQuestions = parseOpenAIResponse(rawQuestions, unitTitle);
    // Convert OpenAIResponse to MCQ by adding required properties
    const questions: MCQ[] = parsedQuestions.map(q => ({
      ...q,
      id: crypto.randomUUID(),
      isSelected: false,
      code: q.code || '', // Ensure code is never undefined
    }));
    return questions;
  } catch (error) {
    console.error('[generateQuestions] Error:', error);
    throw error;
  }
};

export const generateVariants = async (baseQuestion: MCQ): Promise<MCQ[]> => {
  try {
    console.log('[generateVariants] Starting variant generation for question:', baseQuestion.questionKey);
    
    const { data, error } = await supabase.functions.invoke('generate-variants', {
      body: { baseQuestion },
    });

    if (error) {
      console.error('[generateVariants] Error from Supabase function:', error);
      throw error;
    }

    if (!data?.rawResponse) {
      console.error('[generateVariants] Invalid response format from generate-variants function');
      throw new Error('Invalid response format from generate-variants function');
    }
    
    const parsedVariants = parseOpenAIResponse(data.rawResponse, baseQuestion.unitTitle);
    // Convert OpenAIResponse to MCQ by adding required properties
    const variants: MCQ[] = parsedVariants.map(v => ({
      ...v,
      id: crypto.randomUUID(),
      isSelected: false,
      code: v.code || '', // Ensure code is never undefined
    }));
    
    console.log('[generateVariants] Successfully generated variants for question:', baseQuestion.questionKey);
    return variants;
  } catch (error) {
    console.error('[generateVariants] Error:', error);
    throw error;
  }
};

const parseOpenAIResponse = (response: string, unitTitle: string): OpenAIResponse[] => {
  const questions: OpenAIResponse[] = [];
  if (!response) {
    console.error('[parseOpenAIResponse] Empty response received');
    return questions;
  }

  const questionBlocks = response.split('-END-').filter(block => block && block.trim());

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
      const question: any = {
        options: [],
        unitTitle: unitTitle
      };

      for (const match of matches) {
        if (!match || match.length < 2) continue;

        const key = match[1]?.trim();
        const value = match[0]?.substring(match[1].length + 1)?.trim();
        
        if (!key || !value) continue;
        
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
        console.error('[parseOpenAIResponse] Invalid question - missing required fields:', {
          hasTopic: !!question.topic,
          hasConcept: !!question.concept,
          hasQuestionKey: !!question.questionKey,
          hasQuestionText: !!question.questionText,
          optionsLength: question.options.length,
          hasUnitTitle: !!question.unitTitle
        });
      }
    } catch (error) {
      console.error('[parseOpenAIResponse] Error parsing question block:', error);
    }
  }
  
  return questions;
};