import { supabase } from "@/integrations/supabase/client";

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
    const { data, error } = await supabase.functions.invoke('generate-questions', {
      body: { content, unitTitle },
    });

    if (error) {
      console.error('Error from Supabase function:', error);
      throw error;
    }

    const rawQuestions = data.questions;
    const questions = parseOpenAIResponse(rawQuestions, unitTitle);
    
    return questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
};

export const generateVariants = async (baseQuestion: OpenAIResponse): Promise<OpenAIResponse[]> => {
  try {
    console.log("Generating variants for base question:", baseQuestion);
    
    const { data, error } = await supabase.functions.invoke('generate-variants', {
      body: { baseQuestion },
    });

    if (error) {
      console.error('Error from Supabase function:', error);
      throw error;
    }

    console.log("Raw response from generate-variants function:", data);

    if (!data?.questions) {
      console.error('No questions data in response:', data);
      throw new Error('Invalid response format from generate-variants function');
    }

    const rawQuestions = data.questions;
    console.log("Questions content to parse:", rawQuestions);
    
    const variants = parseOpenAIResponse(rawQuestions, baseQuestion.unitTitle);
    console.log("Parsed variants:", variants);

    // Store variants in the database
    for (const variant of variants) {
      if (!variant.correctOption) {
        console.error('Variant missing correct_option:', variant);
        continue;
      }

      const { error: insertError } = await supabase
        .from('generated_questions')
        .insert({
          topic: variant.topic,
          concept: variant.concept,
          question_key: variant.questionKey,
          question_text: variant.questionText,
          learning_outcome: variant.learningOutcome,
          content_type: variant.contentType,
          question_type: variant.questionType,
          code: variant.code || null,
          code_language: variant.codeLanguage || null,
          options: variant.options,
          correct_option: variant.correctOption,
          explanation: variant.explanation,
          bloom_level: variant.bloomLevel,
          unit_title: variant.unitTitle,
          question_category: 'VARIANT'
        });

      if (insertError) {
        console.error('Error storing variant:', insertError);
      }
    }
    
    return variants;
  } catch (error) {
    console.error('Error generating variants:', error);
    throw error;
  }
};

const parseOpenAIResponse = (response: string, unitTitle: string): OpenAIResponse[] => {
  const questions: OpenAIResponse[] = [];
  if (!response) {
    console.error('Empty response received');
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
        unitTitle: unitTitle // Add unit title to each question
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
  return questions;
};