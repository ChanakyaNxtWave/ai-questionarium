import { supabase } from "@/integrations/supabase/client";
import { MCQ } from "@/types/mcq";

export interface OpenAIResponse {
  topic: string;
  concept: string;
  questionKey: string;
  baseQuestionKeys?: string;
  questionText: string;
  learningOutcome: string;
  contentType: 'HTML' | 'MARKDOWN';
  questionType: MCQ['questionType'];
  code?: string;
  codeLanguage?: string;
  options: string[];
  correctOption?: string;
  explanation?: string;
  bloomLevel: string;
  // Additional fields for different question types
  input?: string;
  output?: string;
  dbUrl?: string;
  testUrl?: string;
  tablesUsed?: string[];
  displayOrders?: number[];
  correctOrders?: number[];
}

export const generateQuestions = async (content: string, unitId: string): Promise<MCQ[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-questions', {
      body: { content, unitId },
    });

    if (error) {
      console.error('[generateQuestions] Error from Supabase function:', error);
      throw error;
    }

    const rawQuestions = data.questions;
    const parsedQuestions = parseOpenAIResponse(rawQuestions, unitId);
    
    // Store questions in the database
    for (const question of parsedQuestions) {
      await storeQuestion(question);
    }

    return parsedQuestions;
  } catch (error) {
    console.error('[generateQuestions] Error:', error);
    throw error;
  }
};

const storeQuestion = async (question: MCQ) => {
  try {
    // 1. Insert the main question
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .insert({
        id: question.id,
        unit_id: question.unitId,
        question_type: question.questionType,
        question_key: question.questionKey,
        base_question_keys: question.baseQuestionKeys,
        question_text: question.questionText,
        content_type: question.contentType,
        code: question.code,
        code_language: question.codeLanguage,
        learning_outcome: question.learningOutcome,
        explanation: question.explanation,
        bloom_level: question.bloomLevel
      })
      .select('id')
      .single();

    if (questionError) throw questionError;

    // 2. Insert options if present
    if (question.options && question.options.length > 0) {
      const { error: optionsError } = await supabase
        .from('options')
        .insert(
          question.options.map(opt => ({
            question_id: questionData.id,
            option_text: opt.text,
            option_order: opt.order,
            is_correct: opt.isCorrect
          }))
        );

      if (optionsError) throw optionsError;
    }

    // 3. Insert FIB answers if present
    if (question.fibAnswers && question.fibAnswers.length > 0) {
      const { error: fibError } = await supabase
        .from('fill_in_blank_answers')
        .insert(
          question.fibAnswers.map(fib => ({
            question_id: questionData.id,
            blank_position: fib.position,
            correct_answer: fib.correctAnswer,
            expected_output: fib.expectedOutput
          }))
        );

      if (fibError) throw fibError;
    }

    // 4. Insert rearrangement steps if present
    if (question.rearrangeSteps && question.rearrangeSteps.length > 0) {
      const { error: stepsError } = await supabase
        .from('rearrangement_steps')
        .insert(
          question.rearrangeSteps.map(step => ({
            question_id: questionData.id,
            step_text: step.text,
            display_order: step.displayOrder,
            correct_order: step.correctOrder
          }))
        );

      if (stepsError) throw stepsError;
    }

    // 5. Insert code analysis output if present
    if (question.codeAnalysis && question.codeAnalysis.length > 0) {
      const { error: analysisError } = await supabase
        .from('code_analysis_expected_output')
        .insert(
          question.codeAnalysis.map(analysis => ({
            question_id: questionData.id,
            input_case: analysis.inputCase,
            expected_output: analysis.expectedOutput
          }))
        );

      if (analysisError) throw analysisError;
    }

    // 6. Insert external resources if present
    if (question.externalResources) {
      const { error: resourceError } = await supabase
        .from('external_resources')
        .insert({
          question_id: questionData.id,
          db_url: question.externalResources.dbUrl,
          test_url: question.externalResources.testUrl,
          tables_used: question.externalResources.tablesUsed
        });

      if (resourceError) throw resourceError;
    }

  } catch (error) {
    console.error('[storeQuestion] Error storing question:', error);
    throw error;
  }
};

const parseOpenAIResponse = (response: string, unitId: string): MCQ[] => {
  const questions: MCQ[] = [];
  if (!response) {
    console.error('[parseOpenAIResponse] Empty response received');
    return questions;
  }

  const questionBlocks = response.split('-END-').filter(block => block && block.trim());

  for (const block of questionBlocks) {
    try {
      const fields = [
        'TOPIC', 'CONCEPT', 'NEW_CONCEPTS', 'QUESTION_ID', 'QUESTION_KEY',
        'BASE_QUESTION_KEYS', 'QUESTION_TEXT', 'QUESTION_TYPE', 'LEARNING_OUTCOME',
        'CODE', 'CONTENT_TYPE', 'CODE_LANGUAGE', 'CORRECT_OPTION', 'BLOOM_LEVEL',
        'EXPLANATION', 'TAG_NAMES', 'OPTION_\\d+', 'OPTION_\\d+_ID', 'INPUT',
        'OUTPUT', 'INPUT_\\d+', 'INPUT_\\d+_ID', 'OUTPUT_\\d+', 'OPT\\d+_ID',
        'OPT_\\d+_DSPLY_ORDER', 'OPT_\\d+_CRT_ORDER'
      ].join('|');
    
      const pattern = new RegExp(`(${fields}):[\\s\\S]*?(?=(${fields}):|$)`, 'g');
    
      const matches = Array.from(block.matchAll(pattern));
      const question: any = {
        options: [],
        unitTitle: unitId
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

      // Convert the extracted data into the new MCQ format
      const mcq: MCQ = {
        id: crypto.randomUUID(),
        unitId,
        questionType: question.questionType as MCQ['questionType'],
        questionKey: question.questionKey,
        baseQuestionKeys: question.baseQuestionKeys,
        questionText: question.questionText,
        contentType: question.contentType as 'HTML' | 'MARKDOWN',
        code: question.code,
        codeLanguage: question.codeLanguage,
        learningOutcome: question.learningOutcome,
        explanation: question.explanation,
        bloomLevel: question.bloomLevel,
        options: []
      };

      // Process options based on question type
      if (question.options) {
        mcq.options = question.options.map((opt, index) => ({
          id: crypto.randomUUID(),
          text: opt,
          order: index + 1,
          isCorrect: question.correctOption === `OPTION_${index + 1}`
        }));
      }

      // Add type-specific data
      if (question.questionType === 'FIB_CODING' || question.questionType === 'FIB_SQL_CODING') {
        mcq.fibAnswers = [
          {
            position: 1,
            correctAnswer: question.correctOption,
            expectedOutput: question.output
          }
        ];
      }

      if (question.questionType === 'REARRANGE') {
        mcq.rearrangeSteps = question.options.map((step, index) => ({
          text: step,
          displayOrder: question.displayOrders?.[index] || index + 1,
          correctOrder: question.correctOrders?.[index] || index + 1
        }));
      }

      if (question.questionType === 'CODE_ANALYSIS_TEXTUAL') {
        mcq.codeAnalysis = [{
          inputCase: question.input,
          expectedOutput: question.output
        }];
      }

      if (question.questionType === 'FIB_SQL_CODING') {
        mcq.externalResources = {
          dbUrl: question.dbUrl || '',
          testUrl: question.testUrl || '',
          tablesUsed: question.tablesUsed?.split(',') || []
        };
      }

      questions.push(mcq);
    } catch (error) {
      console.error('[parseOpenAIResponse] Error parsing question block:', error);
    }
  }
  
  return questions;
};
