
import { supabase } from "@/integrations/supabase/client";
import { MCQ } from "@/types/mcq";
import { generateUniqueQuestionKey } from "./questionKeyGenerator";

export const storeQuestion = async (question: MCQ) => {
  try {
    const uniqueQuestionKey = await generateUniqueQuestionKey(question.questionKey);
    
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .insert({
        id: question.id,
        unit_id: question.unitId,
        question_type: question.questionType,
        question_key: uniqueQuestionKey,
        base_question_keys: question.baseQuestionKeys,
        question_text: question.questionText,
        content_type: question.contentType,
        code: question.code,
        code_language: question.codeLanguage,
        learning_outcome: question.learningOutcome,
        explanation: question.explanation,
        bloom_level: question.bloomLevel || 'UNDERSTAND',
        category: question.category || 'BASE'
      })
      .select('id')
      .single();

    if (questionError) throw questionError;

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
