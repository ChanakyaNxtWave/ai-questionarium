
import { MCQ } from "@/types/mcq";

export const parseOpenAIResponse = (response: string, unitId: string): MCQ[] => {
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
        unitId,
        bloomLevel: 'UNDERSTAND',
        category: 'BASE'
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
            question.bloomLevel = value || 'UNDERSTAND';
            break;
          default:
            if (key.startsWith('OPTION_') && !key.endsWith('_ID')) {
              question.options.push(value);
            }
            break;
        }
      }

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
        category: question.category as 'BASE' | 'VARIANT' | 'OTHER',
        options: []
      };

      if (question.options) {
        mcq.options = question.options.map((opt: string, index: number) => ({
          id: crypto.randomUUID(),
          text: opt,
          order: index + 1,
          isCorrect: question.correctOption === `OPTION_${index + 1}`
        }));
      }

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
        mcq.rearrangeSteps = question.options.map((step: string, index: number) => ({
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
